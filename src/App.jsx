import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import RegisterStudent from "./pages/RegisterStudents";
import StudentLogin from "./pages/StudentLogin";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import AttendancePage from "./pages/AttendancePage";
import StudentsPage from "./pages/Students";
import { ToastContainer } from "react-toastify";
import { AdminContextProvider } from "./context/adminContext";
import { LecturerContextProvider } from "./context/lecturerContext";
import AdminPage from "./pages/adminDashboard";
import AdminLogin from "./pages/adminLogin";
import CameraPage from "./pages/camera";
import AdminSignUp from "./pages/adminSignUp";
import StudentDashboard from "./pages/StudentDashboard";
import { AdminProtectedRoute, LecturerProtectedRoute } from "./components/ProtectedRoute";
import LecturerSignUp from "./pages/lecturerSignUp";
import LecturerLogin from "./pages/lecturerLogin";
import LecturerDashboard from "./pages/lecturerDashboard";

function App() {
  return (
    <>
      <ToastContainer />
      <AdminContextProvider>
        <LecturerContextProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/register" element={<RegisterStudent />} />
                <Route path="/login" element={<StudentLogin />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/students" element={<StudentsPage />} />
                <Route path="*" element={<h1>404 Not Found</h1>} />
                <Route path="/admin-sign-up" element={<AdminSignUp />} />
                <Route path="/student/dashboard/:matricNo" element={<StudentDashboard />} />
                <Route path="/student/dashboard/*" element={<StudentDashboard />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard/:id" element={<AdminProtectedRoute><AdminPage /></AdminProtectedRoute>} />
                <Route path="/admin/camera/:id" element={<AdminProtectedRoute><CameraPage /></AdminProtectedRoute>} />
                <Route path="/lecturer" element={<LecturerLogin />} />
                <Route path="/lecturer-sign-up" element={<LecturerSignUp />} />
                <Route path="/lecturer/dashboard/:id" element={<LecturerProtectedRoute><LecturerDashboard /></LecturerProtectedRoute>} />
                <Route path="/lecturer/camera/:id" element={<LecturerProtectedRoute><CameraPage /></LecturerProtectedRoute>} />
              </Routes>
            </Layout>
          </Router>
        </LecturerContextProvider>
      </AdminContextProvider>
    </>
  );
}

export default App;
