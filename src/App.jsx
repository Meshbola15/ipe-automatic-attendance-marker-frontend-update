import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import RegisterStudent from "./pages/RegisterStudents";
import StudentLogin from "./pages/StudentLogin";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import AttendancePage from "./pages/AttendancePage";
import StudentsPage from "./pages/Students";
import { ToastContainer } from "react-toastify";
import { AdminContextProvider } from "./context/adminContext";
import AdminPage from "./pages/adminDashboard";
import AdminLogin from "./pages/adminLogin";
import CameraPage from "./pages/camera";
import AdminSignUp from "./pages/adminSignUp";

function App() {
  return (
    <>
      <ToastContainer />
      <AdminContextProvider>
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
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard/:id" element={<AdminPage />} />
              <Route path="/admin/camera/:id" element={<CameraPage />} />
            </Routes>
          </Layout>
        </Router>
      </AdminContextProvider>
    </>
  );
}

export default App;
