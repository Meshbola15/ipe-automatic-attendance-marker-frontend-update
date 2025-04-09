/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  databaseKeys,
  deleteAllFromDatabase,
  deleteFromDatabase,
  findItemById,
  loadFromDatabase,
  saveToDatabase,
  updateInDatabase,
} from "../utils/database";
import { toast } from "react-toastify";
import { useAdminContext } from "../context/adminContext";
import TimeInput from "../components/timeInput";
import { FiPlus, FiDownload } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { uid } from "uid";
import LoadingScreen from "../components/loadingScreen";
import AttendanceManagement from "../components/attendanceManagement";
import NewAttendanceModal from "../components/newAttendanceModal";

const AdminPage = () => {
  const params = useParams();
  const { id } = params;
  const [departments, setDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [saving, setSaving] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [showNewAttendanceModal, setShowNewAttendanceModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("0h 0m 0s");
  const [openAttendance, setOpenAttendance] = useState({});
  // const [loading, setLoading] = useState(false);

  const {
    isCameraActive,
    setIsCameraActive,
    setCurrentFileName,
    currentFileName,
    updateLastCameraActiveTimeStamp,
    adminDetails,
    loading,
  } = useAdminContext();

  const navigate = useNavigate();

  const getAttendanceLists = async () => {
    const savedDepartments =
      (await loadFromDatabase(databaseKeys.DEPARTMENTS)) || [];

    const normalizedDepartments = Array.isArray(savedDepartments)
      ? savedDepartments
      : [];

    setDepartments(normalizedDepartments);

    if (normalizedDepartments.length > 0 && !selectedDepartment) {
      setSelectedDepartment(normalizedDepartments[0]?.name);
    }
    const data = (await loadFromDatabase(databaseKeys.ATTENDANCE)) || [];
    setAttendanceData(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    getAttendanceLists();
  }, []);

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!adminDetails.id) return;
      const admin = await findItemById(databaseKeys.ADMIN, adminDetails.id);

      const lastTimestamp = admin?.cameraLastActiveTime;
      // console.log("lastTimestamp", lastTimestamp);

      if (lastTimestamp) {
        const diff = Math.max(
          Math.floor((+lastTimestamp - Date.now()) / 1000),
          0
        );
        setTimeRemaining(formatTime(diff));
        if (diff <= 0 && isCameraActive) {
          setIsCameraActive(false);
        }
      } else {
        setTimeRemaining("0h 0m 0s");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isCameraActive]);

  const handleCameraToggle = async () => {
    const active = !isCameraActive;
    setIsCameraActive(active);

    active
      ? updateLastCameraActiveTimeStamp()
      : await updateInDatabase(databaseKeys.ADMIN, adminDetails.id, {
          ...adminDetails,
          cameraLastActiveTime: null,
        });
  };

  const handleAddDepartment = async () => {
    if (!newDepartment.trim()) {
      toast.error("Department name cannot be empty");
      return;
    }

    if (departments.map((d) => d.name).includes(newDepartment)) {
      toast.error("Department already exists!");
      return;
    }

    const newDepartmentObject = {
      id: uid(),
      name: newDepartment,
    };

    const updated = [...departments, newDepartmentObject];

    setDepartments(updated);

    // 🔥 Save the **whole array** instead of one object
    await saveToDatabase(databaseKeys.DEPARTMENTS, newDepartmentObject);

    toast.success("Department added successfully");
    setNewDepartment("");
    getAttendanceLists(); // Refresh from DB
  };


  // fix this code aspect, i can't seem to figure it out

  const handleRemovedepartment = async (id) => {
    const updated = departments.filter((d) => d.id !== id);
    setDepartments(updated);
    await saveToDatabase(databaseKeys.DEPARTMENTS, updated);
    toast.success("Department removed successfully");
    getAttendanceLists(); // Optional, only if needed to refresh from DB
  };

  const toggleOpen = (fileName) => {
    setOpenAttendance((prev) => ({ ...prev, [fileName]: !prev[fileName] }));
  };

  const handleStudentStatusChange = (record, idx, newStatus) => {
    const updated = record.attendees.map((a, i) =>
      i === idx ? { ...a, status: newStatus } : a
    );

    const updatedData = attendanceData.map((att) =>
      att.id === record.id ? { ...att, attendees: updated } : att
    );

    setAttendanceData(updatedData);
    saveToDatabase(databaseKeys.ATTENDANCE, updatedData);
  };

  const sortedAttendance = [...attendanceData].sort(
    (a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`)
  );

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    if (!currentFileName || !selectedDepartment) {
      toast.error("Please provide file name and select a department");
      return;
    }

    const newConfig = {
      id: uid(),
      fileName: `${currentFileName}-${new Date().toLocaleDateString()}-${selectedDepartment}`,
      department: selectedDepartment,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: "active",
      attendees: [],
    };

    const updated = [...attendanceData, newConfig];
    setAttendanceData(updated);
    await saveToDatabase(databaseKeys.ATTENDANCE, updated);
    getAttendanceLists();
    toast.success("Attendance created successfully!");
    setShowNewAttendanceModal(false);
  };

  const handleExportAttendance = (index) => {
    setSaving(true);
    const record = attendanceData[index];
    const csv = record.attendees
      .map(({ name, matricNo, status }) => `${name},${matricNo},${status}`)
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${record.fileName || "attendance"}.csv`;
    link.click();
    setSaving(false);
  };

  // console.log(departments);

  if (!id) {
    return <div>Admin not found</div>;
  }

  return (
    <div className=" min-h-screen p-2 py-6 md:p-8 text-white space-y-6 w-full m-0">
      {loading && <LoadingScreen />}
      <section className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 w-full flex flex-col items-center justify-center gap-4">
          <h2 className="text-lg font-bold text-black">Camera Control</h2>
          <p className="text-black">Camera Time (in minutes):</p>
          <TimeInput />
          <p className="text-black">Time Remaining: {timeRemaining}</p>
          <button
            className={`px-4 py-2 text-white rounded-md w-full ${
              isCameraActive ? "bg-red-400" : "bg-green-600"
            }`}
            onClick={handleCameraToggle}
          >
            {isCameraActive ? "Turn Off Camera" : "Turn On Camera"}
          </button>

          {isCameraActive && (
            <button
              onClick={() => navigate(`/admin/camera/${adminDetails.id}`)}
              className="px-4 py-2 text-white rounded-md w-full bg-green-600"
            >
              Open Camera
            </button>
          )}
        </div>

        {/* department Management Section */}
        <div className="col-span-2 bg-white rounded-2xl shadow-lg p-4 md:p-6 w-full">
          <h2 className="text-lg font-bold text-black mb-4">
            Department Management
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Enter Department Name"
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              className="p-2 bg-white border border-gray-400 rounded-md flex-1 text-black outline-green-500"
            />
            <button
              className="bg-green-600 px-4 py-2 rounded-md text-white"
              onClick={handleAddDepartment}
            >
              Add Department
            </button>
          </div>
          <ul className="mt-4 rounded-md divide-y divide-gray-500">
            {departments.map((department, index) => (
              <li
                key={index}
                className="flex justify-between items-center p-2 bg-white rounded-md text-black"
              >
                <span>{department.name}</span>
                <span className="flex items-center gap-4">
                  <button
                    className="text-red-500"
                    onClick={() => handleRemovedepartment(department.id)}
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
      <AttendanceManagement
        sortedAttendance={sortedAttendance}
        handleExportAttendance={handleExportAttendance}
        handleStudentStatusChange={handleStudentStatusChange}
        saving={saving}
        openAttendance={openAttendance}
        setShowNewAttendanceModal={setShowNewAttendanceModal}
        toggleOpen={toggleOpen}
      />

      {/* New Attendance Modal */}
      {showNewAttendanceModal && (
        <NewAttendanceModal
          setShowNewAttendanceModal={setShowNewAttendanceModal}
          handleAttendanceSubmit={handleAttendanceSubmit}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          departments={departments}
          currentFileName={currentFileName}
          setCurrentFileName={setCurrentFileName}
        />
      )}
    </div>
  );
};

export default AdminPage;
