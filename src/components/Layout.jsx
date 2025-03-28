// src/pages/Layout.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiHome,
  FiUserPlus,
  FiCameraOff,
  FiLogIn,
  FiMenu,
  FiX,
  FiList,
} from "react-icons/fi";
import backgroundImage from "../assets/ipe-logo.svg";

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { to: "/", icon: <FiHome />, text: "Dashboard" },
    { to: "/register", icon: <FiUserPlus />, text: "Register Student" },
    { to: "/login", icon: <FiLogIn />, text: "Student Login" },
    { to: "/attendance", icon: <FiList />, text: "Attendance Records" },
    { to: "/students", icon: <FiCameraOff />, text: "Students List" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 right-4 z-50 bg-purple-600 text-white p-2 rounded-lg"
      >
        {isMobileMenuOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Sidebar */}
      <div
        className={`bg-purple-800 text-white w-64 fixed h-full transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-8">Attendance System</h2>
          <nav className="space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center space-x-3 p-3 hover:bg-purple-700 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.text}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content with Background Image and Reduced Opacity */}
      <main className="flex-1 md:ml-64 bg-purple-50 min-h-screen relative">
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 bg-no-repeat bg-center bg-contain"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            opacity: 0.1, // Adjust opacity here
            zIndex: 0, // Keeps it behind content
          }}
        />

        {/* Content Layer */}
        <div className="relative z-10 p-6">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
