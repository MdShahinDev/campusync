import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const dashboardRoutes = {
  student: "/student/dashboard",
  moderator: "/moderator/dashboard",
  admin: "/admin/dashboard",
};

export default function AuthRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Navigate to={dashboardRoutes[user.role] || "/login"} replace />;
  }

  return <Outlet />;
}
