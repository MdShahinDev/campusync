import { useLocation } from "react-router-dom";
import { Footer } from "./components/layout/Footer/Footer";
import Navbar from "./components/layout/Navbar/Navbar";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const isAuth = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className="min-h-screen">
      {!isDashboard && !isAuth && <Navbar />}
      <main className="flex-1">
        <AppRoutes />
      </main>
      {!isDashboard && !isAuth && <Footer />}
    </div>
  );
}

export default App;
