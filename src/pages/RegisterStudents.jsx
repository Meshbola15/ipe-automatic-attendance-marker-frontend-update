// src/pages/RegisterStudent.jsx
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  loadFromDatabase,
  saveToDatabase,
  databaseKeys,
} from "../utils/database";
import * as faceapi from "face-api.js";
import CameraWidget from "../components/CameraWidget";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { uid } from "uid";
import useSound from "use-sound";
import successSound from "../assets/sound.mp3";
import LoadingScreen from "../components/loadingScreen";

const RegisterStudent = () => {
  const [play] = useSound(successSound);
  const validationSchema = Yup.object({
    name: Yup.string().required("Required"),
    matricNo: Yup.string().required("Required"),
    department: Yup.string().required("Required"),
  });

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadFromDatabase(databaseKeys.DEPARTMENTS).then(data => {
      setDepartments(data);
    })
  }, []);

  const videoRef = useRef(null);

  const handleSubmit = async (values, { resetForm }) => {
    setLoading(true);
    try {
      const { matricNo } = values;
      const students = await loadFromDatabase(databaseKeys.STUDENTS) || [];
  
      if (students.some((student) => student.matricNo === matricNo)) {
        toast.error("Student already exists");
        return;
      }
  
      const newDescriptor = await registerFace();
      if (!newDescriptor) return;
  
      if (students.length) {
        console.log(students)
        const labeledDescriptors = students.map((student) => {
          const storedArray = new Float32Array(Object.values(student.faceData));
          return new faceapi.LabeledFaceDescriptors(student.name, [storedArray]);
        });
  
        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
        const bestMatch = faceMatcher.findBestMatch(newDescriptor);
  
        if (bestMatch.label !== "unknown") {
          toast.error("Face already registered to another student.");
          return;
        }
      }
  
      const newStudent = {
        ...values,
        id: uid(),
        faceData: newDescriptor,
      };
  
      await saveToDatabase(databaseKeys.STUDENTS, newStudent);
      play();
      toast.success(`${newStudent.name} has been registered successfully!`);
      resetForm();
    } catch (error) {
      toast.error("An unexpected error occurred.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  

  const registerFace = async () => {
    if (!videoRef.current) {
      toast.error("Camera is not available.");
      return null;
    }

    const detections = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detections) {
      toast.error("No face detected. Please try again!");
      return null;
    }

    return detections.descriptor;
  };

  return (
    <div className="max-w-2xl mx-auto min-h-screen mt-6">
      {loading && <LoadingScreen />}
      <h1 className="text-2xl font-bold text-purple-600 mb-6">
        Student Registration
      </h1>
      <Formik
        initialValues={{ name: "", matricNo: "", department: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue }) => (
          <Form className="space-y-6 bg-white p-6 rounded-xl shadow-lg">
            <div>
              <label className="block text-gray-700 mb-2">
                Please align your face with the camera
              </label>
              <CameraWidget videoRef={videoRef} />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Full Name</label>
              <Field
                name="name"
                type="text"
                className="w-full p-2 border rounded-lg"
              />
              <ErrorMessage
                name="name"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Matric Number</label>
              <Field
                name="matricNo"
                type="text"
                className="w-full p-2 border rounded-lg"
              />
              <ErrorMessage
                name="matricNo"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Department</label>
              <Field
                as="select"
                name="department"
                className="w-full p-2 border rounded-lg"
                onChange={(e) => setFieldValue("department", e.target.value)}
              >
                <option value="">Select a department</option>
                {departments.map((department, index) => (
                  <option key={index} value={department?.name}>
                    {department.name}
                  </option>
                ))}
              </Field>
              <ErrorMessage
                name="department"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700"
            >
              Register Student
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default RegisterStudent;
