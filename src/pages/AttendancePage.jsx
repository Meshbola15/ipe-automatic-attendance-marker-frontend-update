// src/pages/AttendancePage.jsx
import { useEffect, useState } from "react";
import { loadFromDatabase, databaseKeys } from "../utils/database";
import { exportToCSV } from "../utils/exportCSV";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FiCalendar, FiClock, FiUser, FiBook } from "react-icons/fi";

const AttendancePage = () => {
  const [attendance, setAttendance] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

  useEffect(() => {
    const savedAttendance = loadFromDatabase(databaseKeys.ATTENDANCE) || [];
    setAttendance(savedAttendance);
  }, []);

  const sortedAttendance = [...attendance].sort((a, b) => {
    if (sortConfig.direction === "asc") {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    }
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
  });

  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const handleExportAttendance = () => {
    exportToCSV(attendance, "attendance.csv");
  };

  return (
    <div className="min-h-screen bg-purple-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
        >
          <h2 className="text-purple-600 text-2xl font-bold mb-6 flex items-center gap-2">
            <FiCalendar className="inline-block" /> Attendance Records
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-purple-50 text-purple-600">
                  <th
                    className="p-3 text-left cursor-pointer"
                    onClick={() => requestSort("date")}
                  >
                    <FiCalendar className="inline-block mr-2" />
                    Date{" "}
                    {sortConfig.key === "date" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="p-3 text-left cursor-pointer"
                    onClick={() => requestSort("time")}
                  >
                    <FiClock className="inline-block mr-2" />
                    Time{" "}
                    {sortConfig.key === "time" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="p-3 text-left cursor-pointer"
                    onClick={() => requestSort("name")}
                  >
                    <FiUser className="inline-block mr-2" />
                    Name{" "}
                    {sortConfig.key === "name" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="p-3 text-left cursor-pointer"
                    onClick={() => requestSort("matricNo")}
                  >
                    <FiBook className="inline-block mr-2" />
                    Matric No.{" "}
                    {sortConfig.key === "matricNo" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedAttendance.map((entry) => (
                  <tr key={entry.id} className="border-b hover:bg-purple-50">
                    <td className="p-3">{entry.date}</td>
                    <td className="p-3">{entry.time}</td>
                    <td className="p-3 font-medium text-purple-600">
                      {entry.name}
                    </td>
                    <td className="p-3">{entry.matricNo}</td>
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

          {attendance.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No attendance records found
            </div>
          )}

          
          <button
            onClick={handleExportAttendance}
            className="mt-4 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700"
          >
            Export Attendance CSV
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default AttendancePage;
