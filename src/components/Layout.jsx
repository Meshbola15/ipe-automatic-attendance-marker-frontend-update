// src/pages/Layout.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiUserPlus,
  FiLogIn,
  FiMenu,
  FiX,
  FiUsers,
} from "react-icons/fi";
import { RiAdminLine, RiGraduationCapLine } from "react-icons/ri";
import backgroundImage from "../assets/ipe-logo.svg";

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: "/", icon: <FiHome size={18} />, text: "Dashboard" },
    { to: "/register", icon: <FiUserPlus size={18} />, text: "Register Student" },
    { to: "/login", icon: <FiLogIn size={18} />, text: "Student Portal" },
    { to: "/lecturer", icon: <RiGraduationCapLine size={18} />, text: "Lecturer Portal" },
    { to: "/admin", icon: <RiAdminLine size={18} />, text: "Admin Login" },
    { to: "/students", icon: <FiUsers size={18} />, text: "Students List" },
  ];

  const isActive = (path) =>
    path === "/" || path === "/admin" || path === "/lecturer"
      ? location.pathname === path
      : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen flex" style={{ background: "#f4f5f8" }}>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-[110] bg-violet-600 text-white p-2.5 rounded-xl shadow-lg shadow-violet-500/30"
      >
        {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`w-64 fixed h-full flex flex-col transition-transform duration-300 z-[100] ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        style={{
          background: "linear-gradient(180deg, #1e1b4b 0%, #2e1065 100%)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.18)",
        }}
      >
        {/* Brand */}
        <div className="px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.12)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)" }}>
              <img src={backgroundImage} alt="IPE Logo" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] leading-none mb-1" style={{ color: "rgba(167,139,250,0.8)" }}>IPE System</p>
              <h2 className="text-[14px] font-bold leading-none text-white">Attendance Marker</h2>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 mb-4" style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 relative group ${
                  active ? "text-white" : "text-violet-300/70 hover:text-white"
                }`}
                style={active ? {
                  background: "rgba(255,255,255,0.12)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
                } : {}}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-violet-400" />
                )}
                <span className={`flex-shrink-0 transition-colors ${
                  active ? "text-violet-300" : "text-violet-400/60 group-hover:text-violet-300"
                }`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.text}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mx-5 mt-4" style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />
        <div className="px-5 py-4 flex items-center justify-between">
          <p className="text-[11px] font-medium" style={{ color: "rgba(167,139,250,0.5)" }}>
            © {new Date().getFullYear()} IPE
          </p>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(167,139,250,0.15)", color: "rgba(167,139,250,0.8)" }}>v2.0</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen relative">
        {/* Watermark */}
        <div
          className="pointer-events-none fixed inset-0 md:left-64 bg-no-repeat bg-center bg-contain"
          style={{ backgroundImage: `url(${backgroundImage})`, opacity: 0.025, zIndex: 0 }}
        />
        {/* Content */}
        <div className="relative z-10 p-5 pt-16 md:pt-8 md:p-8 md:pl-10">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
