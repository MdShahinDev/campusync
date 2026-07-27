import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute() {
  const isAuthenticated = false; // Replace with your auth logic

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}