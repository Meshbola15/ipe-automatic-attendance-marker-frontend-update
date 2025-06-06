import { useState, useEffect, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import useSound from "use-sound";
import successSound from "../assets/sound.mp3";
import {
  saveToDatabase,
  loadFromDatabase,
  databaseKeys,
} from "../utils/database";
import CameraWidget from "../components/CameraWidget";
import { toast } from "react-toastify";
import { FaUser } from "react-icons/fa6";
import * as faceapi from "face-api.js";

const CameraPage = () => {
  const [play] = useSound(successSound);
  const videoRef = useRef(null);
  const [attendanceLists, setAttendanceLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);

  const handleNewEntry = async (newEntry) => {
    if (!newEntry) return;
    console.log(newEntry)

    const alreadyMarked =
      selectedList?.attendees?.some(
        (entry) => entry.matricNo === newEntry.matricNo
      ) || false;

    if (alreadyMarked) {
      toast.error("Entry already exists");
      return;
    }

    const updatedList = {
      ...selectedList,
      attendees: [...(selectedList?.attendees || []), newEntry],
    };

    try {
      await saveToDatabase(databaseKeys.ATTENDANCE, updatedList);
      setSelectedList(updatedList);
      play()
      getAttendanceLists()
      toast.success(`${newEntry.name} has been marked Present!`);
    } catch (error) {
      console.error("Failed to save attendance:", error);
      toast.error("Failed to save attendance");
    }
  };

  const getAttendanceLists = async () => {
    await loadFromDatabase(databaseKeys.ATTENDANCE).then((data) => {
      setAttendanceLists(data);
    });
  };

  useEffect(() => {
    getAttendanceLists();
  }, []);

  const recognizeFace = async () => {
    if (!videoRef.current || videoRef.current.readyState !== 4) {
      console.log("Video not ready");
      return;
    }

    const students = (await loadFromDatabase(databaseKeys.STUDENTS)) || [];
    if (!students || !students?.length) {
      alert("No registered face found.");
      return;
    }

    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 512,
      scoreThreshold: 0.4,
    });

    // **Detect Multiple Faces**
    const detections = await faceapi
      .detectAllFaces(videoRef.current, options)
      .withFaceLandmarks()
      .withFaceDescriptors(); // This will detect multiple faces

    if (!detections || detections.length === 0) {
      console.log("No face detected.");
      toast.error("No face detected");
      return;
    }

    console.log(`Detected ${detections.length} faces`);

    // Convert stored students' face data into LabeledFaceDescriptors
    const labeledDescriptors = students.map((student) => {
      const storedArray = new Float32Array(Object.values(student.faceData));
      return new faceapi.LabeledFaceDescriptors(student?.name, [storedArray]);
    });

    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5);

    detections.forEach((detection) => {
      const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

      console.log(students)
      if (bestMatch.label !== "unknown") {
        const matchedStudent = students.find(
          (student) => student?.name === bestMatch.label
        );

        if (matchedStudent) {
          const newEntry = {
            id: Date.now(),
            name: matchedStudent?.name,
            matricNo: matchedStudent.matricNo,
            time: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString(),
            status: "Present",
          };

          handleNewEntry(newEntry);
        }
      } else {
        toast.error("Face detected but no match found.");
      }
    });
  };

  const [activeDetection, setActiveDetection] = useState(false);
  const intervalRef = useRef(null);

  const handleDetection = () => {
    if (!activeDetection) {
      recognizeFace();
      intervalRef.current = setInterval(() => {
        recognizeFace();
      }, 5000);
      setActiveDetection(true);
    } else {
      clearInterval(intervalRef.current);
      intervalRef.current = null; // Reset ref after clearing interval
      setActiveDetection(false);
    }
  };

  return (
    <div className="w-full mt-8">
      {selectedList ? (
        <div className="min-h-screen bg-purple-50 p-4 py-6 md:p-8 flex flex-col items-center">
          {/* Camera Widget */}
          <div className="w-full max-w-3xl" ref={videoRef}>
            <CameraWidget recognizeFace={recognizeFace} videoRef={videoRef} />
          </div>

          {/* Recent Entries Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 mt-6"
          >
            <h2 className="text-purple-600 text-xl font-bold mb-4 text-center">
              Recent Entries ({selectedList?.fileName})
            </h2>
            <div className="space-y-4">
              {selectedList?.attendees?.length > 0 ? (
                selectedList?.attendees?.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between items-center bg-purple-100 p-3 rounded-lg shadow-sm"
                  >
                    <span className="font-medium text-purple-700">
                      {entry?.name}
                    </span>
                    <span className="text-gray-600 text-sm">
                      {entry?.matricNo}
                    </span>
                    <span className="text-gray-500 text-sm">{entry?.time}</span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-6">
                  No recent entries detected yet
                </div>
              )}
            </div>
          </motion.div>

          {/* Simulate Detection Button */}

          <div className="flex flex-col flex-grow justify-center mt-[4rem] items-center gap-4">
            <h3 className="text-lg font-semibold">Select Attendance List</h3>
            <div className="p-2 border-2 flex flex-col gap-4 rounded-md border-purple-600">
              {attendanceLists.map((list, index) => (
                <div
                  onClick={() => {
                    setSelectedList(list);
                    // scroller.scrollTo('dashboard', {
                    //   smooth: true,
                    //   offset: -100
                    // })
                  }}
                  key={index}
                  className="w-full p-4 bg-gray-100 rounded-md cursor-pointer flex gap-8 font-medium justify-between"
                >
                  <p>{list?.fileName}</p>
                  <p className="flex items-center gap-2">
                    {list?.attendees?.length}{" "}
                    <FaUser className="text-purple-600" />
                  </p>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={handleDetection}
            className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-colors focus:outline-none"
          >
            {activeDetection ? "End Detection" : "Begin Detection"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col flex-grow justify-center items-center gap-4">
          <h3 className="text-lg font-semibold">Select Attendance List</h3>
          {!attendanceLists || attendanceLists?.length === 0 ? (
            <div>Login as admin to create a list</div>
          ) : (
            <div className="p-2 border-2 flex flex-col gap-4 rounded-md border-purple-600">
              {attendanceLists.map((list, index) => (
                <div
                  onClick={() => {
                    setSelectedList(list);
                    // scroller.scrollTo('dashboard', {
                    //   smooth: true,
                    //   offset: -100
                    // })
                  }}
                  key={index}
                  className="w-full p-4 bg-gray-100 rounded-md cursor-pointer flex gap-8 font-medium justify-between"
                >
                  <p>{list?.fileName}</p>
                  <p className="flex items-center gap-2">
                    {list?.attendees?.length}{" "}
                    <FaUser className="text-purple-600" />
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CameraPage;
