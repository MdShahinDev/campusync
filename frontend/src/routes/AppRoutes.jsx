import { Route, Routes } from "react-router-dom";

import AdminSignup from "../auth/pages/AdminSignUp";
import Login from "../auth/pages/Login";
import Signup from "../auth/pages/SignUp";
import Home from "../pages/Home";
import Messages from "../pages/Messages";
import NotificationDetail from "../pages/NotificationDetail";
import PublicProfile from "../pages/PublicProfile";
import PublicResource from "../pages/Resource";
import AllComponents from "../pages/AllComponents";
import ComponentDetails from "../pages/ComponentDetails";
import ReceivedRequests from "../pages/ReceivedRequests";
import OwnerHistory from "../pages/OwnerHistory";

import AuthRoute from "./AuthRoute";
import ProtectedRoute from "./ProtectedRoute";

import DashboardLayout from "../auth/studentDashboard/components/DashboardLayout/DashboardLayout";
import AddComponent from "../auth/studentDashboard/pages/AddComponent";
import AddResource from "../auth/studentDashboard/pages/AddResource";
import Dashboard from "../auth/studentDashboard/pages/Dashboard";
import EditProfile from "../auth/studentDashboard/pages/EditProfile";
import MyBorrowing from "../auth/studentDashboard/pages/MyBorrowing";
import MyComponents from "../auth/studentDashboard/pages/MyComponents";
import Profile from "../auth/studentDashboard/pages/Profile";
import Resource from "../auth/studentDashboard/pages/Resource";

import AdminDashboardLayout from "../auth/adminDashboard/components/DashboardLayout/DashboardLayout";
import AdminAddResource from "../auth/adminDashboard/pages/AddResource";
import AddUniversity from "../auth/adminDashboard/pages/AddUniversity";
import AllResources from "../auth/adminDashboard/pages/AllResources";
import AllUsers from "../auth/adminDashboard/pages/AllUsers";
import AdminDashboard from "../auth/adminDashboard/pages/Dashboard";
import AdminEditProfile from "../auth/adminDashboard/pages/EditProfile";
import NewUser from "../auth/adminDashboard/pages/NewUser";
import PendingUsers from "../auth/adminDashboard/pages/PendingUsers";
import AdminProfile from "../auth/adminDashboard/pages/Profile";
import UniversityDetails from "../auth/adminDashboard/pages/UniversityDetails";
import UserDetails from "../auth/adminDashboard/pages/UserDetails";

import ModeratorDashboardLayout from "../auth/moderatorDashboard/components/DashboardLayout/DashboardLayout";
import ModeratorAddResource from "../auth/moderatorDashboard/pages/AddResource";
import ModeratorAllUsers from "../auth/moderatorDashboard/pages/AllUsers";
import ModeratorDashboard from "../auth/moderatorDashboard/pages/Dashboard";
import ModeratorEditProfile from "../auth/moderatorDashboard/pages/EditProfile";
import ModeratorProfile from "../auth/moderatorDashboard/pages/Profile";
import Report from "../auth/moderatorDashboard/pages/Report";
import ModeratorResources from "../auth/moderatorDashboard/pages/Resources";
import ModeratorUserDetails from "../auth/moderatorDashboard/pages/UserDetails";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes - Home always accessible */}
      <Route path="/" element={<Home />} />
      <Route path="/resources" element={<PublicResource />} />
      <Route path="/user/:username" element={<PublicProfile />} />

      {/* Auth Routes - Redirect logged-in users to their dashboard */}
      <Route element={<AuthRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
      </Route>

      {/* Messages & Components Routes - All authenticated users */}
      <Route element={<ProtectedRoute allowedRoles={["student", "moderator", "admin"]} />}>
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications/:id" element={<NotificationDetail />} />
        <Route path="/components" element={<AllComponents />} />
        <Route path="/components/:id" element={<ComponentDetails />} />
      </Route>

      {/* Student Dashboard Routes - Only students */}
      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student/dashboard" element={<Dashboard />} />
          <Route path="/student/resource" element={<Resource />} />
          <Route path="/student/my-borrowing" element={<MyBorrowing />} />
          <Route path="/student/my-components" element={<MyComponents />} />
          <Route path="/student/add-component" element={<AddComponent />} />
          <Route path="/student/received-requests" element={<ReceivedRequests />} />
          <Route path="/student/lending-history" element={<OwnerHistory />} />
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
          <Route path="/admin/pending-users" element={<PendingUsers />} />
          <Route path="/admin/users/:id" element={<UserDetails />} />
          <Route path="/admin/new-user" element={<NewUser />} />
          <Route path="/admin/all-resources" element={<AllResources />} />
          <Route path="/admin/add-resource" element={<AdminAddResource />} />
          <Route path="/admin/add-university" element={<AddUniversity />} />
          <Route path="/admin/university-details" element={<UniversityDetails />} />
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
          <Route path="/moderator/all-users" element={<ModeratorAllUsers />} />
          <Route path="/moderator/users/:id" element={<ModeratorUserDetails />} />
          <Route path="/moderator/report" element={<Report />} />
          <Route path="/moderator/profile" element={<ModeratorProfile />} />
          <Route path="/moderator/profile/edit" element={<ModeratorEditProfile />} />
        </Route>
      </Route>
    </Routes>
  );
}
