// src/pages/StudentLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiHash, FiLogIn } from "react-icons/fi";
import { databaseKeys, loadFromDatabase } from "../utils/database";
import { toast } from "react-toastify";
import LoadingScreen from "../components/loadingScreen";

const StudentLogin = () => {
  const [matricNo, setMatricNo] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
