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

const RegisterStudent = () => {
  const validationSchema = Yup.object({
    name: Yup.string().required("Required"),
    matricNo: Yup.string().required("Required"),
    course: Yup.string().required("Required"),
  });

  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const savedCourses = loadFromDatabase(databaseKeys.COURSES) || [];
    setCourses(savedCourses);
  }, []);

  const videoRef = useRef(null);

  const handleSubmit = async (values, { resetForm }) => {
    const { matricNo } = values;
    const students = loadFromDatabase(databaseKeys.STUDENTS) || [];

    if (students.some((student) => student.matricNo === matricNo)) {
      toast.error("Student already exists");
      return;
    }

    const newStudentFaceData = await registerFace();
    if (!newStudentFaceData) return;

    const newStudent = {
      ...values,
      id: Date.now(),
      faceData: newStudentFaceData,
    };

    saveToDatabase(databaseKeys.STUDENTS, [...students, newStudent]);
    toast.success(`${newStudent.name} has been registered successfully!`);
    resetForm();
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
    <div className="max-w-2xl mx-auto p-6 min-h-screen">
      <h1 className="text-2xl font-bold text-purple-600 mb-6">
        Student Registration
      </h1>
      <Formik
        initialValues={{ name: "", matricNo: "", course: "" }}
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
              <label className="block text-gray-700 mb-2">Course</label>
              <Field
                as="select"
                name="course"
                className="w-full p-2 border rounded-lg"
                onChange={(e) => setFieldValue("course", e.target.value)}
              >
                <option value="">Select a course</option>
                {courses.map((course, index) => (
                  <option key={index} value={course}>
                    {course}
                  </option>
                ))}
              </Field>
              <ErrorMessage
                name="course"
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
