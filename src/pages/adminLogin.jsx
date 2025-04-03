import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const credentials = [
    {
      id: 1,
      password: "admin",
      username: "admin",
    },
    {
      id: 2,
      password: "admin-2332",
      username: "admin-2332",
    },
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    const user = credentials.find(
      (cred) => cred.username === username && cred.password === password
    );

    if (user) {
      setPassword("");
      setUsername("");

      localStorage.setItem("role", "admin");
      navigate("/admin/dashboard");
      toast.success("Login successful!");
    } else {
      toast.error("Invalid username or password");
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center">
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
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
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
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
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
