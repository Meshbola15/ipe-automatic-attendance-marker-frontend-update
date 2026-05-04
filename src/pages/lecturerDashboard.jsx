/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { uid } from "uid";
import { useLecturerContext } from "../context/lecturerContext";
import {
  databaseKeys,
  loadFromDatabase,
  saveToDatabase,
} from "../utils/database";
import AttendanceManagement from "../components/attendanceManagement";
import NewAttendanceModal from "../components/newAttendanceModal";
import LoadingScreen from "../components/loadingScreen";
import { FiPlus } from "react-icons/fi";

const LecturerDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lecturerDetails, loading } = useLecturerContext();

  const [departments, setDepartments] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [openAttendance, setOpenAttendance] = useState({});
  const [showNewAttendanceModal, setShowNewAttendanceModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sessionDuration, setSessionDuration] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [currentFileName, setCurrentFileName] = useState("");

  const fetchData = async () => {
    const depts = (await loadFromDatabase(databaseKeys.DEPARTMENTS)) || [];
    setDepartments(Array.isArray(depts) ? depts : []);
    const data = (await loadFromDatabase(databaseKeys.ATTENDANCE)) || [];
    setAttendanceData(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!id) return <div>Lecturer not found</div>;

  // Only this lecturer's sessions
  const mySessions = attendanceData.filter((s) => s.lecturerId === id);
  const sortedAttendance = [...mySessions].sort(
    (a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`)
  );

  // Departments this lecturer belongs to
  const myDepts = departments.filter((d) =>
    (lecturerDetails?.departments || []).includes(d.name)
  );

  // Levels for currently selected dept
  const levelsForSelectedDept =
    myDepts.find((d) => d.name === selectedDepartment)?.levels || [];

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    if (!currentFileName) { toast.error("Please provide a session name"); return; }
    if (!selectedDepartment) { toast.error("Please select a department"); return; }
    if (!selectedLevel) { toast.error("Please select a level"); return; }

    const closesAt = sessionDuration
      ? Date.now() + parseInt(sessionDuration, 10) * 60 * 1000
      : null;

    const newSession = {
      id: uid(),
      lecturerId: id,
      lecturerName: lecturerDetails?.username || "",
      fileName: `${currentFileName}-${new Date().toLocaleDateString()}-${selectedDepartment}-${selectedLevel}`,
      department: selectedDepartment,
      level: selectedLevel,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: "active",
      closesAt,
      attendees: [],
    };

    await saveToDatabase(databaseKeys.ATTENDANCE, newSession);
    toast.success("Attendance session created!");
    setShowNewAttendanceModal(false);
    setCurrentFileName("");
    setSelectedLevel("");
    setSessionDuration("");
    fetchData();
  };

  const handleStudentStatusChange = (record, idx, newStatus) => {
    const updatedAttendees = record.attendees.map((a, i) =>
      i === idx ? { ...a, status: newStatus } : a
    );
    const updated = { ...record, attendees: updatedAttendees };
    setAttendanceData((prev) => prev.map((a) => (a.id === record.id ? updated : a)));
    saveToDatabase(databaseKeys.ATTENDANCE, updated);
  };

  const handleCloseSession = async (record) => {
    const updatedAttendees = (record.attendees || []).map((a) =>
      a.status === "Pending" ? { ...a, status: "Unverified" } : a
    );
    const closed = { ...record, status: "closed", closesAt: Date.now(), attendees: updatedAttendees };
    await saveToDatabase(databaseKeys.ATTENDANCE, closed);
    toast.success(`Session "${record.fileName}" closed.`);
    fetchData();
  };

  const handleExportAttendance = (index) => {
    setSaving(true);
    const record = sortedAttendance[index];
    const csv = (record.attendees || [])
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

  const toggleOpen = (fileName) => {
    setOpenAttendance((prev) => ({ ...prev, [fileName]: !prev[fileName] }));
  };

  return (
    <div className="w-full space-y-6">
      {loading && <LoadingScreen />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Lecturer Dashboard</h1>
          <p className="page-subtitle !mb-0">
            Welcome,{" "}
            <span className="font-semibold text-emerald-600">{lecturerDetails?.username || "Lecturer"}</span>
          </p>
        </div>
        <button
          onClick={() => navigate(`/lecturer/camera/${id}`)}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          Open Camera
        </button>
      </div>

      {/* Dept scope info */}
      <div className="card !p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Your Departments</p>
        <div className="flex flex-wrap gap-2">
          {myDepts.length === 0 ? (
            <p className="text-sm text-slate-400">No departments assigned</p>
          ) : (
            myDepts.map((d) => (
              <div key={d.id} className="bg-violet-50 border border-violet-100 rounded-xl px-3 py-2">
                <p className="text-xs font-bold text-violet-800">{d.name}</p>
                <p className="text-[10px] text-violet-500 mt-0.5">{(d.levels || []).join(", ")}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Session Management */}
      <AttendanceManagement
        sortedAttendance={sortedAttendance}
        handleExportAttendance={handleExportAttendance}
        handleStudentStatusChange={handleStudentStatusChange}
        saving={saving}
        openAttendance={openAttendance}
        setShowNewAttendanceModal={setShowNewAttendanceModal}
        toggleOpen={toggleOpen}
        handleCloseSession={handleCloseSession}
      />

      {/* New Session Modal */}
      {showNewAttendanceModal && (
        <NewAttendanceModal
          setShowNewAttendanceModal={setShowNewAttendanceModal}
          handleAttendanceSubmit={handleAttendanceSubmit}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={(dept) => {
            setSelectedDepartment(dept);
            setSelectedLevel("");
          }}
          departments={myDepts}
          levels={(myDepts.find((d) => d.name === selectedDepartment)?.levels || []).map((l) => ({ name: l }))}
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
          currentFileName={currentFileName}
          setCurrentFileName={setCurrentFileName}
          sessionDuration={sessionDuration}
          setSessionDuration={setSessionDuration}
          isScoped={false}
        />
      )}
    </div>
  );
};

export default LecturerDashboard;
