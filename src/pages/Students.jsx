// src/pages/StudentsPage.jsx
import { useEffect, useState } from "react";
import { loadFromDatabase, databaseKeys, removeFromDatabase } from "../utils/database";
import { exportToCSV } from "../utils/exportCSV";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiDownload, FiSearch, FiInbox, FiTrash2,
  FiArrowLeft, FiUsers, FiChevronRight,
} from "react-icons/fi";
import ConfirmModal from "../components/ConfirmModal";

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const isAdmin = !!localStorage.getItem("admin");

  const fetchStudents = async () => {
    setLoading(true);
    const saved = (await loadFromDatabase(databaseKeys.STUDENTS)) || [];
    saved.sort((a, b) => a?.matricNo?.split("/").at(-1) - b?.matricNo?.split("/").at(-1));
    setStudents(Array.isArray(saved) ? saved : []);
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, []);

  // Build dept → students map
  const deptMap = students.reduce((acc, s) => {
    const d = s.department || "Unassigned";
    if (!acc[d]) acc[d] = [];
    acc[d].push(s);
    return acc;
  }, {});
  const departments = Object.keys(deptMap).sort();

  const deptStudents = selectedDept ? (deptMap[selectedDept] || []) : [];

  const filtered = deptStudents.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.matricNo?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const data = selectedDept ? deptStudents : students;
    const suffix = selectedDept ? `-${selectedDept}` : "";
    exportToCSV(data, `students${suffix}.csv`);
  };

  const handleDelete = (student) => setDeleteTarget(student);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    setDeleteTarget(null);
    try {
      await removeFromDatabase(databaseKeys.STUDENTS, deleteTarget.id);
      toast.success(`${deleteTarget.name} removed successfully.`);
      await fetchStudents();
    } catch {
      toast.error("Failed to remove student.");
    } finally {
      setDeletingId(null);
    }
  };

  const view = !selectedDept ? "depts" : "students";

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">

        {/* ── View 1: Department grid ── */}
        {view === "depts" && (
          <motion.div key="depts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="page-title">Registered Students</h1>
                <p className="page-subtitle !mb-0">{students.length} student{students.length !== 1 ? "s" : ""} across {departments.length} department{departments.length !== 1 ? "s" : ""}</p>
              </div>
              <button onClick={handleExport} className="btn-success flex items-center gap-2 self-start sm:self-auto">
                <FiDownload size={15} /> Export All
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" /></div>
            ) : departments.length === 0 ? (
              <div className="card flex flex-col items-center justify-center py-16 text-slate-400">
                <FiInbox size={36} className="mb-3 opacity-40" />
                <p className="text-sm text-slate-500">No students registered yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map((dept) => {
                  const total = deptMap[dept].length;
                  return (
                    <motion.div key={dept} whileHover={{ y: -2 }} onClick={() => { setSelectedDept(dept); setSearch(""); }} className="card cursor-pointer border-2 border-transparent hover:border-violet-200 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center"><FiUsers className="text-violet-600" size={18} /></div>
                        <FiChevronRight className="text-slate-300 mt-1" size={18} />
                      </div>
                      <p className="font-semibold text-slate-800 text-sm">{dept}</p>
                      <p className="text-xs text-slate-500 mt-1">{total} student{total !== 1 ? "s" : ""}</p>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ── View 2: Student table ── */}
        {view === "students" && (
          <motion.div key="students" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <button onClick={() => { setSelectedDept(null); setSearch(""); }} className="btn-secondary !px-3 !py-2 flex items-center gap-1.5">
                  <FiArrowLeft size={15} /> Back
                </button>
                <div>
                  <h1 className="page-title !mb-0">{selectedDept}</h1>
                  <p className="text-xs text-slate-500 mt-0.5">{deptStudents.length} student{deptStudents.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <button onClick={handleExport} className="btn-success flex items-center gap-2 self-start sm:self-auto">
                <FiDownload size={15} /> Export
              </button>
            </div>

            <div className="relative mb-5">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or matric number…" className="input pl-10" />
            </div>

            <div className="card !p-0 overflow-hidden">
              {filtered.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Matric Number</th>
                        {isAdmin && <th className="px-5 py-3.5 w-10" />}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filtered.map((student, index) => (
                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3.5 text-sm text-slate-400 font-medium">{index + 1}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xs flex-shrink-0">{student.name?.charAt(0)?.toUpperCase()}</div>
                              <span className="font-medium text-slate-800 text-sm">{student.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-slate-600 font-mono">{student.matricNo}</td>
                          {isAdmin && (
                            <td className="px-5 py-3.5">
                              <button onClick={() => handleDelete(student)} disabled={deletingId === student.id} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40" title="Remove student">
                                {deletingId === student.id ? <div className="w-3.5 h-3.5 rounded-full border-2 border-red-300 border-t-red-500 animate-spin" /> : <FiTrash2 size={14} />}
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <FiSearch size={36} className="mb-3 opacity-40" />
                  <p className="text-sm text-slate-500">No students match &ldquo;{search}&rdquo;</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      <ConfirmModal
        open={!!deleteTarget}
        title="Remove Student?"
        message={`Remove ${deleteTarget?.name} (${deleteTarget?.matricNo}) from the system? This cannot be undone.`}
        confirmLabel="Remove"
        confirmClass="btn-danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default StudentsPage;
