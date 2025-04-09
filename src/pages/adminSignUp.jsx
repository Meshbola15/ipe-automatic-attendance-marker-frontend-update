import React, { useState } from "react";
import { useAdminContext } from "../context/adminContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  databaseKeys,
  loadFromDatabase,
  saveToDatabase,
} from "../utils/database";
import { v4 as uuidv4 } from "uuid";
import { hashPassword } from "../utils/brcrypt";

const AdminSignUp = () => {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const { setAdminDetails } = useAdminContext();

  const handleSignUp = async (e) => {
    e.preventDefault();

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
      };

      admins.push(newAdmin);
      await saveToDatabase(databaseKeys.ADMIN, newAdmin); // Handles push internally
      setAdminDetails(newAdmin);
      console.log("New admin:", newAdmin);
      toast.success("User created successfully");

      navigate(`/admin/dashboard/${newAdmin.id}`);
      setPassword("");
      setUsername("");
    } catch (error) {
      console.error("Sign-up error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center mt-8">
      <form
        onSubmit={handleSignUp}
        className="max-w-md w-full bg-white p-8 rounded shadow"
      >
        <h1 className="text-2xl font-bold text-purple-600 mb-6 text-center">
          Admin Sign Up
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
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default AdminSignUp;
