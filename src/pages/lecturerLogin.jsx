import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { databaseKeys, loadFromDatabase } from "../utils/database";
import { useLecturerContext } from "../context/lecturerContext";
import { comparePassword } from "../utils/brcrypt";
import { FiLock, FiUser, FiArrowLeft } from "react-icons/fi";
import { RiGraduationCapLine } from "react-icons/ri";
import LoadingScreen from "../components/loadingScreen";

const LecturerLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setLecturerDetails } = useLecturerContext();

  useEffect(() => {
    const saved = localStorage.getItem("lecturer_remembered");
    if (saved) {
      setUsername(JSON.parse(saved).username);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const raw = await loadFromDatabase(databaseKeys.LECTURERS);
      if (!raw) { toast.error("No lecturer accounts found."); return; }
      const lecturers = Array.isArray(raw) ? raw : Object.values(raw);

      const matched = await Promise.all(
        lecturers.map(async (l) => {
          const ok = await comparePassword(password, l.password);
          return ok && l.username === username ? l : null;
        })
      );
      const valid = matched.find((l) => l !== null);

      if (!valid) { toast.error("Invalid username or password"); return; }
      if (valid.status === "pending") {
        toast.error("Your application is still pending admin approval.");
        return;
      }
      if (valid.status === "rejected") {
        toast.error("Your application was rejected. Contact your department admin.");
        return;
      }

      if (rememberMe) {
        localStorage.setItem("lecturer_remembered", JSON.stringify({ username: valid.username }));
      } else {
        localStorage.removeItem("lecturer_remembered");
      }
      localStorage.setItem("lecturer", JSON.stringify(valid));
      setLecturerDetails(valid);
      navigate(`/lecturer/dashboard/${valid.id}`);
      toast.success("Login successful!");
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
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 mb-4">
            <RiGraduationCapLine className="text-emerald-600" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Lecturer Login</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to manage your attendance sessions</p>
        </div>

        <div className="card">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" required className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="input pl-10" />
              </div>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 cursor-pointer"
              />
              <span className="text-sm text-slate-600">Remember me</span>
            </label>
            <button type="submit" className="btn-primary w-full mt-2">Sign In</button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          No account?{" "}
          <Link to="/lecturer-sign-up" className="text-emerald-600 font-semibold hover:underline">Apply here</Link>
        </p>
      </div>
    </div>
  );
};

export default LecturerLogin;
