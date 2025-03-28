// src/pages/StudentsPage.jsx
import { useEffect, useState } from "react";
import { loadFromDatabase, databaseKeys } from "../utils/database";
import { exportToCSV } from "../utils/exportCSV";

const StudentsPage = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const savedStudents = loadFromDatabase(databaseKeys.STUDENTS) || [];
    setStudents(savedStudents);
  }, []);

  const handleExportStudents = () => {
    exportToCSV(students, "students.csv");
  };

  return (
    <div className="min-h-screen bg-purple-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-purple-600 text-2xl font-bold mb-6">
          Registered Students
        </h2>
        {students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-lg">
              <thead className="bg-purple-50">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Matric Number</th>
                  <th className="p-3 text-left">Course</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-purple-50">
                    <td className="p-3">{student.name}</td>
                    <td className="p-3">{student.matricNo}</td>
                    <td className="p-3">{student.course}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No students registered yet.
          </div>
        )}
        <button
          onClick={handleExportStudents}
          className="mt-4 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700"
        >
          Export Students CSV
        </button>
      </div>
    </div>
  );
};

export default StudentsPage;
