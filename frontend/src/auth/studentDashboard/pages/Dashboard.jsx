import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Package,
  Building2,
  GraduationCap,
  AlertTriangle,
  Loader2,
  Bell,
  Clock,
  FileText,
  Inbox,
  XCircle,
  Mail,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/axios";

function formatTimeAgo(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/dashboard/stats");
      const data = res.data.data;
      setStats(data.stats);
      setActivity(data.activity || []);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const statCards = stats
    ? [
        {
          label: "Total Resources",
          value: stats.totalResources,
          icon: BookOpen,
          color: "from-blue-500/20 to-blue-600/20",
          iconColor: "text-blue-500",
        },
        {
          label: "Total Components",
          value: stats.totalComponents,
          icon: Package,
          color: "from-green-500/20 to-green-600/20",
          iconColor: "text-green-500",
        },
        {
          label: "Total Universities",
          value: stats.totalUniversities,
          icon: Building2,
          color: "from-purple-500/20 to-purple-600/20",
          iconColor: "text-purple-500",
        },
        {
          label: "Total Courses",
          value: stats.totalCourses,
          icon: GraduationCap,
          color: "from-accent-orange/20 to-accent-orange-hover/20",
          iconColor: "text-accent-orange",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Welcome back, {user?.name?.split(" ")[0] || "Student"}!
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Here&apos;s an overview of the platform.
        </p>
      </div>

      {/* Verification Status Banner */}
      {user && user.isVerified === false && user.rejectionReason ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl bg-red-500/10 border border-red-500/30"
        >
          <div className="flex items-start gap-3">
            <XCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-600 dark:text-red-400">
                Account Verification Rejected
              </p>
              <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">
                Your account verification request was rejected.
              </p>
              <div className="mt-2 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-1">
                  Reason
                </p>
                <p className="text-sm text-text-primary">{user.rejectionReason}</p>
              </div>
              <p className="text-xs text-text-muted mt-2">
                If you believe this was a mistake or need assistance, please contact Support.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors"
              >
                <Mail size={14} />
                Contact Support
              </Link>
            </div>
          </div>
        </motion.div>
      ) : user && user.isVerified === false ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3"
        >
          <AlertTriangle size={20} className="text-yellow-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
              Your account is awaiting verification.
            </p>
            <p className="text-xs text-yellow-600/70 dark:text-yellow-400/70 mt-1">
              Resource uploads, component creation, and borrowing will be available after your account is approved by a moderator.
            </p>
          </div>
        </motion.div>
      ) : null}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={32} className="animate-spin text-accent-orange" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="text-center py-12">
          <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
          <p className="text-text-primary font-medium mb-2">{error}</p>
          <button
            onClick={fetchDashboard}
            className="text-sm text-accent-orange hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Stats Grid */}
      {!loading && !error && stats && (
        <>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {statCards.map((stat) => (
              <motion.div
                key={stat.label}
                variants={item}
                className="glass-card rounded-2xl p-5 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-text-muted font-medium">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-text-primary mt-1">
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}
                  >
                    <stat.icon size={20} className={stat.iconColor} />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Activity & Notifications Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 glass-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Clock size={18} className="text-accent-orange" />
                <h2 className="text-lg font-bold text-text-primary">
                  Recent Activity
                </h2>
              </div>
              {activity.length === 0 ? (
                <div className="text-center py-8">
                  <Inbox size={32} className="mx-auto text-text-muted mb-2" />
                  <p className="text-sm text-text-muted">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activity.map((act, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-bg-secondary transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-bg-secondary shrink-0">
                        {act.type === "resource" ? (
                          <FileText size={14} className="text-blue-500" />
                        ) : (
                          <Package size={14} className="text-green-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary">
                          <span className="font-semibold">{act.user}</span>
                          {" "}
                          {act.type === "resource"
                            ? "uploaded a new resource"
                            : "listed a new component"}
                        </p>
                        <p className="text-xs text-text-muted truncate mt-0.5">
                          {act.title}
                          {act.category && (
                            <span className="ml-1 text-text-muted">
                              ({act.category})
                            </span>
                          )}
                        </p>
                      </div>
                      <span className="text-xs text-text-muted whitespace-nowrap shrink-0">
                        {formatTimeAgo(act.date)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-accent-orange" />
                  <h2 className="text-lg font-bold text-text-primary">
                    Notifications
                  </h2>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <Link
                    to="/notifications"
                    className="text-xs text-accent-orange hover:underline"
                  >
                    View all
                  </Link>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell size={32} className="mx-auto text-text-muted mb-2" />
                  <p className="text-sm text-text-muted">No notifications</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.slice(0, 6).map((notif) => (
                    <Link
                      key={notif._id}
                      to={`/notifications/${notif._id}`}
                      className={`block p-3 rounded-xl hover:bg-bg-secondary transition-colors ${
                        !notif.read ? "bg-accent-orange/5 border border-accent-orange/10" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-accent-orange mt-1.5 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {notif.title}
                          </p>
                          <p className="text-xs text-text-muted truncate mt-0.5">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-text-muted mt-1">
                            {formatTimeAgo(notif.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
