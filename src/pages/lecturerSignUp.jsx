import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { databaseKeys, loadFromDatabase, saveToDatabase } from "../utils/database";
import { v4 as uuidv4 } from "uuid";
import { hashPassword } from "../utils/brcrypt";
import { FiLock, FiUser, FiBook, FiCheck, FiArrowLeft } from "react-icons/fi";
import { RiGraduationCapLine } from "react-icons/ri";
import LoadingScreen from "../components/loadingScreen";

const LecturerSignUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [departments, setDepartments] = useState([]);
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadFromDatabase(databaseKeys.DEPARTMENTS).then((data) => {
      setDepartments(Array.isArray(data) ? data : []);
    });
  }, []);

  const toggleDept = (name) => {
    setSelectedDepts((prev) =>
      prev.includes(name) ? prev.filter((d) => d !== name) : [...prev, name]
    );
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (selectedDepts.length === 0) {
      toast.error("Select at least one department");
      return;
    }
    setLoading(true);
    try {
      const existing = (await loadFromDatabase(databaseKeys.LECTURERS)) || [];
      const arr = Array.isArray(existing) ? existing : [];
      if (arr.some((l) => l.username === username)) {
        toast.error("Username already taken");
        return;
      }
      const newLecturer = {
        id: uuidv4(),
        username,
        password: await hashPassword(password),
        departments: selectedDepts,
        status: "pending",
      };
      await saveToDatabase(databaseKeys.LECTURERS, newLecturer);
      toast.success("Application submitted! Awaiting admin approval.");
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 mb-6">
            <svg className="text-amber-500 w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Application Submitted</h1>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Your lecturer account is pending approval by the department admin.<br />
            You&apos;ll be able to log in once approved.
          </p>
          <Link to="/lecturer" className="btn-primary inline-block">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      {loading && <LoadingScreen />}
      <div className="w-full max-w-md">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <FiArrowLeft size={15} /> Back
        </button>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 mb-4">
            <RiGraduationCapLine className="text-emerald-600" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Lecturer Sign Up</h1>
          <p className="text-sm text-slate-500 mt-1">Apply to join one or more departments</p>
        </div>

        <div className="card">
          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a username" required className="input pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a strong password" required className="input pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <FiBook className="inline mr-1.5" size={13} />
                Department(s) — select all that apply
              </label>
              {departments.length === 0 ? (
                <p className="text-xs text-amber-600 py-3 text-center bg-amber-50 rounded-xl border border-amber-100">
                  No departments available yet. Ask your admin to add them first.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {departments.map((dept) => {
                    const active = selectedDepts.includes(dept.name);
                    return (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => toggleDept(dept.name)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors text-left ${
                          active
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${active ? "bg-emerald-500" : "bg-slate-200"}`}>
                          {active && <FiCheck size={10} className="text-white" />}
                        </span>
                        {dept.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary w-full mt-2" disabled={departments.length === 0}>
              Submit Application
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{" "}
          <Link to="/lecturer" className="text-emerald-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default LecturerSignUp;
