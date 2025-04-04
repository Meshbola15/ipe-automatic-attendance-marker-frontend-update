/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  databaseKeys,
  loadFromDatabase,
  saveToDatabase,
} from "../utils/database";
import { toast } from "react-toastify";
import { useAdminContext } from "../context/adminContext";
import TimeInput from "../components/timeInput";
import { FiPlus, FiDownload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [saving, setSaving] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const {
    isCameraActive,
    setIsCameraActive,
    setCurrentFileName,
    currentFileName,
    updateLastCameraActiveTimeStamp,
  } = useAdminContext();
  const [showNewAttendanceModal, setShowNewAttendanceModal] = useState(false);

  const [timeRemaining, setTimeRemaining] = useState("0h 0m 0s");

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  const loadAttendanceData = () => {
    const attendance = loadFromDatabase(databaseKeys.ATTENDANCE) || [];
    setAttendanceData(attendance);
  };

  useEffect(() => {
    const savedCourses = loadFromDatabase(databaseKeys.COURSES) || [];
    setCourses(savedCourses);
    if (savedCourses.length > 0 && !selectedCourse) {
      setSelectedCourse(savedCourses[0]);
    }
    loadAttendanceData();
  }, []);

  const handleCameraToggle = () => {
    if (isCameraActive) {
      setIsCameraActive(false);
      localStorage.removeItem("lastCameraActiveTimeStamp");
    } else {
      setIsCameraActive(true);
      updateLastCameraActiveTimeStamp();
    }
  };

  const handleAddCourse = () => {
    if (courses.includes(newCourse)) {
      toast.error("Course already exists!");
      return;
    }
    const updatedCourses = [...courses, newCourse];
    setCourses(updatedCourses);
    saveToDatabase(databaseKeys.COURSES, updatedCourses);
    setNewCourse("");
  };

  const handleRemoveCourse = (courseToRemove) => {
    const updatedCourses = courses.filter(
      (course) => course !== courseToRemove
    );
    setCourses(updatedCourses);
    saveToDatabase(databaseKeys.COURSES, updatedCourses);
    if (selectedCourse === courseToRemove && updatedCourses.length) {
      setSelectedCourse(updatedCourses[0]);
    }
  };

  const [openAttendance, setOpenAttendance] = useState({});

  const toggleOpen = (fileName) => {
    setOpenAttendance((prev) => ({ ...prev, [fileName]: !prev[fileName] }));
  };

  const handleStudentStatusChange = (record, studentIndex, newStatus) => {
    const updatedAttendanceData = attendanceData.map((item) => {
      if (item.fileName === record.fileName) {
        const updatedAttendees = item.attendees.map((attendee, idx) =>
          idx === studentIndex ? { ...attendee, status: newStatus } : attendee
        );
        return { ...item, attendees: updatedAttendees };
      }
      return item;
    });
    setAttendanceData(updatedAttendanceData);
    saveToDatabase(databaseKeys.ATTENDANCE, updatedAttendanceData);
  };

  const sortedAttendance = [...attendanceData].sort(
    (a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`)
  );

  const saveAttendanceConfig = (attendanceConfig) => {
    const updatedAttendance = [...attendanceData, attendanceConfig];
    saveToDatabase(databaseKeys.ATTENDANCE, updatedAttendance);
    setAttendanceData(updatedAttendance);
  };

  const handleAttendanceSubmit = (e) => {
    e.preventDefault();

    const newAttendanceConfig = {
      fileName: `${currentFileName}-${new Date().toLocaleDateString()}-${selectedCourse}`,
      course: selectedCourse,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: "active",
      attendees: [],
    };

    saveAttendanceConfig(newAttendanceConfig);

    setShowNewAttendanceModal(false);
  };

  const handleExportAttendance = (index) => {
    setSaving(true);
    const attendanceRecord = attendanceData[index];
    const csvData = attendanceRecord.attendees
      .map((student) => `${student.name},${student.matricNo},${student.status}`)
      .join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "attendance.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSaving(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const lastTimestamp = localStorage.getItem("lastCameraActiveTimeStamp");
      if (lastTimestamp) {
        const diffSeconds = Math.max(
          Math.floor((Number(lastTimestamp) - Date.now()) / 1000),
          0
        );
        setTimeRemaining(formatTime(diffSeconds));
        if (diffSeconds <= 0 && isCameraActive) {
          setIsCameraActive(false);
        }
      } else {
        setTimeRemaining("0h 0m 0s");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isCameraActive, setIsCameraActive]);

  const getRole = () => {
    const role = localStorage.getItem("role");
    return role;
  };
  const navigate = useNavigate();

  if (getRole() !== "admin") {
    return (
      <div className="bg-ThamarBlack min-h-screen p-4 md:p-8 text-white space-y-6 h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center container mx-auto">
          <h1 className="text-sm text-black">
            You are not authorized to view this page.
          </h1>

          <button
            className="px-4 py-2 text-blue-900 rounded-md mt-4"
            onClick={() => navigate("/")}
          >
            Go to Home Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ThamarBlack min-h-screen p-4 md:p-8 text-white space-y-6">
      {/* Camera Control Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="container flex flex-col items-center justify-center gap-4 p-4 bg-gray-200 rounded-md">
          <h2 className="text-lg font-bold text-black">Camera Control</h2>
          <p className="text-black">Camera Time (in minutes):</p>
          <TimeInput />
          <p className="text-black">Time Remaining: {timeRemaining}</p>
          <button
            className={`px-4 py-2 text-white rounded-md w-full ${isCameraActive ? "bg-red-400" : "bg-green-600"
              }`}
            onClick={handleCameraToggle}
          >
            {isCameraActive ? "Turn Off Camera" : "Turn On Camera"}
          </button>
        </div>

        {/* Course Management Section */}
        <div className="container col-span-2 p-4 bg-gray-200 rounded-md">
          <h2 className="text-lg font-bold text-black mb-4">
            Course Management
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Enter Course Name"
              value={newCourse}
              onChange={(e) => setNewCourse(e.target.value)}
              className="p-2 bg-white border border-gray-400 rounded-md flex-1 text-black outline-green-500"
            />
            <button
              className="bg-green-600 px-4 py-2 rounded-md text-white"
              onClick={handleAddCourse}
            >
              Add Course
            </button>
          </div>
          <ul className="mt-4 rounded-md divide-y divide-gray-500">
            {courses.map((course, index) => (
              <li
                key={index}
                className="flex justify-between items-center p-2 bg-white rounded-md text-black"
              >
                <span>{course}</span>
                <span className="flex items-center gap-4">
                  {/* <button
                    className="text-purple-500"
                    onClick={() => handleRemoveCourse(course)}
                  >
                    Create Attendance
                  </button> */}
                  <button
                    className="text-red-500"
                    onClick={() => handleRemoveCourse(course)}
                  >
                    Remove
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Attendance Management Section */}
      <div className="container p-4 bg-gray-200 rounded-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-black">
            Attendance Management
          </h2>
          <button
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-white"
            onClick={() => setShowNewAttendanceModal(true)}
          >
            <FiPlus />
            {/* <span>New Attendance</span> */}
          </button>
        </div>
        <div className="mt-4">
          <h2 className="text-lg font-bold text-black mb-4">Attendance List</h2>
          <div className="space-y-4">
            {sortedAttendance.map((attendance, index) => {
              const presentCount = attendance.attendees.filter(
                (attendee) => attendee.status === "Present"
              ).length;
              const totalCount = attendance.attendees.length;

              return (
                <div
                  key={index}
                  className="p-4 bg-white rounded-md text-black shadow-sm"
                >
                  {/* Dropdown Header */}
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleOpen(attendance.fileName)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium flex items-center gap-1 ">
                        File:{" "}
                        <span className="truncate w-48 inline-block text-cyan-600">
                          {attendance.fileName || "Untitled"}
                        </span>
                      </span>
                      {totalCount > 0 && (
                        <span className="text-sm text-gray-600">
                          {presentCount}/{totalCount} Present
                        </span>
                      )}
                    </div>
                    <button
                      className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportAttendance(index);
                      }}
                      disabled={saving}
                      title="Export Attendance"
                    >
                      <FiDownload />
                    </button>
                  </div>

                  {/* Dropdown Content: Attendee Details */}
                  {openAttendance[attendance.fileName] && (
                    <div className="mt-4">
                      {attendance.attendees &&
                        attendance.attendees.length > 0 ? (
                        <table className="min-w-full">
                          <thead>
                            <tr className="text-left">
                              <th className="p-2">Name</th>
                              <th className="p-2">Matric No</th>
                              <th className="p-2">Status</th>
                              <th className="p-2">Edit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendance.attendees.map((student, sIdx) => (
                              <tr key={sIdx} className="hover:bg-gray-100">
                                <td className="p-2">{student.name}</td>
                                <td className="p-2">{student.matricNo}</td>
                                <td className="p-2">{student.status}</td>
                                <td className="p-2">
                                  <select
                                    value={student.status}
                                    onChange={(e) =>
                                      handleStudentStatusChange(
                                        attendance,
                                        sIdx,
                                        e.target.value
                                      )
                                    }
                                    className="p-1 rounded-md"
                                  >
                                    <option value="Present">Present</option>
                                    <option value="Absent">Absent</option>
                                    <option value="Late">Late</option>
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-gray-600">No attendees recorded.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* New Attendance Modal */}
      {showNewAttendanceModal && (
        <section className="fixed inset-0 flex items-center justify-center z-50">
          {/* Overlay to close the modal */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setShowNewAttendanceModal(false)}
          />
          {/* Modal Content */}
          <div className="relative bg-white p-6 rounded-md w-11/12 max-w-md">
            <h2 className="text-lg font-bold mb-4 text-black">
              Create New Attendance
            </h2>
            <form onSubmit={handleAttendanceSubmit}>
              {/* Select Course */}
              <label htmlFor="course" className="block text-black mb-2">
                Select Course
              </label>
              <select
                id="course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full p-2 mb-4 bg-white border border-gray-400 rounded-md text-black outline-green-500"
              >
                {courses.map((course, index) => (
                  <option key={index} value={course}>
                    {course}
                  </option>
                ))}
              </select>

              {/* Enter File Name */}
              <label htmlFor="fileName" className="block text-black mb-2">
                Enter File Name
              </label>
              <input
                id="fileName"
                type="text"
                placeholder="Enter File Name"
                value={currentFileName}
                onChange={(e) => setCurrentFileName(e.target.value)}
                className="w-full p-2 mb-4 bg-white border border-gray-400 rounded-md text-black outline-green-500"
              />

              {/* Preview Generated File Name (no timestamp yet) */}
              <p className="mb-4 text-black">
                <strong>Generated File Name:</strong>{" "}
                {currentFileName && selectedCourse
                  ? `${currentFileName}-${selectedCourse}`
                  : "—"}
              </p>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-gray-500 text-white"
                  onClick={() => setShowNewAttendanceModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-green-600 text-white"
                >
                  Add Attendance
                </button>
              </div>
            </form>
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminPage;
