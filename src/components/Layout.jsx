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
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-[90]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-[110] bg-violet-600 text-white p-2.5 rounded-xl shadow-lg"
      >
        {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-b from-violet-900 to-violet-800 text-white w-64 fixed h-full flex flex-col transition-transform duration-300 z-[100] shadow-2xl ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Brand */}
        <div className="px-6 py-7 border-b border-violet-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <img src={backgroundImage} alt="IPE Logo" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-violet-300 uppercase tracking-widest leading-none mb-0.5">IPE</p>
              <h2 className="text-[15px] font-bold leading-none">Attendance System</h2>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-violet-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className={active ? "text-white" : "text-violet-300"}>
                  {item.icon}
                </span>
                {item.text}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-violet-700/50">
          <p className="text-[11px] text-violet-400 text-center">
            © {new Date().getFullYear()} IPE &mdash; Attendance Marker
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen relative bg-slate-50">
        {/* Watermark */}
        <div
          className="pointer-events-none absolute inset-0 bg-no-repeat bg-center bg-contain"
          style={{ backgroundImage: `url(${backgroundImage})`, opacity: 0.04, zIndex: 0 }}
        />
        {/* Content */}
        <div className="relative z-10 p-5 pt-16 md:pt-8 md:p-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
