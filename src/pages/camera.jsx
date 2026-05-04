import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
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
  const { id: lecturerId } = useParams();
  const [play] = useSound(successSound);
  const videoRef = useRef(null);
  const [allAttendanceLists, setAllAttendanceLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);

  // Only show this lecturer's sessions on the camera page
  const attendanceLists = allAttendanceLists.filter((s) => s.lecturerId === lecturerId);

  const handleVerifyEntry = async (freshSession, matchedStudent) => {
    if (!freshSession || !matchedStudent) return;

    const existingEntry = freshSession.attendees?.find(
      (a) => a.matricNo === matchedStudent.matricNo
    );

    // Already verified — skip
    if (existingEntry?.verifiedByAI) return;

    const now = new Date();
    const updatedAttendees = (freshSession.attendees || []).map((a) =>
      a.matricNo === matchedStudent.matricNo
        ? { ...a, status: "Present", verifiedByAI: true, verifiedAt: now.toLocaleTimeString() }
        : a
    );

    const updatedList = { ...freshSession, attendees: updatedAttendees };

    try {
      await saveToDatabase(databaseKeys.ATTENDANCE, updatedList);
      setSelectedList(updatedList);
      play();
      getAttendanceLists();
      toast.success(`${matchedStudent.name} verified as Present!`);
    } catch (error) {
      console.error("Failed to verify attendance:", error);
      toast.error("Failed to save verification");
    }
  };

  const getAttendanceLists = async () => {
    const data = await loadFromDatabase(databaseKeys.ATTENDANCE);
    setAllAttendanceLists(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    getAttendanceLists();
  }, []);

  const recognizeFace = async () => {
    if (!videoRef.current || videoRef.current.readyState !== 4) {
      console.log("Video not ready");
      return;
    }

    const allStudents = (await loadFromDatabase(databaseKeys.STUDENTS)) || [];
    if (!allStudents.length) {
      toast.error("No registered students found.");
      return;
    }

    // Get the latest session state from DB
    const freshSessions = (await loadFromDatabase(databaseKeys.ATTENDANCE)) || [];
    const freshSession = (Array.isArray(freshSessions) ? freshSessions : []).find(
      (s) => s.id === selectedList?.id
    );
    if (!freshSession) return;

    // Only match Pending self-check-ins for this session's department
    const pendingMatricNos = new Set(
      (freshSession.attendees || [])
        .filter((a) => a.status === "Pending")
        .map((a) => a.matricNo)
    );

    const candidateStudents = allStudents.filter(
      (s) =>
        s.department === freshSession.department &&
        pendingMatricNos.has(s.matricNo)
    );

    if (!candidateStudents.length) {
      toast.info("No pending self-check-ins to verify in this session.");
      return;
    }

    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 512,
      scoreThreshold: 0.4,
    });

    const detections = await faceapi
      .detectAllFaces(videoRef.current, options)
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (!detections || detections.length === 0) {
      console.log("No face detected.");
      toast.error("No face detected");
      return;
    }

    console.log(`Detected ${detections.length} face(s), checking against ${candidateStudents.length} pending student(s)`);

    const labeledDescriptors = candidateStudents.map((student) => {
      const storedArray = new Float32Array(Object.values(student.faceData));
      return new faceapi.LabeledFaceDescriptors(student.name, [storedArray]);
    });

    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.5);

    detections.forEach((detection) => {
      const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

      if (bestMatch.label !== "unknown") {
        const matchedStudent = candidateStudents.find(
          (s) => s.name === bestMatch.label
        );

        if (matchedStudent) {
          // Upgrade Pending → Present
          handleVerifyEntry(freshSession, matchedStudent);
        }
      }
    });
  };

  const intervalRef = useRef(null);

  useEffect(() => {
    if (selectedList) {
      recognizeFace();
      intervalRef.current = setInterval(recognizeFace, 5000);
    } else {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [selectedList?.id]);

  return (
    <div className="w-full">
      {selectedList ? (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h1 className="page-title">Camera — Attendance Scanner</h1>
              <p className="page-subtitle !mb-0">
                Session: <span className="font-semibold text-violet-600">{selectedList?.fileName}</span>
              </p>
            </div>
            <button
              onClick={() => setSelectedList(null)}
              className="btn-secondary self-start sm:self-auto"
            >
              Change Session
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Camera widget */}
            <div className="lg:col-span-3" ref={videoRef}>
              <CameraWidget recognizeFace={recognizeFace} videoRef={videoRef} />

              {/* Detection active indicator */}
              <div className="mt-3 flex items-center gap-2 px-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-emerald-600">Detection active</span>
              </div>
            </div>

            {/* Live entries panel */}
            <div className="lg:col-span-2">
              <div className="card h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-slate-800">Live Entries</h2>
                  <span className="text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100 px-2.5 py-0.5 rounded-full">
                    {selectedList?.attendees?.length ?? 0} marked
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[480px] space-y-2 pr-1">
                  {selectedList?.attendees?.length > 0 ? (
                    [...(selectedList.attendees)].reverse().map((entry, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${
                          entry.status === "Present"
                            ? "bg-emerald-50 border-emerald-100"
                            : "bg-amber-50 border-amber-100"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                          entry.status === "Present" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {entry?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{entry?.name}</p>
                          <p className="text-xs text-slate-500">{entry?.matricNo}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className={entry.status === "Present" ? "badge-present" : "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200"}>
                            {entry.status === "Present" ? "✓ Verified" : "Pending"}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">{entry?.checkInTime || entry?.time}</p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                      <p className="text-sm">No check-ins yet</p>
                      <p className="text-xs mt-1">Students must self-check in first</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Session switcher */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-600 mb-3">Switch Session</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {attendanceLists.map((list, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedList(list)}
                  className={`px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                    selectedList?.id === list.id
                      ? "border-violet-400 bg-violet-50"
                      : "border-slate-100 bg-white hover:border-violet-200"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-800 truncate">{list?.fileName}</p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <FaUser size={10} className="text-violet-400" />
                    {list?.attendees?.length ?? 0} attendees
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div>
          <div className="mb-6">
            <h1 className="page-title">Camera — Attendance Scanner</h1>
            <p className="page-subtitle">Select an attendance session to begin marking</p>
          </div>

          {!attendanceLists || attendanceLists.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 text-slate-400">
              <FaUser size={36} className="mb-4 opacity-30" />
              <p className="text-base font-medium text-slate-600">No sessions available</p>
              <p className="text-sm mt-1 text-slate-500">Login as admin to create an attendance session</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {attendanceLists.map((list, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -2 }}
                  onClick={() => setSelectedList(list)}
                  className="card cursor-pointer border-2 border-transparent hover:border-violet-300 transition-all"
                >
                  <p className="font-semibold text-slate-800 text-sm truncate mb-1">{list?.fileName}</p>
                  <p className="text-xs text-slate-500 mb-3">{list?.date}</p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <FaUser size={11} className="text-violet-400" />
                    {list?.attendees?.length ?? 0} attendees
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CameraPage;
