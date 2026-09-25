import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen, Package, Building2, GraduationCap, AlertTriangle,
  Loader2, Bell, Clock, FileText, Inbox, XCircle, Mail,
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

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
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

  useEffect(() => { fetchDashboard(); }, []);

  const statCards = stats
    ? [
        { label: "Total Resources", value: stats.totalResources, icon: BookOpen, accent: "bg-blue-500" },
        { label: "Total Components", value: stats.totalComponents, icon: Package, accent: "bg-emerald-500" },
        { label: "Total Universities", value: stats.totalUniversities, icon: Building2, accent: "bg-violet-500" },
        { label: "Total Courses", value: stats.totalCourses, icon: GraduationCap, accent: "bg-amber-500" },
      ]
    : [];

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Welcome back, {user?.name?.split(" ")[0] || "Student"}
        </h1>
        <p className="text-text-muted mt-0.5 text-sm">
          Here&apos;s an overview of the platform.
        </p>
      </div>

      {/* Verification Banners */}
      {user && user.isVerified === false && user.rejectionReason ? (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 shrink-0">
              <XCircle size={18} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">Account Verification Rejected</p>
              <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5">Your account verification request was rejected.</p>
              <div className="mt-2 p-2.5 rounded-lg bg-red-500/5 border border-red-500/10">
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-0.5">Reason</p>
                <p className="text-xs text-text-primary">{user.rejectionReason}</p>
              </div>
              <Link to="/contact"
                className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-semibold hover:bg-red-500/15 transition-colors">
                <Mail size={12} /> Contact Support
              </Link>
            </div>
          </div>
        </motion.div>
      ) : user && user.isVerified === false ? (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 shrink-0">
            <AlertTriangle size={18} className="text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Awaiting Verification</p>
            <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-0.5">
              Resource uploads, component creation, and borrowing will be available after your account is approved.
            </p>
          </div>
        </motion.div>
      ) : null}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={28} className="animate-spin text-accent-orange" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="text-center py-10">
          <AlertTriangle size={40} className="mx-auto text-red-500 mb-3" />
          <p className="text-sm text-text-primary font-medium mb-2">{error}</p>
          <button onClick={fetchDashboard} className="text-sm text-accent-orange hover:underline font-medium">
            Try again
          </button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && stats && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {statCards.map((stat, i) => (
              <motion.div key={stat.label} variants={fadeUp} initial="hidden" animate="show"
                transition={{ delay: i * 0.06 }}
                className="dash-stat-card group">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg ${stat.accent}/10 flex items-center justify-center`}>
                    <stat.icon size={18} className={`${stat.accent.replace('bg-', 'text-')}`} />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-xs text-text-muted mt-1 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Activity & Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Activity */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }} className="lg:col-span-2 dash-section">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-text-primary">Recent Activity</h2>
              </div>
              {activity.length === 0 ? (
                <div className="text-center py-10">
                  <Inbox size={28} className="mx-auto text-text-muted/50 mb-2" />
                  <p className="text-xs text-text-muted">No recent activity</p>
                </div>
              ) : (
                <div>
                  {activity.map((act, index) => (
                    <div key={index} className="dash-activity-item">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${act.type === "resource" ? "bg-blue-500/10" : "bg-emerald-500/10"}`}>
                        {act.type === "resource" ? (
                          <FileText size={14} className="text-blue-500" />
                        ) : (
                          <Package size={14} className="text-emerald-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary">
                          <span className="font-semibold">{act.user}</span>{" "}
                          {act.type === "resource" ? "uploaded a new resource" : "listed a new component"}
                        </p>
                        <p className="text-xs text-text-muted truncate mt-0.5">
                          {act.title}{act.category && <span className="ml-1">({act.category})</span>}
                        </p>
                      </div>
                      <span className="text-[11px] text-text-muted whitespace-nowrap shrink-0">
                        {formatTimeAgo(act.date)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Notifications */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }} className="dash-section">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-text-primary">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-accent-orange text-white text-[9px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="text-center py-10">
                  <Bell size={28} className="mx-auto text-text-muted/50 mb-2" />
                  <p className="text-xs text-text-muted">No notifications</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {notifications.slice(0, 6).map((notif) => (
                    <Link key={notif._id} to={`/notifications/${notif._id}`}
                      className={`block p-2.5 rounded-lg transition-colors ${!notif.isRead ? "bg-accent-orange/5" : "hover:bg-bg-secondary"}`}>
                      <div className="flex items-start gap-2">
                        {!notif.isRead && (
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-orange mt-1.5 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-text-primary truncate">{notif.title}</p>
                          <p className="text-[11px] text-text-muted truncate mt-0.5">{notif.message}</p>
                          <p className="text-[10px] text-text-muted/70 mt-1">{formatTimeAgo(notif.createdAt)}</p>
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
