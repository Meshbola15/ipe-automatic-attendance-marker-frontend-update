// src/pages/RegisterStudent.jsx
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { loadFromDatabase, saveToDatabase, databaseKeys } from "../utils/database";
import * as faceapi from "face-api.js";
import CameraWidget from "../components/CameraWidget";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { uid } from "uid";
import useSound from "use-sound";
import successSound from "../assets/sound.mp3";
import LoadingScreen from "../components/loadingScreen";
import { FiUserPlus, FiUser, FiHash, FiBook } from "react-icons/fi";

const RegisterStudent = () => {
  const [play] = useSound(successSound);
  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    matricNo: Yup.string().required("Matric number is required"),
    department: Yup.string().required("Department is required"),
  });

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFromDatabase(databaseKeys.DEPARTMENTS).then((data) => setDepartments(Array.isArray(data) ? data : []));
  }, []);

  const videoRef = useRef(null);

  const handleSubmit = async (values, { resetForm }) => {
    setLoading(true);
    const { matricNo, department } = values;
    const students = (await loadFromDatabase(databaseKeys.STUDENTS)) || [];

    if (students.some((student) => student.matricNo === matricNo)) {
      toast.error("A student with this matric number is already registered.");
      setLoading(false);
      return;
    }

    const newStudentFaceData = await registerFace();
    if (!newStudentFaceData) return;

    if (students.length > 0) {
      const sameDeptStudents = students.filter((s) => s.department === department);
      const labeledDescriptors = sameDeptStudents.map((student) => {
        const storedArray = new Float32Array(Object.values(student.faceData));
        return new faceapi.LabeledFaceDescriptors(student.name, [storedArray]);
      });

      if (labeledDescriptors.length > 0) {
        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.35);
        const bestMatch = faceMatcher.findBestMatch(newStudentFaceData);
        if (bestMatch.label !== "unknown") {
          toast.error(`Face already registered for another ${department} student.`);
          setLoading(false);
          return;
        }
      }
    }

    const newStudent = { ...values, id: uid(), faceData: newStudentFaceData };
    saveToDatabase(databaseKeys.STUDENTS, newStudent);
    toast.success(`${newStudent.name} registered successfully!`);
    play();
    setLoading(false);
    resetForm();
  };

  const registerFace = async () => {
    if (!videoRef.current || videoRef.current.readyState !== 4) {
      setLoading(false);
      toast.error("Camera not ready. Please wait.");
      return;
    }

    const detections = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detections) {
      toast.error("No face detected. Please align your face and try again.");
      setLoading(false);
      return null;
    }

    return detections.descriptor;
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-0 sm:px-4 md:px-0">
      {loading && <LoadingScreen />}

      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title">Register Student</h1>
        <p className="page-subtitle">Capture a face and fill in student details to register</p>
      </div>

      <Formik
        initialValues={{ name: "", matricNo: "", department: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue }) => (
          <Form className="space-y-5">
            {/* Camera section */}
            <div className="card">
              <p className="text-sm font-semibold text-slate-700 mb-1">Face Capture</p>
              <p className="text-xs text-slate-500 mb-4">Align your face clearly within the camera frame</p>
              <CameraWidget videoRef={videoRef} />
            </div>

            {/* Fields */}
            <div className="card space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <Field name="name" type="text" placeholder="Enter student's full name" className="input pl-10" />
                </div>
                <ErrorMessage name="name" component="p" className="text-red-500 text-xs mt-1" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Matric Number</label>
                <div className="relative">
                  <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <Field name="matricNo" type="text" placeholder="e.g. CSC/2021/001" className="input pl-10 font-mono" />
                </div>
                <ErrorMessage name="matricNo" component="p" className="text-red-500 text-xs mt-1" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
                <div className="relative">
                  <FiBook className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                  <Field
                    as="select"
                    name="department"
                    className="input pl-10 appearance-none"
                    onChange={(e) => setFieldValue("department", e.target.value)}
                  >
                    <option value="">Select a department</option>
                    {departments.map((dept, index) => (
                      <option key={index} value={dept?.name}>{dept.name}</option>
                    ))}
                  </Field>
                </div>
                <ErrorMessage name="department" component="p" className="text-red-500 text-xs mt-1" />
              </div>

              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                <FiUserPlus size={16} /> Register Student
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default RegisterStudent;
