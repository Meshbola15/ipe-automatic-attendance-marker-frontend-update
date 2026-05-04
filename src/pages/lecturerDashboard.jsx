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
import { FiPlus, FiArrowLeft, FiLogOut, FiPlusCircle, FiClock } from "react-icons/fi";

const LecturerDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lecturerDetails, setLecturerDetails, loading } = useLecturerContext();

  const [departments, setDepartments] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [openAttendance, setOpenAttendance] = useState({});
  const [showNewAttendanceModal, setShowNewAttendanceModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [requestingDept, setRequestingDept] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [sessionDuration, setSessionDuration] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [currentFileName, setCurrentFileName] = useState("");

  const fetchData = async () => {
    const depts = (await loadFromDatabase(databaseKeys.DEPARTMENTS)) || [];
    setDepartments(Array.isArray(depts) ? depts : []);
    const data = (await loadFromDatabase(databaseKeys.ATTENDANCE)) || [];
    setAttendanceData(Array.isArray(data) ? data : []);
    const allLecturers = (await loadFromDatabase(databaseKeys.LECTURERS)) || [];
    const me = (Array.isArray(allLecturers) ? allLecturers : Object.values(allLecturers)).find((l) => l.id === id);
    if (me) {
      setLecturerDetails(me);
      localStorage.setItem("lecturer", JSON.stringify(me));
    }
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

  const handleDeptRequest = async () => {
    if (!requestingDept) return;
    const raw = await loadFromDatabase(databaseKeys.LECTURERS);
    const all = Array.isArray(raw) ? raw : Object.values(raw || {});
    const me = all.find((l) => l.id === id);
    if (!me) return;
    const existing = (me.deptRequests || []);
    if (existing.some((r) => r.dept === requestingDept && r.status === "pending")) {
      toast.error("You already have a pending request for this department");
      return;
    }
    setSubmittingRequest(true);
    const updated = { ...me, deptRequests: [...existing, { dept: requestingDept, status: "pending" }] };
    await saveToDatabase(databaseKeys.LECTURERS, updated);
    toast.success("Request submitted — awaiting admin approval");
    setRequestingDept("");
    setSubmittingRequest(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("lecturer");
    localStorage.removeItem("lecturer_remembered");
    navigate("/lecturer");
  };

  return (
    <div className="w-full space-y-6">
      {loading && <LoadingScreen />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <FiArrowLeft size={15} /> Back
          </button>
          <div>
            <h1 className="page-title">Lecturer Dashboard</h1>
            <p className="page-subtitle !mb-0">
              Welcome,{" "}
              <span className="font-semibold text-emerald-600">{lecturerDetails?.username || "Lecturer"}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/lecturer/camera/${id}`)}
            className="btn-primary flex items-center gap-2 self-start sm:self-auto"
          >
            Open Camera
          </button>
          <button onClick={handleLogout} className="btn-danger flex items-center gap-1.5 text-xs !py-1.5">
            <FiLogOut size={13} /> Logout
          </button>
        </div>
      </div>

      {/* Dept scope info */}
      <div className="card !p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Your Departments</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {myDepts.length === 0 ? (
            <p className="text-sm text-slate-400">No departments assigned yet</p>
          ) : (
            myDepts.map((d) => (
              <div key={d.id} className="bg-violet-50 border border-violet-100 rounded-xl px-3 py-2">
                <p className="text-xs font-bold text-violet-800">{d.name}</p>
                <p className="text-[10px] text-violet-500 mt-0.5">{(d.levels || []).join(", ")}</p>
              </div>
            ))
          )}
        </div>

        {/* Pending requests */}
        {(lecturerDetails?.deptRequests || []).filter((r) => r.status === "pending").length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pending Requests</p>
            <div className="flex flex-wrap gap-2">
              {(lecturerDetails?.deptRequests || []).filter((r) => r.status === "pending").map((r) => (
                <span key={r.dept} className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  <FiClock size={11} /> {r.dept} — pending
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Request additional dept */}
        {(() => {
          const assignedNames = (lecturerDetails?.departments || []);
          const pendingNames = (lecturerDetails?.deptRequests || []).filter((r) => r.status === "pending").map((r) => r.dept);
          const available = departments.filter((d) => !assignedNames.includes(d.name) && !pendingNames.includes(d.name));
          if (available.length === 0) return null;
          return (
            <div className="flex gap-2 items-center pt-3 border-t border-slate-100">
              <select
                value={requestingDept}
                onChange={(e) => setRequestingDept(e.target.value)}
                className="input flex-1 text-sm"
              >
                <option value="">Request access to another department…</option>
                {available.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
              <button
                onClick={handleDeptRequest}
                disabled={!requestingDept || submittingRequest}
                className="btn-primary flex items-center gap-1.5 !py-2 flex-shrink-0"
              >
                <FiPlusCircle size={14} /> Request
              </button>
            </div>
          );
        })()}
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
