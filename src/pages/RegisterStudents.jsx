// src/pages/RegisterStudent.jsx
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { loadFromDatabase, saveToDatabase, databaseKeys } from "../utils/database";

const RegisterStudent = () => {
  const validationSchema = Yup.object({
    name: Yup.string().required('Required'),
    matricNo: Yup.string().required('Required'),
    course: Yup.string().required('Required'),
  });

  const handleSubmit = (values, { resetForm }) => {
    // Load existing students
    const students = loadFromDatabase(databaseKeys.STUDENTS) || [];
    const newStudent = { ...values, id: Date.now() };
    const updatedStudents = [...students, newStudent];

    // Save updated student list
    saveToDatabase(databaseKeys.STUDENTS, updatedStudents);
    console.log('Student Registered:', newStudent);
    resetForm();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 min-h-screen">
      <h1 className="text-2xl font-bold text-purple-600 mb-6">Student Registration</h1>
      <Formik
        initialValues={{ name: '', matricNo: '', course: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <Form className="space-y-6 bg-white p-6 rounded-xl shadow-lg">
          <div>
            <label className="block text-gray-700 mb-2">Full Name</label>
            <Field
              name="name"
              type="text"
              className="w-full p-2 border rounded-lg"
            />
            <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Matric Number</label>
            <Field
              name="matricNo"
              type="text"
              className="w-full p-2 border rounded-lg"
            />
            <ErrorMessage name="matricNo" component="div" className="text-red-500 text-sm" />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Course</label>
            <Field
              name="course"
              type="text"
              className="w-full p-2 border rounded-lg"
            />
            <ErrorMessage name="course" component="div" className="text-red-500 text-sm" />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700"
          >
            Register Student
          </button>
        </Form>
      </Formik>
    </div>
  );
};

export default RegisterStudent;
