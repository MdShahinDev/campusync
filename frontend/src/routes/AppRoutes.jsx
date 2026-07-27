import { Routes, Route } from "react-router-dom";

import PublicRoute from "./PublicRoute";
// import PrivateRoute from "./PrivateRoute";
import Home from "../pages/Home";
import Login from "../auth/pages/Login";
import Signup from "../auth/pages/SignUp";

import DashboardLayout from "../auth/userDashboard/components/DashboardLayout/DashboardLayout";
import Dashboard from "../auth/userDashboard/pages/Dashboard";
import Resource from "../auth/userDashboard/pages/Resource";
import Booking from "../auth/userDashboard/pages/Booking";
import AddResource from "../auth/userDashboard/pages/AddResource";
import Profile from "../auth/userDashboard/pages/Profile";
import EditProfile from "../auth/userDashboard/pages/EditProfile";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Dashboard Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/resource" element={<Resource />} />
        <Route path="/dashboard/booking" element={<Booking />} />
        <Route path="/dashboard/add-resource" element={<AddResource />} />
        <Route path="/dashboard/profile" element={<Profile />} />
        <Route path="/dashboard/profile/edit" element={<EditProfile />} />
      </Route>
    </Routes>
  );
}