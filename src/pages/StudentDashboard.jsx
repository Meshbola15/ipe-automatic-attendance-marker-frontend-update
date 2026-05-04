// src/pages/StudentDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { databaseKeys, loadFromDatabase, saveToDatabase } from "../utils/database";
import {
  FiLogOut, FiClock, FiHash, FiBook, FiInbox,
  FiCheckCircle, FiAlertCircle, FiCalendar, FiRefreshCw, FiArrowLeft,
} from "react-icons/fi";
import LoadingScreen from "../components/loadingScreen";

const STATUS_BADGE = {
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

const StudentDashboard = () => {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [allSessions, setAllSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(null); // session id being checked in

  // Load student from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("student");
    if (!stored) {
      navigate("/login");
      return;
    }
    setStudent(JSON.parse(stored));
  }, [navigate]);

  const fetchSessions = async () => {
    setLoading(true);
    const data = (await loadFromDatabase(databaseKeys.ATTENDANCE)) || [];
    setAllSessions(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    if (student) fetchSessions();
  }, [student]);

  // Sessions matching student's department
  const mySessions = allSessions.filter(
    (s) => s.department === student?.department
  );

  const openSessions = mySessions.filter(isSessionOpen);
  const pastSessions = mySessions.filter((s) => !isSessionOpen(s));

  const getMyEntry = (session) =>
    session.attendees?.find((a) => a.matricNo === student?.matricNo) || null;

  const handleCheckIn = async (session) => {
    setCheckingIn(session.id);
    try {
      const fresh = (await loadFromDatabase(databaseKeys.ATTENDANCE)) || [];
      const freshSession = (Array.isArray(fresh) ? fresh : []).find(
        (s) => s.id === session.id
      );

      if (!freshSession) {
        toast.error("Session not found.");
        return;
      }

      const alreadyIn = freshSession.attendees?.some(
        (a) => a.matricNo === student.matricNo
      );
      if (alreadyIn) {
        toast.info("You have already checked in to this session.");
        return;
      }

      if (!isSessionOpen(freshSession)) {
        toast.error("This session has closed.");
        await fetchSessions();
        return;
      }

      const entry = {
        id: Date.now(),
        name: student.name,
        matricNo: student.matricNo,
        status: "Pending",
        selfCheckedIn: true,
        checkInTime: new Date().toLocaleTimeString(),
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        verifiedByAI: false,
        verifiedAt: null,
      };

      const updatedSession = {
        ...freshSession,
        attendees: [...(freshSession.attendees || []), entry],
      };

      await saveToDatabase(databaseKeys.ATTENDANCE, updatedSession);
      toast.success("Checked in! Awaiting AI verification.");
      await fetchSessions();
    } catch (err) {
      console.error(err);
      toast.error("Check-in failed. Please try again.");
    } finally {
      setCheckingIn(null);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("student");
    navigate("/login");
  };

  if (!student) return null;

  return (
    <div className="w-full">
      {loading && <LoadingScreen />}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors">
        <FiArrowLeft size={15} /> Back
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-lg flex-shrink-0">
            {student.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{student.name}</h1>
            <p className="text-sm text-slate-500 flex flex-wrap items-center gap-1.5">
              <FiHash size={12} />
              <span className="font-mono">{student.matricNo}</span>
              <span>&middot;</span>
              <FiBook size={12} />
              {student.department}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSessions}
            className="btn-secondary !px-3 !py-2 flex items-center gap-1.5"
            title="Refresh"
          >
            <FiRefreshCw size={14} />
          </button>
          <button
            onClick={handleLogout}
            className="btn-danger flex items-center gap-2"
          >
            <FiLogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* Open Sessions */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-slate-800 mb-3">
          Open Sessions
          {openSessions.length > 0 && (
            <span className="ml-2 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              {openSessions.length} active
            </span>
          )}
        </h2>

        {openSessions.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-12 text-slate-400">
            <FiCalendar size={32} className="mb-3 opacity-40" />
            <p className="text-sm text-slate-500">No open sessions for your department right now</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {openSessions.map((session) => {
                const myEntry = getMyEntry(session);
                const isProcessing = checkingIn === session.id;

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card border-2 border-transparent hover:border-violet-200 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <FiCalendar className="text-emerald-600" size={16} />
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Open
                      </span>
                    </div>

                    <p className="font-semibold text-slate-800 text-sm truncate">{session.fileName}</p>
                    <p className="text-xs text-slate-500 mt-0.5 mb-1">{session.date}</p>
                    {session.closesAt && (
                      <p className="text-xs text-amber-600 flex items-center gap-1 mb-3">
                        <FiClock size={11} />
                        Closes at {new Date(session.closesAt).toLocaleTimeString()}
                      </p>
                    )}

                    {myEntry ? (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500">Your status</span>
                        <span className={STATUS_BADGE[myEntry.status] || STATUS_BADGE.Pending}>
                          {myEntry.status}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCheckIn(session)}
                        disabled={isProcessing}
                        className="btn-primary w-full mt-3 flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                            Checking in…
                          </>
                        ) : (
                          <>
                            <FiCheckCircle size={14} /> Mark Myself Present
                          </>
                        )}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Attendance History */}
      <section>
        <h2 className="text-base font-bold text-slate-800 mb-3">Attendance History</h2>

        {pastSessions.length === 0 && openSessions.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-12 text-slate-400">
            <FiInbox size={32} className="mb-3 opacity-40" />
            <p className="text-sm text-slate-500">No attendance records yet</p>
          </div>
        ) : (
          <div className="card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[420px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Session</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Check-in</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {/* Show all sessions (open + past) with this student's entry */}
                {mySessions.map((session, i) => {
                  const entry = getMyEntry(session);
                  return (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-slate-800 max-w-[160px] truncate">
                        {session.fileName}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{session.date}</td>
                      <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                        {entry ? (
                          <span className="flex items-center gap-1 text-xs">
                            <FiClock size={11} /> {entry.checkInTime || entry.time || "—"}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {entry ? (
                          <span className={STATUS_BADGE[entry.status] || STATUS_BADGE.Unverified}>
                            {entry.status}
                          </span>
                        ) : (
                          <span className={STATUS_BADGE.Absent}>Absent</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentDashboard;
