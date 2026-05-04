// src/pages/AttendancePage.jsx
import { useEffect, useState } from "react";
import { loadFromDatabase, databaseKeys } from "../utils/database";
import { exportToCSV } from "../utils/exportCSV";
import { FiCalendar, FiClock, FiUser, FiHash, FiDownload, FiChevronUp, FiChevronDown, FiInbox, FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const AttendancePage = () => {
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = (await loadFromDatabase(databaseKeys.ATTENDANCE)) || [];
      // Flatten sessions → individual entries, attaching session metadata
      const flat = (Array.isArray(data) ? data : []).flatMap((session) =>
        (session.attendees || []).map((entry) => ({
          session: session.fileName,
          department: session.department,
          date: entry.date || session.date,
          time: entry.checkInTime || entry.time || session.time,
          name: entry.name,
          matricNo: entry.matricNo,
          status: entry.status,
        }))
      );
      setAttendance(flat);
      setLoading(false);
    };
    fetch();
  }, []);

  const sortedAttendance = [...attendance].sort((a, b) => {
    if (sortConfig.direction === "asc") return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
  });

  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const SortIcon = ({ col }) => {
    if (sortConfig.key !== col) return <FiChevronDown size={13} className="opacity-30" />;
    return sortConfig.direction === "asc"
      ? <FiChevronUp size={13} className="text-violet-600" />
      : <FiChevronDown size={13} className="text-violet-600" />;
  };

  const cols = [
    { key: "session", label: "Session", icon: <FiCalendar size={12} /> },
    { key: "date", label: "Date", icon: <FiCalendar size={12} /> },
    { key: "time", label: "Time", icon: <FiClock size={12} /> },
    { key: "name", label: "Name", icon: <FiUser size={12} /> },
    { key: "matricNo", label: "Matric No.", icon: <FiHash size={12} /> },
  ];

  return (
    <div className="w-full">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors">
        <FiArrowLeft size={15} /> Back
      </button>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Attendance Records</h1>
          <p className="page-subtitle !mb-0">{attendance.length} record{attendance.length !== 1 ? "s" : ""} total</p>
        </div>
        <button
          onClick={() => exportToCSV(attendance, "attendance.csv")}
          className="btn-success flex items-center gap-2 self-start sm:self-auto"
        >
          <FiDownload size={15} /> Export CSV
        </button>
      </div>

      <div className="card !p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
          </div>
        ) : sortedAttendance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {cols.map(({ key, label, icon }) => (
                    <th
                      key={key}
                      onClick={() => requestSort(key)}
                      className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-violet-600 transition-colors whitespace-nowrap"
                    >
                      <span className="flex items-center gap-1.5">
                        {icon} {label} <SortIcon col={key} />
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Dept.</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sortedAttendance.map((entry, i) => (
                  <tr key={entry.id ?? i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700 max-w-[140px] truncate">{entry.session}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{entry.date}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{entry.time}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xs flex-shrink-0">
                          {entry.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800 text-sm whitespace-nowrap">{entry.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 font-mono whitespace-nowrap">{entry.matricNo}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{entry.department}</td>
                    <td className="px-4 py-3">
                      <span className={
                        entry.status === "Present" ? "badge-present" :
                        entry.status === "Late" ? "badge-late" :
                        entry.status === "Pending" ? "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200" :
                        entry.status === "Unverified" ? "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200" :
                        "badge-absent"
                      }>
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FiInbox size={36} className="mb-3 opacity-40" />
            <p className="text-sm text-slate-500">No attendance records found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
