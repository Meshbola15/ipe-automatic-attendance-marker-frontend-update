import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import RegisterStudent from "./pages/RegisterStudents";
import StudentLogin from "./pages/StudentLogin";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import AttendancePage from "./pages/AttendancePage";
import StudentsPage from "./pages/Students";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/register" element={<RegisterStudent />} />
          <Route path="/login" element={<StudentLogin />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/students" element={<StudentsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
