// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadFromDatabase, databaseKeys } from "../utils/database";
import { FiUsers, FiChevronRight, FiArrowLeft, FiClock, FiHash, FiCalendar, FiInbox } from "react-icons/fi";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [attendanceLists, setAttendanceLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [loadingLists, setLoadingLists] = useState(true);

  useEffect(() => {
    const getAttendanceLists = async () => {
      setLoadingLists(true);
      const data = await loadFromDatabase(databaseKeys.ATTENDANCE);
      setAttendanceLists(data || []);
      setLoadingLists(false);
    };
    getAttendanceLists();
  }, []);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {selectedList ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {/* Page header */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setSelectedList(null)}
                className="btn-secondary !px-3 !py-2 flex items-center gap-1.5"
              >
                <FiArrowLeft size={15} /> Back
              </button>
              <div>
                <h1 className="page-title !mb-0">{selectedList?.fileName}</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedList?.date}
                  {selectedList?.department && <> &middot; {selectedList.department}</>}
                  {selectedList?.level && <> &middot; <span className="text-emerald-600 font-medium">{selectedList.level}</span></>}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div className="card !p-4">
                <p className="text-xs text-slate-500 mb-1">Total Attendees</p>
                <p className="text-2xl font-bold text-slate-800">{selectedList?.attendees?.length ?? 0}</p>
              </div>
              <div className="card !p-4">
                <p className="text-xs text-slate-500 mb-1">Present</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {selectedList?.attendees?.filter(a => a.status === "Present").length ?? 0}
                </p>
              </div>
              <div className="card !p-4 col-span-2 sm:col-span-1">
                <p className="text-xs text-slate-500 mb-1">Department</p>
                <p className="text-sm font-semibold text-slate-700 truncate">{selectedList?.department || "—"}</p>
              </div>
            </div>

            {/* Entries */}
            <div className="card">
              <h2 className="text-base font-semibold text-slate-800 mb-4">Attendance Entries</h2>
              {selectedList?.attendees?.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {selectedList.attendees.map((entry, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xs">
                          {entry?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{entry?.name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <FiHash size={10} />{entry?.matricNo}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 hidden sm:flex items-center gap-1">
                          <FiClock size={11} />{entry?.time}
                        </span>
                        <span className={
                          entry?.status === "Present" ? "badge-present" :
                          entry?.status === "Late" ? "badge-late" : "badge-absent"
                        }>
                          {entry?.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <FiInbox size={36} className="mb-3 opacity-50" />
                  <p className="text-sm">No entries recorded yet</p>
                </div>
              )}
            </div>

            {/* Switch list */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-slate-600 mb-3">Switch to another list</h3>
              <ListGrid lists={attendanceLists} onSelect={setSelectedList} selected={selectedList} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6">
              <h1 className="page-title">Dashboard</h1>
              <p className="page-subtitle">Select an attendance session to view its entries</p>
            </div>

            {loadingLists ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
              </div>
            ) : !attendanceLists || attendanceLists.length === 0 ? (
              <div className="card flex flex-col items-center justify-center py-16 text-slate-400">
                <FiInbox size={44} className="mb-4 opacity-40" />
                <p className="text-base font-medium text-slate-600">No attendance lists yet</p>
                <p className="text-sm mt-1">
                  <Link to="/admin" className="text-violet-600 hover:underline">Login as admin</Link> to create a session
                </p>
              </div>
            ) : (
              <ListGrid lists={attendanceLists} onSelect={setSelectedList} selected={null} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ListGrid = ({ lists, onSelect, selected }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {lists.map((list, index) => (
      <motion.div
        key={index}
        whileHover={{ y: -2 }}
        onClick={() => onSelect(list)}
        className={`card cursor-pointer border-2 transition-all duration-150 ${
          selected?.id === list.id ? "border-violet-500 shadow-md" : "border-transparent hover:border-violet-200"
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
            <FiCalendar className="text-violet-600" size={16} />
          </div>
          <FiChevronRight className="text-slate-300" size={18} />
        </div>
        <p className="font-semibold text-slate-800 text-sm truncate">{list?.fileName}</p>
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span className="text-xs text-slate-500">{list?.date}</span>
          {list?.department && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 border border-violet-100">{list.department}</span>}
          {list?.level && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">{list.level}</span>}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <FiUsers size={13} className="text-violet-400" />
          {list?.attendees?.length ?? 0} attendee{list?.attendees?.length !== 1 ? "s" : ""}
        </div>
      </motion.div>
    ))}
  </div>
);

export default Dashboard;
