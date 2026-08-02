import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const dashboardRoutes = {
  student: "/student/dashboard",
  moderator: "/moderator/dashboard",
  admin: "/admin/dashboard",
};

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={dashboardRoutes[user.role] || "/login"} replace />;
  }

  return <Outlet />;
}
