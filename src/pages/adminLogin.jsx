import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  databaseKeys,
  deleteFromDatabase,
  loadFromDatabase,
} from "../utils/database";
import { useAdminContext } from "../context/adminContext";
import LoadingScreen from "../components/loadingScreen";
import { comparePassword } from "../utils/brcrypt";
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
      const admins = Object.values(rawAdmins);
      console.log(admins)

      const user = await Promise.all(
        admins.map(async (admin) => {
          const isMatch = await comparePassword(password, admin.password);
          return isMatch && admin.username === username ? admin : null;
        })
      );

      const validUser = user.find((u) => u !== null);

      if (validUser) {
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
    <div className="h-full w-full flex items-center justify-center">
      {loading && <LoadingScreen />}
      <form
        onSubmit={handleLogin}
        className="max-w-md w-full bg-white p-8 rounded shadow"
      >
        <h1 className="text-2xl font-bold text-purple-600 mb-6 text-center">
          Admin Login
        </h1>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5"
          />
        </div>

        <button
          type="submit"
          className="text-white bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
