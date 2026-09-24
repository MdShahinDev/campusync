import StudentDashboardLayout from "../auth/studentDashboard/components/DashboardLayout/DashboardLayout";
import AdminDashboardLayout from "../auth/adminDashboard/components/DashboardLayout/DashboardLayout";
import ModeratorDashboardLayout from "../auth/moderatorDashboard/components/DashboardLayout/DashboardLayout";
import { useAuth } from "../context/AuthContext";

/**
 * Renders the dashboard shell (Sidebar + Header) that belongs to the signed-in
 * user's role. Used by the shared /notifications routes so the notification
 * list and details pages always keep the existing dashboard chrome visible
 * without duplicating the routes for each role.
 */
export default function RoleDashboardLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user?.role === "admin") return <AdminDashboardLayout />;
  if (user?.role === "moderator") return <ModeratorDashboardLayout />;

  return <StudentDashboardLayout />;
}
