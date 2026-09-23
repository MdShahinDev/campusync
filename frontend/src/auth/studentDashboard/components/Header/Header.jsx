import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  User,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import ThemeToggle from "../../../../components/ui/ThemeToggle";
import NotificationDropdown from "../../../../components/common/NotificationDropdown";

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
    <header className="flex-shrink-0 h-14 bg-bg-primary border-b border-border-color">
      <div className="flex items-center justify-between h-full px-4 md:px-5">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onMenuToggle}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors md:hidden"
          >
            <Menu size={20} />
          </motion.button>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <NotificationDropdown />

          <div className="relative" ref={dropdownRef}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 ml-1 pl-2 pr-2.5 py-1.5 rounded-lg hover:bg-bg-secondary transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-orange to-accent-orange-hover flex items-center justify-center text-white text-[11px] font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-text-primary leading-tight">{user?.name || "Student"}</p>
                <p className="text-[10px] text-text-muted leading-tight capitalize">{user?.role || "student"}</p>
              </div>
              <ChevronDown size={14} className={`text-text-muted transition-transform duration-200 hidden sm:block ${dropdownOpen ? "rotate-180" : ""}`} />
            </motion.button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1.5 w-52 bg-bg-primary border border-border-color rounded-xl shadow-xl overflow-hidden z-50"
                >
                  <div className="px-3 py-2.5 border-b border-border-color">
                    <p className="text-xs font-semibold text-text-primary">{user?.name || "Student"}</p>
                    <p className="text-[10px] text-text-muted mt-0.5 truncate">{user?.email || "student@campusync.com"}</p>
                  </div>
                  <div className="py-1">
                    <DropdownItem icon={<LayoutDashboard size={14} />} label="Dashboard" to="/student/dashboard" onClick={() => setDropdownOpen(false)} />
                    <DropdownItem icon={<Package size={14} />} label="My Borrowing" to="/student/my-borrowing" onClick={() => setDropdownOpen(false)} />
                    <DropdownItem icon={<User size={14} />} label="Profile" to="/student/profile" onClick={() => setDropdownOpen(false)} />
                    <DropdownItem icon={<Settings size={14} />} label="Settings" to="/student/settings" onClick={() => setDropdownOpen(false)} />
                  </div>
                  <div className="border-t border-border-color py-1">
                    <button onClick={handleLogout}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/8 w-full transition-colors">
                      <LogOut size={14} />
                      <span>Logout</span>
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

function DropdownItem({ icon, label, to, onClick }) {
  return (
    <Link to={to} onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-text-primary hover:bg-bg-secondary transition-colors">
      <span className="text-text-muted">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
