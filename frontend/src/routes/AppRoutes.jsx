import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import PublicResource from "../pages/Resource";
import Login from "../auth/pages/Login";
import Signup from "../auth/pages/SignUp";
import AdminSignup from "../auth/pages/AdminSignUp";

import AuthRoute from "./AuthRoute";
import ProtectedRoute from "./ProtectedRoute";

import DashboardLayout from "../auth/studentDashboard/components/DashboardLayout/DashboardLayout";
import Dashboard from "../auth/studentDashboard/pages/Dashboard";
import Resource from "../auth/studentDashboard/pages/Resource";
import Booking from "../auth/studentDashboard/pages/Booking";
import AddResource from "../auth/studentDashboard/pages/AddResource";
import Profile from "../auth/studentDashboard/pages/Profile";
import EditProfile from "../auth/studentDashboard/pages/EditProfile";

import AdminDashboardLayout from "../auth/adminDashboard/components/DashboardLayout/DashboardLayout";
import AdminDashboard from "../auth/adminDashboard/pages/Dashboard";
import AllUsers from "../auth/adminDashboard/pages/AllUsers";
import NewUser from "../auth/adminDashboard/pages/NewUser";
import AllResources from "../auth/adminDashboard/pages/AllResources";
import AdminAddResource from "../auth/adminDashboard/pages/AddResource";
import AdminProfile from "../auth/adminDashboard/pages/Profile";
import AdminEditProfile from "../auth/adminDashboard/pages/EditProfile";

import ModeratorDashboardLayout from "../auth/moderatorDashboard/components/DashboardLayout/DashboardLayout";
import ModeratorDashboard from "../auth/moderatorDashboard/pages/Dashboard";
import ModeratorProfile from "../auth/moderatorDashboard/pages/Profile";
import ModeratorEditProfile from "../auth/moderatorDashboard/pages/EditProfile";
import ModeratorResources from "../auth/moderatorDashboard/pages/Resources";
import ModeratorAddResource from "../auth/moderatorDashboard/pages/AddResource";
import Report from "../auth/moderatorDashboard/pages/Report";
import ModeratorAllUsers from "../auth/moderatorDashboard/pages/AllUsers";
import ModeratorBooking from "../auth/moderatorDashboard/pages/Booking";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes - Home always accessible */}
      <Route path="/" element={<Home />} />
      <Route path="/resources" element={<PublicResource />} />

      {/* Auth Routes - Redirect logged-in users to their dashboard */}
      <Route element={<AuthRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
      </Route>

      {/* Student Dashboard Routes - Only students */}
      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student/dashboard" element={<Dashboard />} />
          <Route path="/student/resource" element={<Resource />} />
          <Route path="/student/booking" element={<Booking />} />
          <Route path="/student/add-resource" element={<AddResource />} />
          <Route path="/student/profile" element={<Profile />} />
          <Route path="/student/profile/edit" element={<EditProfile />} />
        </Route>
      </Route>

      {/* Admin Dashboard Routes - Only admins */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<AdminDashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/all-users" element={<AllUsers />} />
          <Route path="/admin/new-user" element={<NewUser />} />
          <Route path="/admin/all-resources" element={<AllResources />} />
          <Route path="/admin/add-resource" element={<AdminAddResource />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/profile/edit" element={<AdminEditProfile />} />
        </Route>
      </Route>

      {/* Moderator Dashboard Routes - Only moderators */}
      <Route element={<ProtectedRoute allowedRoles={["moderator"]} />}>
        <Route element={<ModeratorDashboardLayout />}>
          <Route path="/moderator/dashboard" element={<ModeratorDashboard />} />
          <Route path="/moderator/resources" element={<ModeratorResources />} />
          <Route path="/moderator/add-resource" element={<ModeratorAddResource />} />
          <Route path="/moderator/booking" element={<ModeratorBooking />} />
          <Route path="/moderator/all-users" element={<ModeratorAllUsers />} />
          <Route path="/moderator/report" element={<Report />} />
          <Route path="/moderator/profile" element={<ModeratorProfile />} />
          <Route path="/moderator/profile/edit" element={<ModeratorEditProfile />} />
        </Route>
      </Route>
    </Routes>
  );
}
