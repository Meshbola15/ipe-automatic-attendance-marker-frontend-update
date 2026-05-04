import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { databaseKeys, loadFromDatabase } from "../utils/database";
import { useAdminContext } from "../context/adminContext";
import LoadingScreen from "../components/loadingScreen";
import { comparePassword } from "../utils/brcrypt";
import { FiLock, FiUser } from "react-icons/fi";
import { RiAdminLine } from "react-icons/ri";

const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAdminDetails } = useAdminContext();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const rawAdmins = await loadFromDatabase(databaseKeys.ADMIN);
      if (!rawAdmins) { toast.error("No admin accounts found."); return; }
      const admins = Object.values(rawAdmins);

      const user = await Promise.all(
        admins.map(async (admin) => {
          const isMatch = await comparePassword(password, admin.password);
          return isMatch && admin.username === username ? admin : null;
        })
      );

      const validUser = user.find((u) => u !== null);

      if (validUser) {
        if (!validUser.verified) {
          toast.error("Your account is pending approval. Please wait for a super-admin to verify you in Firebase.");
          return;
        }
        setPassword("");
        setUsername("");
        localStorage.setItem("admin", JSON.stringify(validUser));
        setAdminDetails(validUser);
        navigate(`/admin/dashboard/${validUser.id}`);
        toast.success("Login successful!");
      } else {
        toast.error("Invalid username or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      {loading && <LoadingScreen />}
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-100 mb-4">
            <RiAdminLine className="text-violet-600" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Login</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to manage the attendance system</p>
        </div>

        {/* Card */}
        <div className="card">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="input pl-10"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full mt-2">
              Sign In
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Don&apos;t have an account?{" "}
          <Link to="/admin-sign-up" className="text-violet-600 font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
