import { Routes, Route } from "react-router-dom";

import PublicRoute from "./PublicRoute";
// import PrivateRoute from "./PrivateRoute";
import Home from "../pages/Home"
import Login from "../auth/pages/Login"
import Signup from "../auth/pages/SignUp"

// import Dashboard from "../pages/dashboard/Dashboard";

export default function AppRoutes() {
  return (
    
      <Routes>

        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* <Route path="/login" element={<Login />} /> */}
        </Route>

        {/* Private Routes */}
        {/* <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route> */}

      </Routes>
  );
}