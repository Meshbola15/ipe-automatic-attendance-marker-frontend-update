// src/pages/StudentLogin.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiHash, FiLogIn, FiArrowLeft } from "react-icons/fi";
import { databaseKeys, loadFromDatabase } from "../utils/database";
import { toast } from "react-toastify";
import LoadingScreen from "../components/loadingScreen";

const StudentLogin = () => {
  const [matricNo, setMatricNo] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("student_remembered");
    if (saved) {
      const { matricNo: savedMatric, student: savedStudent } = JSON.parse(saved);
      setMatricNo(savedMatric);
      setRememberMe(true);
      if (savedStudent) {
        sessionStorage.setItem("student", JSON.stringify(savedStudent));
        navigate(`/student/dashboard/${encodeURIComponent(savedMatric)}`, { replace: true });
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!matricNo.trim()) return;
    setLoading(true);

    try {
      const students = (await loadFromDatabase(databaseKeys.STUDENTS)) || [];
      const student = students.find(
        (s) => s.matricNo?.trim().toLowerCase() === matricNo.trim().toLowerCase()
      );

      if (!student) {
        toast.error("Matric number not found. Please register first.");
        return;
      }

      if (rememberMe) {
        localStorage.setItem("student_remembered", JSON.stringify({ matricNo: student.matricNo, student }));
      } else {
        localStorage.removeItem("student_remembered");
      }
      sessionStorage.setItem("student", JSON.stringify(student));
      navigate(`/student/dashboard/${encodeURIComponent(student.matricNo)}`);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      {loading && <LoadingScreen />}
      <div className="w-full max-w-md">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <FiArrowLeft size={15} /> Back
        </button>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-100 mb-4">
            <FiLogIn className="text-violet-600" size={26} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Student Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Enter your matric number to access your dashboard</p>
        </div>

        <div className="card">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Matric Number</label>
              <div className="relative">
                <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  value={matricNo}
                  onChange={(e) => setMatricNo(e.target.value)}
                  placeholder="e.g. CSC/2021/001"
                  required
                  className="input pl-10 font-mono"
                />
              </div>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-violet-600 cursor-pointer"
              />
              <span className="text-sm text-slate-600">Remember me</span>
            </label>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              <FiLogIn size={15} /> Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
