/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  databaseKeys,
  loadFromDatabase,
  removeFromDatabase,
  saveToDatabase,
} from "../utils/database";
import { FiPlus, FiArrowLeft, FiLogOut, FiEdit2, FiCheck, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { useAdminContext } from "../context/adminContext";
import { useNavigate, useParams } from "react-router-dom";
import { uid } from "uid";
import LoadingScreen from "../components/loadingScreen";
import AttendanceManagement from "../components/attendanceManagement";
import ConfirmModal from "../components/ConfirmModal";

const AdminPage = () => {
  const params = useParams();
  const { id } = params;
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptLevels, setNewDeptLevels] = useState("100L, 200L, 300L, 400L");
  const [lecturers, setLecturers] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [saving, setSaving] = useState(false);
  const [openAttendance, setOpenAttendance] = useState({});
  const [confirm, setConfirm] = useState(null);

  const { adminDetails, loading } = useAdminContext();

  const fetchData = async () => {
    const savedDepts = (await loadFromDatabase(databaseKeys.DEPARTMENTS)) || [];
    setDepartments(Array.isArray(savedDepts) ? savedDepts : []);
    const savedLecturers = (await loadFromDatabase(databaseKeys.LECTURERS)) || [];
    setLecturers(Array.isArray(savedLecturers) ? savedLecturers : []);
    const data = (await loadFromDatabase(databaseKeys.ATTENDANCE)) || [];
    setAttendanceData(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddDepartment = async () => {
    if (!newDeptName.trim()) { toast.error("Department name cannot be empty"); return; }
    if (departments.map((d) => d.name).includes(newDeptName.trim())) { toast.error("Department already exists!"); return; }
    const levelsArr = newDeptLevels.split(",").map((l) => l.trim()).filter(Boolean);
    if (levelsArr.length === 0) { toast.error("Add at least one level"); return; }
    const obj = { id: uid(), name: newDeptName.trim(), levels: levelsArr };
    setDepartments((p) => [...p, obj]);
    await saveToDatabase(databaseKeys.DEPARTMENTS, obj);
    toast.success("Department added successfully");
    setNewDeptName("");
    setNewDeptLevels("100L, 200L, 300L, 400L");
  };

  const handleRemoveDepartment = (id) => {
    const dept = departments.find((d) => d.id === id);
    setConfirm({
      title: "Remove Department?",
      message: `"${dept?.name}" will be permanently deleted. This cannot be undone.`,
      confirmLabel: "Remove",
      onConfirm: async () => {
        await removeFromDatabase(databaseKeys.DEPARTMENTS, id);
        toast.success("Department removed successfully");
        fetchData();
      },
    });
  };

  const handleAddLevelToDept = async (dept, newLvl) => {
    if (!newLvl.trim()) return;
    if ((dept.levels || []).includes(newLvl.trim())) { toast.error("Level already exists in this department"); return; }
    const updated = { ...dept, levels: [...(dept.levels || []), newLvl.trim()] };
    await saveToDatabase(databaseKeys.DEPARTMENTS, updated);
    fetchData();
  };

  const handleRenameDepartment = async (dept, newName) => {
    if (!newName.trim() || newName.trim() === dept.name) return;
    if (departments.some((d) => d.id !== dept.id && d.name.toLowerCase() === newName.trim().toLowerCase())) {
      toast.error("A department with that name already exists");
      return;
    }
    const updated = { ...dept, name: newName.trim() };
    await saveToDatabase(databaseKeys.DEPARTMENTS, updated);
    toast.success("Department renamed");
    fetchData();
  };

  const handleRemoveLevelFromDept = async (dept, lvl) => {
    const updated = { ...dept, levels: (dept.levels || []).filter((l) => l !== lvl) };
    await saveToDatabase(databaseKeys.DEPARTMENTS, updated);
    fetchData();
  };

  const handleApproveDeptRequest = async (lecturer, deptName) => {
    const updatedRequests = (lecturer.deptRequests || []).map((r) =>
      r.dept === deptName ? { ...r, status: "approved" } : r
    );
    const updatedDepts = [...new Set([...(lecturer.departments || []), deptName])];
    const updated = { ...lecturer, departments: updatedDepts, deptRequests: updatedRequests };
    await saveToDatabase(databaseKeys.LECTURERS, updated);
    toast.success(`${lecturer.username} granted access to ${deptName}`);
    fetchData();
  };

  const handleRejectDeptRequest = async (lecturer, deptName) => {
    const updatedRequests = (lecturer.deptRequests || []).map((r) =>
      r.dept === deptName ? { ...r, status: "rejected" } : r
    );
    const updated = { ...lecturer, deptRequests: updatedRequests };
    await saveToDatabase(databaseKeys.LECTURERS, updated);
    toast.success(`Request rejected`);
    fetchData();
  };

  const handleApproveLecturer = async (lecturer) => {
    const updated = { ...lecturer, status: "approved" };
    await saveToDatabase(databaseKeys.LECTURERS, updated);
    toast.success(`${lecturer.username} approved`);
    fetchData();
  };

  const handleRejectLecturer = (lecturer) => {
    setConfirm({
      title: "Reject Application?",
      message: `Reject the application from "${lecturer.username}"? They will not be able to log in.`,
      confirmLabel: "Reject",
      onConfirm: async () => {
        const updated = { ...lecturer, status: "rejected" };
        await saveToDatabase(databaseKeys.LECTURERS, updated);
        toast.success(`${lecturer.username} rejected`);
        fetchData();
      },
    });
  };

  const toggleOpen = (fileName) => {
    setOpenAttendance((prev) => ({ ...prev, [fileName]: !prev[fileName] }));
  };

  const handleStudentStatusChange = (record, idx, newStatus) => {
    const updatedAttendees = record.attendees.map((a, i) =>
      i === idx ? { ...a, status: newStatus } : a
    );

    const updatedRecord = { ...record, attendees: updatedAttendees };

    const updatedData = attendanceData.map((att) =>
      att.id === record.id ? updatedRecord : att
    );

    setAttendanceData(updatedData);
    saveToDatabase(databaseKeys.ATTENDANCE, updatedRecord);
  };

  const sortedAttendance = [...attendanceData].sort(
    (a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`)
  );

  const handleCloseSession = async (record) => {
    const updatedAttendees = (record.attendees || []).map((a) =>
      a.status === "Pending" ? { ...a, status: "Unverified" } : a
    );
    const closed = { ...record, status: "closed", closesAt: Date.now(), attendees: updatedAttendees };
    await saveToDatabase(databaseKeys.ATTENDANCE, closed);
    toast.success(`Session "${record.fileName}" closed. Pending entries marked Unverified.`);
    fetchData();
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

  if (!id) return <div>Admin not found</div>;

  const pendingLecturers = lecturers.filter((l) => l.status === "pending");

  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/admin");
  };

  return (
    <div className="w-full space-y-6">
      {loading && <LoadingScreen />}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <FiArrowLeft size={15} /> Back
          </button>
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle !mb-0">
              Welcome back,{" "}
              <span className="font-semibold text-violet-600">{adminDetails?.username || "Admin"}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {pendingLecturers.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {pendingLecturers.length} pending application{pendingLecturers.length !== 1 ? "s" : ""}
            </span>
          )}
          <button onClick={handleLogout} className="btn-danger flex items-center gap-1.5 text-xs !py-1.5">
            <FiLogOut size={13} /> Logout
          </button>
        </div>
      </div>

      {/* Dept Management */}
      <section className="grid grid-cols-1 gap-5">
        <div className="card">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Departments</h2>

          {/* Add new dept */}
          <div className="space-y-2 mb-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-600 mb-2">Add New Department</p>
            <input
              type="text"
              placeholder="Department name e.g. Computer Science"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              className="input"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Levels (comma-separated) e.g. 100L, 200L, 300L"
                value={newDeptLevels}
                onChange={(e) => setNewDeptLevels(e.target.value)}
                className="input flex-1 text-sm"
              />
              <button className="btn-success flex-shrink-0" onClick={handleAddDepartment}>Add</button>
            </div>
          </div>

          {/* Dept list */}
          {departments.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No departments yet</p>
          ) : (
            <div className="space-y-3">
              {departments.map((dept) => (
                <DeptCard key={dept.id} dept={dept} onRemoveDept={handleRemoveDepartment} onRenameDept={handleRenameDepartment} onAddLevel={handleAddLevelToDept} onRemoveLevel={handleRemoveLevelFromDept} setConfirm={setConfirm} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Department Access Requests */}
      {(() => {
        const pending = lecturers.flatMap((l) =>
          (l.deptRequests || []).filter((r) => r.status === "pending").map((r) => ({ lecturer: l, dept: r.dept }))
        );
        if (pending.length === 0) return null;
        return (
          <section className="card">
            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              Department Access Requests
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">{pending.length}</span>
            </h2>
            <div className="space-y-2">
              {pending.map(({ lecturer: lec, dept }) => (
                <div key={`${lec.id}-${dept}`} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{lec.username}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Requesting access to <span className="font-semibold text-violet-600">{dept}</span></p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleApproveDeptRequest(lec, dept)} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">Approve</button>
                    <button onClick={() => handleRejectDeptRequest(lec, dept)} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {/* Lecturer Applications */}
      <section className="card">
        <h2 className="text-sm font-bold text-slate-800 mb-4">Lecturer Applications</h2>
        {lecturers.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No applications yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Departments</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="px-4 py-3 w-32"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {lecturers.map((lec) => (
                  <tr key={lec.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{lec.username}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(lec.departments || []).map((d) => (
                          <span key={d} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 border border-violet-100">{d}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                        lec.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        lec.status === "rejected" ? "bg-red-50 text-red-600 border-red-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>{lec.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {lec.status === "pending" && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveLecturer(lec)} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">Approve</button>
                          <button onClick={() => handleRejectLecturer(lec)} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors">Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Attendance Management Section — admin view of ALL sessions */}
      <AttendanceManagement
        sortedAttendance={sortedAttendance}
        handleExportAttendance={handleExportAttendance}
        handleStudentStatusChange={handleStudentStatusChange}
        saving={saving}
        openAttendance={openAttendance}
        setShowNewAttendanceModal={null}
        toggleOpen={toggleOpen}
        handleCloseSession={handleCloseSession}
      />

      <ConfirmModal
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        confirmClass="btn-danger"
        onConfirm={() => { confirm?.onConfirm(); setConfirm(null); }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
};

// Sub-component: expandable department card with inline level management
const DeptCard = ({ dept, onRemoveDept, onRenameDept, onAddLevel, onRemoveLevel, setConfirm }) => {
  const [expanded, setExpanded] = useState(false);
  const [newLvl, setNewLvl] = useState("");
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(dept.name);

  const commitRename = () => {
    onRenameDept(dept, editName);
    setEditing(false);
  };
  const cancelRename = () => {
    setEditName(dept.name);
    setEditing(false);
  };

  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
        <div className="flex items-center gap-2.5 flex-1 min-w-0" onClick={() => !editing && setExpanded((p) => !p)} style={{ cursor: editing ? "default" : "pointer" }}>
          <div className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />
          {editing ? (
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") cancelRename(); }}
              onClick={(e) => e.stopPropagation()}
              className="input !py-1 !px-2 text-sm font-semibold flex-1 min-w-0"
            />
          ) : (
            <span className="text-sm font-semibold text-slate-700 truncate">{dept.name}</span>
          )}
          {!editing && <span className="text-xs text-slate-400 flex-shrink-0">{(dept.levels || []).length} level{(dept.levels || []).length !== 1 ? "s" : ""}</span>}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          {editing ? (
            <>
              <button onClick={commitRename} className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Save"><FiCheck size={13} /></button>
              <button onClick={cancelRename} className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors" title="Cancel"><FiX size={13} /></button>
            </>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); setEditing(true); }} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors" title="Rename"><FiEdit2 size={13} /></button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onRemoveDept(dept.id); }} className="text-xs text-red-500 hover:text-red-700 font-medium hover:bg-red-50 px-2 py-1 rounded-lg transition-colors">Remove</button>
          {!editing && <span className="text-slate-400 text-xs cursor-pointer" onClick={() => setExpanded((p) => !p)}>{expanded ? "▲" : "▼"}</span>}
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/50">
          <div className="flex flex-wrap gap-2 mb-3">
            {(dept.levels || []).map((lvl) => (
              <span key={lvl} className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
                {lvl}
                <button onClick={() => setConfirm({ title: "Remove Level?", message: `Remove "${lvl}" from ${dept.name}?`, confirmLabel: "Remove", onConfirm: () => onRemoveLevel(dept, lvl) })} className="text-slate-400 hover:text-red-500 transition-colors leading-none">&times;</button>
              </span>
            ))}
            {(dept.levels || []).length === 0 && <span className="text-xs text-slate-400">No levels yet</span>}
          </div>
          <div className="flex gap-2">
            <input type="text" value={newLvl} onChange={(e) => setNewLvl(e.target.value)} placeholder="Add level e.g. 500L" className="input flex-1 text-sm !py-1.5" onKeyDown={(e) => { if (e.key === "Enter") { onAddLevel(dept, newLvl); setNewLvl(""); }}} />
            <button onClick={() => { onAddLevel(dept, newLvl); setNewLvl(""); }} className="btn-success text-xs !px-3 !py-1.5 flex-shrink-0">Add</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
