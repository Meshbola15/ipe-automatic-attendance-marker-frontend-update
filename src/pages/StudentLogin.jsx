// src/pages/StudentLogin.jsx
import { useState } from "react";

const StudentLogin = () => {
  const [matricNo, setMatricNo] = useState("");
  const [attendanceData, setAttendanceData] = useState(null);

  // Mock data for demonstration purposes
  const mockData = {
    name: "John Doe",
    matricNo: "STD001",
    attendance: [
      { date: "2023-08-01", status: "Present" },
      { date: "2023-08-02", status: "Absent" },
    ],
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real app, replace this with an API call
    setAttendanceData(mockData);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 min-h-screen">
      <h1 className="text-2xl font-bold text-purple-600 mb-6">
        Student Attendance Portal
      </h1>

      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-xl shadow-lg space-y-6"
      >
        <div>
          <label className="block text-gray-700 mb-2">Matric Number</label>
          <input
            type="text"
            value={matricNo}
            onChange={(e) => setMatricNo(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700"
        >
          View Attendance
        </button>
      </form>

      {attendanceData && (
        <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">{attendanceData.name}</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-purple-50">
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.attendance.map((entry, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-3">{entry.date}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded ${
                          entry.status === "Present"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLogin;
