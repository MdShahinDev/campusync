import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import ThemeToggle from "../../../../components/ui/ThemeToggle";

export default function Header({ onMenuToggle }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-bg-primary border-b border-border-color backdrop-blur-md">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left side: Logo (desktop) / Hamburger (mobile) */}
        <div className="flex items-center gap-3">
          {/* Mobile: Hamburger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onMenuToggle}
            className="p-2 rounded-xl text-text-primary hover:bg-bg-secondary transition-colors md:hidden"
          >
            <Menu size={22} />
          </motion.button>

          {/* Desktop: Logo */}
          <Link
            to="/"
            className="hidden md:flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF8A00] to-[#FF6B00] text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
              <span className="font-extrabold text-sm">R</span>
            </div>
            <span className="font-extrabold text-lg tracking-tight text-accent-orange">
              Campus Sync
            </span>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/*Theme Toggle */}
          <div className="">
            <ThemeToggle />
          </div>
          {/* Notification */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-xl text-text-primary hover:bg-bg-secondary transition-colors"
          >
            <Bell size={20} strokeWidth={1.8} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-orange rounded-full" />
          </motion.button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-bg-secondary transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-orange to-accent-orange-hover flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <ChevronDown
                size={16}
                className={`text-text-muted transition-transform duration-200 hidden sm:block ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </motion.button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-bg-primary border border-border-color rounded-xl shadow-xl overflow-hidden z-50"
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-border-color">
                    <p className="text-sm font-semibold text-text-primary">
                      {user?.name || "Admin"}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {user?.email || "admin@campusync.com"}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1.5">
                    <DropdownItem
                      icon={<LayoutDashboard size={16} />}
                      label="Dashboard"
                      to="/admin/dashboard"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <DropdownItem
                      icon={<User size={16} />}
                      label="Profile"
                      to="/admin/profile"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <DropdownItem
                      icon={<Settings size={16} />}
                      label="Settings"
                      to="/admin/settings"
                      onClick={() => setDropdownOpen(false)}
                    />
                  </div>

                  {/* Logout */}
                  <div className="border-t border-border-color py-1.5">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 text-red-500 hover:bg-red-500/10 w-full cursor-pointer"
                    >
                      <span className="text-red-500">
                        <LogOut size={16} />
                      </span>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

function DropdownItem({ icon, label, to, onClick, danger = false }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ${
        danger
          ? "text-red-500 hover:bg-red-500/10"
          : "text-text-primary hover:bg-bg-secondary"
      }`}
    >
      <span className={danger ? "text-red-500" : "text-text-muted"}>
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
