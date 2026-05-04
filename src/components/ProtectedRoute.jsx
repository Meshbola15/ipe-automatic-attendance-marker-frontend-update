import { Navigate } from "react-router-dom";

export const AdminProtectedRoute = ({ children }) => {
  const admin = localStorage.getItem("admin");
  if (!admin) return <Navigate to="/admin" replace />;
  return children;
};

export const LecturerProtectedRoute = ({ children }) => {
  const lecturer = localStorage.getItem("lecturer");
  if (!lecturer) return <Navigate to="/lecturer" replace />;
  return children;
};

export default AdminProtectedRoute;
