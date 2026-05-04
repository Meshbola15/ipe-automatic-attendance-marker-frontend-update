import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdminContext } from "../context/adminContext";
import { toast } from "react-toastify";
import { databaseKeys, loadFromDatabase, saveToDatabase } from "../utils/database";
import { v4 as uuidv4 } from "uuid";
import { hashPassword } from "../utils/brcrypt";
import { FiLock, FiUser } from "react-icons/fi";
import { RiAdminLine } from "react-icons/ri";
import LoadingScreen from "../components/loadingScreen";

const AdminSignUp = () => {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const { setAdminDetails } = useAdminContext();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const existingAdmins = await loadFromDatabase(databaseKeys.ADMIN);
      const admins = Array.isArray(existingAdmins) ? existingAdmins : [];

      const userExists = admins.some((admin) => admin.username === username);

      if (userExists) {
        toast.error("User already exists");
        return;
      }

      const newAdmin = {
        id: uuidv4(),
        username,
        password: await hashPassword(password),
        verified: false,
      };

      await saveToDatabase(databaseKeys.ADMIN, newAdmin);
      toast.success("Account created! Awaiting admin approval.");
      setSubmitted(true);
      setPassword("");
      setUsername("");
    } catch (error) {
      console.error("Sign-up error:", error);
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
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Awaiting Approval</h1>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Your admin account has been created and is pending verification.<br />
            A super-admin must set <code className="bg-slate-100 px-1.5 py-0.5 rounded text-violet-700 font-mono text-xs">verified: true</code> in Firebase before you can log in.
          </p>
          <div className="card !p-4 text-left mb-5 space-y-1">
            <p className="text-xs text-slate-500 font-medium">Firebase path to approve:</p>
            <p className="text-xs font-mono text-violet-700 break-all">admin / &lt;your-id&gt; / verified → true</p>
          </div>
          <Link to="/admin" className="btn-primary inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      {loading && <LoadingScreen />}
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-100 mb-4">
            <RiAdminLine className="text-violet-600" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Create Admin Account</h1>
          <p className="text-sm text-slate-500 mt-1">Set up your administrator credentials</p>
        </div>

        {/* Card */}
        <div className="card">
          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
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
                  placeholder="Choose a strong password"
                  required
                  className="input pl-10"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full mt-2">
              Create Account
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{" "}
          <Link to="/admin" className="text-violet-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminSignUp;
