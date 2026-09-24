import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronLeft,
  File,
  LayoutDashboard,
  LogOut,
  Package,
  Inbox,
  User,
  X,
} from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";

const navGroups = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Components",
    items: [
      { name: "All Components", path: "/components", icon: Package },
      { name: "My Components", path: "/student/my-components", icon: Package },
    ],
  },
  {
    label: "Requests",
    items: [
      { name: "Received Requests", path: "/student/received-requests", icon: Inbox },
      { name: "My Borrowing", path: "/student/my-borrowing", icon: BookOpen },
    ],
  },
  {
    label: "Resources",
    items: [
      { name: "All Resources", path: "/student/all-resources", icon: BookOpen },
      { name: "Add Resource", path: "/student/add-resource", icon: File },
    ],
  },
  {
    label: "Account",
    items: [
      { name: "Profile", path: "/student/profile", icon: User },
    ],
  },
];

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isItemActive = (item) =>
    location.pathname === item.path ||
    (item.path !== "/student/dashboard" && location.pathname.startsWith(item.path));

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed md:static top-0 bottom-0 left-0 z-40 bg-bg-primary border-r border-border-color transition-all duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${collapsed ? "md:w-[68px]" : "md:w-60"} w-64`}
      >
        {/* Top Row: Brand + Controls */}
        <div className={`flex items-center justify-between border-b border-border-color flex-shrink-0 h-14 ${collapsed ? "px-1.5" : "px-3"}`}>
          <Link to="/" className="flex items-center gap-2 group focus:outline-none overflow-hidden">
            
            {!collapsed && (
              <span className="font-bold text-lg tracking-tight text-text-primary whitespace-nowrap">
                Campus<span className="text-accent-orange">Sync</span>
              </span>
            )}
          </Link>
          <div className="flex items-center shrink-0">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors md:hidden"
            >
              <X size={18} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
            >
              <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronLeft size={16} />
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-1">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="sidebar-section-label">{group.label}</p>
              )}
              {group.items.map((navItem) => {
                const isActive = isItemActive(navItem);
                return (
                  <NavLink
                    key={navItem.name}
                    to={navItem.path}
                    onClick={onClose}
                    title={collapsed ? navItem.name : undefined}
                    className={`sidebar-nav-item mb-0.5 ${isActive ? "active" : ""} ${collapsed ? "justify-center px-0" : ""}`}
                  >
                    <navItem.icon size={18} strokeWidth={isActive ? 2.2 : 1.8} className="shrink-0" />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.15 }}
                          className="whitespace-nowrap overflow-hidden"
                        >
                          {navItem.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-border-color p-2 space-y-1">
          <div className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg ${collapsed ? "justify-center" : ""}`}>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-orange to-accent-orange-hover flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden min-w-0"
                >
                  <p className="text-xs font-semibold text-text-primary truncate">{user?.name || "Student"}</p>
                  <p className="text-[10px] text-text-muted truncate">{user?.email || "student@campusync.com"}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
            className={`sidebar-nav-item w-full text-red-500 hover:bg-red-500/8 hover:text-red-500 ${collapsed ? "justify-center px-0" : ""}`}
          >
            <LogOut size={18} strokeWidth={1.8} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </aside>
    </>
  );
}
