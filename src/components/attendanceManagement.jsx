import React, { useState, useMemo } from "react";
import { FiDownload, FiPlus, FiChevronDown, FiChevronUp, FiInbox, FiLock, FiCheckSquare, FiSearch, FiFilter } from "react-icons/fi";
import ConfirmModal from "./ConfirmModal";

const STATUS_CLASSES = {
  Present:    "badge-present",
  Absent:     "badge-absent",
  Late:       "badge-late",
  Pending:    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200",
  Unverified: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200",
};

const isSessionOpen = (session) => {
  if (session.status === "closed") return false;
  if (!session.closesAt) return true;
  return Date.now() < session.closesAt;
};

const AttendanceManagement = ({
  sortedAttendance,
  setShowNewAttendanceModal,
  toggleOpen,
  openAttendance,
  handleExportAttendance,
  saving,
  handleStudentStatusChange,
  handleCloseSession,
}) => {
  const [selectedStudents, setSelectedStudents] = useState({});
  const [bulkStatus, setBulkStatus] = useState({});
  const [closeTarget, setCloseTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const allDepts = useMemo(() => {
    const depts = [...new Set(sortedAttendance.map((s) => s.department).filter(Boolean))];
    return depts.sort();
  }, [sortedAttendance]);

  const processed = useMemo(() => {
    let list = [...sortedAttendance];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) =>
        s.fileName?.toLowerCase().includes(q) ||
        s.department?.toLowerCase().includes(q) ||
        s.level?.toLowerCase().includes(q)
      );
    }
    if (filterDept) list = list.filter((s) => s.department === filterDept);
    if (filterStatus === "open") list = list.filter((s) => isSessionOpen(s));
    if (filterStatus === "closed") list = list.filter((s) => !isSessionOpen(s));
    list.sort((a, b) => {
      const da = new Date(`${a.date} ${a.time}`);
      const db = new Date(`${b.date} ${b.time}`);
      return sortOrder === "desc" ? db - da : da - db;
    });
    return list;
  }, [sortedAttendance, search, filterDept, filterStatus, sortOrder]);

  const groupedByLevel = useMemo(() => {
    const groups = {};
    processed.forEach((s) => {
      const lvl = s.level || "No Level";
      if (!groups[lvl]) groups[lvl] = [];
      groups[lvl].push(s);
    });
    return Object.keys(groups).sort().map((level) => ({ level, sessions: groups[level] }));
  }, [processed]);

  const [openLevels, setOpenLevels] = useState(() => ({}));
  const toggleLevel = (lvl) => setOpenLevels((p) => ({ ...p, [lvl]: !p[lvl] }));
  const isLevelOpen = (lvl) => openLevels[lvl] !== false;

  const getSelected = (sessionId) => selectedStudents[sessionId] || new Set();

  const toggleStudent = (sessionId, matricNo) => {
    setSelectedStudents((prev) => {
      const cur = new Set(prev[sessionId] || []);
      cur.has(matricNo) ? cur.delete(matricNo) : cur.add(matricNo);
      return { ...prev, [sessionId]: cur };
    });
  };

  const toggleAll = (session) => {
    const cur = getSelected(session.id);
    const all = new Set((session.attendees || []).map((a) => a.matricNo));
    const newSet = cur.size === all.size ? new Set() : all;
    setSelectedStudents((prev) => ({ ...prev, [session.id]: newSet }));
  };

  const applyBulk = (session, index) => {
    const status = bulkStatus[session.id];
    if (!status) return;
    const selected = getSelected(session.id);
    if (!selected.size) return;
    selected.forEach((matricNo) => {
      const sIdx = session.attendees.findIndex((a) => a.matricNo === matricNo);
      if (sIdx !== -1) handleStudentStatusChange(session, sIdx, status);
    });
    setSelectedStudents((prev) => ({ ...prev, [session.id]: new Set() }));
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">Attendance Sessions</h2>
          <p className="text-xs text-slate-500 mt-0.5">{processed.length} of {sortedAttendance.length} session{sortedAttendance.length !== 1 ? "s" : ""}</p>
        </div>
        {setShowNewAttendanceModal && (
          <button
            className="btn-success flex items-center gap-2"
            onClick={() => setShowNewAttendanceModal(true)}
          >
            <FiPlus size={15} /> New Session
          </button>
        )}
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="relative flex-1 min-w-36">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sessions…"
            className="input !py-1.5 pl-8 text-xs"
          />
        </div>
        {allDepts.length > 1 && (
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="input !py-1.5 !px-2 text-xs w-36">
            <option value="">All departments</option>
            {allDepts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        )}
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input !py-1.5 !px-2 text-xs w-28">
          <option value="">All status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
        <button
          onClick={() => setSortOrder((o) => o === "desc" ? "asc" : "desc")}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          title="Toggle sort order"
        >
          <FiFilter size={12} />
          {sortOrder === "desc" ? "Newest first" : "Oldest first"}
        </button>
      </div>

      {/* List */}
      {sortedAttendance.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <FiInbox size={36} className="mb-3 opacity-40" />
          <p className="text-sm text-slate-500">No attendance sessions yet</p>
        </div>
      ) : processed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <FiSearch size={36} className="mb-3 opacity-40" />
          <p className="text-sm text-slate-500">No sessions match your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groupedByLevel.map(({ level, sessions }) => (
            <div key={level} className="border border-slate-200 rounded-xl overflow-hidden">
              {/* Level accordion header */}
              <button
                type="button"
                onClick={() => toggleLevel(level)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">{level}</span>
                  <span className="text-xs text-slate-500">{sessions.length} session{sessions.length !== 1 ? "s" : ""}</span>
                </div>
                <span className="text-slate-400">{isLevelOpen(level) ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}</span>
              </button>

              {/* Sessions inside level */}
              {isLevelOpen(level) && (
                <div className="p-3 space-y-2">
          {sessions.map((attendance) => {
            const index = sortedAttendance.indexOf(attendance);
            const presentCount = attendance?.attendees?.filter(a => a.status === "Present")?.length ?? 0;
            const pendingCount = attendance?.attendees?.filter(a => a.status === "Pending")?.length ?? 0;
            const totalCount = attendance?.attendees?.length ?? 0;
            const isExpanded = openAttendance[attendance.fileName];
            const open = isSessionOpen(attendance);
            const selected = getSelected(attendance.id);
            const allSelected = totalCount > 0 && selected.size === totalCount;

            return (
              <div key={attendance.id || index} className="border border-slate-100 rounded-xl overflow-hidden">
                {/* Row header */}
                <div
                  className="flex items-start justify-between px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors gap-2"
                  onClick={() => toggleOpen(attendance.fileName)}
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800 text-sm truncate">{attendance.fileName || "Untitled"}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        open
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}>
                        {open ? "Open" : "Closed"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-xs text-slate-500">{attendance.date}</span>
                      {attendance.department && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 border border-violet-100">{attendance.department}</span>
                      )}
                      {attendance.level && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">{attendance.level}</span>
                      )}
                      {totalCount > 0 && (
                        <span className="text-xs font-medium text-emerald-600">{presentCount}/{totalCount} present</span>
                      )}
                      {pendingCount > 0 && (
                        <span className="text-xs font-medium text-amber-600">{pendingCount} pending</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {open && handleCloseSession && (
                      <button
                        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                        onClick={(e) => { e.stopPropagation(); setCloseTarget(attendance); }}
                        title="Close session"
                      >
                        <FiLock size={12} /> Close
                      </button>
                    )}
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-600 transition-colors"
                      onClick={(e) => { e.stopPropagation(); handleExportAttendance(index); }}
                      disabled={saving}
                      title="Export CSV"
                    >
                      <FiDownload size={14} />
                    </button>
                    <span className="text-slate-400">
                      {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                    </span>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-slate-100">
                    {attendance.attendees && attendance.attendees.length > 0 ? (
                      <>
                        {/* Bulk action toolbar */}
                        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={() => toggleAll(attendance)}
                            className="rounded border-slate-300 text-violet-600 cursor-pointer flex-shrink-0"
                            title="Select all"
                          />
                          <span className="text-xs text-slate-500 flex-shrink-0">{selected.size > 0 ? `${selected.size} selected` : "Select rows"}</span>
                          {selected.size > 0 && (
                            <div className="flex items-center gap-2 ml-auto">
                              <select
                                value={bulkStatus[attendance.id] || ""}
                                onChange={(e) => setBulkStatus((prev) => ({ ...prev, [attendance.id]: e.target.value }))}
                                className="input !py-1 !px-2 text-xs w-28"
                              >
                                <option value="">Set status…</option>
                                <option value="Present">Present</option>
                                <option value="Absent">Absent</option>
                                <option value="Late">Late</option>
                                <option value="Unverified">Unverified</option>
                              </select>
                              <button
                                onClick={() => applyBulk(attendance, index)}
                                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors whitespace-nowrap"
                              >
                                <FiCheckSquare size={12} /> Apply
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[520px]">
                            <thead>
                              <tr className="bg-slate-50">
                                <th className="px-4 py-2.5 w-8"></th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Matric No.</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Check-in</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Override</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {attendance.attendees.map((student, sIdx) => (
                                <tr
                                  key={sIdx}
                                  className={`hover:bg-slate-50 transition-colors ${selected.has(student.matricNo) ? "bg-violet-50" : ""}`}
                                >
                                  <td className="px-4 py-2.5">
                                    <input
                                      type="checkbox"
                                      checked={selected.has(student.matricNo)}
                                      onChange={() => toggleStudent(attendance.id, student.matricNo)}
                                      className="rounded border-slate-300 text-violet-600 cursor-pointer"
                                    />
                                  </td>
                                  <td className="px-4 py-2.5 text-sm font-medium text-slate-800">
                                    {student.name}
                                    {student.selfCheckedIn && (
                                      <span className="ml-2 text-[10px] text-violet-500 font-normal">self</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2.5 text-sm text-slate-500 font-mono">{student.matricNo}</td>
                                  <td className="px-4 py-2.5 text-xs text-slate-400">{student.checkInTime || student.time || "—"}</td>
                                  <td className="px-4 py-2.5">
                                    <span className={STATUS_CLASSES[student.status] || STATUS_CLASSES.Unverified}>
                                      {student.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <select
                                      value={student.status}
                                      onChange={(e) => handleStudentStatusChange(attendance, sIdx, e.target.value)}
                                      className="input !py-1 !px-2 text-xs w-28"
                                    >
                                      <option value="Present">Present</option>
                                      <option value="Absent">Absent</option>
                                      <option value="Late">Late</option>
                                      <option value="Unverified">Unverified</option>
                                    </select>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm text-slate-400">No attendees recorded for this session.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <ConfirmModal
        open={!!closeTarget}
        title="Close Session?"
        message={`"${closeTarget?.fileName}" will be closed. Remaining Pending entries will be marked Unverified.`}
        confirmLabel="Close Session"
        confirmClass="btn-danger"
        onConfirm={() => { handleCloseSession(closeTarget); setCloseTarget(null); }}
        onCancel={() => setCloseTarget(null)}
      />
    </div>
  );
};

export default AttendanceManagement;
