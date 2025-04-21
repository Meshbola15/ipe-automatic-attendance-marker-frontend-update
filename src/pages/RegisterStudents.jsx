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
    setLoading(true)
    const { matricNo, department } = values;
    const students = await loadFromDatabase(databaseKeys.STUDENTS) || [];
    console.log(students)

    if (students.some((student) => student.matricNo === matricNo)) {
      toast.error("Student already exists");
      setLoading(false)
      return;
    }

    const newStudentFaceData = await registerFace(); // Must return a Float32Array
    if (!newStudentFaceData) return;

    if (students.length > 0) {
      const labeledDescriptors = students
        .filter(student => department === student.department) // this returns a boolean
        .map(student => {
          const storedArray = new Float32Array(Object.values(student.faceData));
          return new faceapi.LabeledFaceDescriptors(student.name, [storedArray]);
        });


      if (labeledDescriptors.length > 0) {
        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.44);
        const bestMatch = faceMatcher.findBestMatch(newStudentFaceData);

        if (bestMatch.label !== 'unknown') {
          toast.error("Face already exists!");
          setLoading(false)
          return;
        }
      }
    }

    const newStudent = {
      ...values,
      id: uid(),
      faceData: newStudentFaceData,
    };

    saveToDatabase(databaseKeys.STUDENTS, newStudent);
    toast.success(`${newStudent.name} has been registered successfully!`);
    play()
    setLoading(false)
    resetForm();
  };


  const registerFace = async () => {
    if (!videoRef.current || videoRef.current.readyState !== 4) {
      setLoading(false)
      console.log("Video not ready");
      toast.error("Video not ready");
      return;
    }

    const detections = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detections) {
      toast.error("No face detected. Please try again!");
      setLoading(false)
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
