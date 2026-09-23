import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, ShieldCheck, GraduationCap, Users, Package, Clock, Activity } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/axios";

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0, totalStudents: 0, totalModerators: 0,
    totalResources: 0, totalComponents: 0, pendingUsers: 0, recentActivities: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/dashboard/stats");
        setStats(res.data.data);
      } catch (error) {
        console.error("Failed to fetch admin dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Users", value: stats.totalStudents + stats.totalModerators, icon: Users, accent: "bg-blue-500" },
    { label: "Total Students", value: stats.totalStudents, icon: GraduationCap, accent: "bg-emerald-500" },
    { label: "Total Moderators", value: stats.totalModerators, icon: ShieldCheck, accent: "bg-violet-500" },
    { label: "Pending Users", value: stats.pendingUsers, icon: Clock, accent: "bg-amber-500" },
    { label: "Total Resources", value: stats.totalResources, icon: BookOpen, accent: "bg-sky-500" },
    { label: "Total Components", value: stats.totalComponents, icon: Package, accent: "bg-rose-500" },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-text-primary">
          Welcome back, {user?.name?.split(" ")[0] || "Admin"}
        </h1>
        <p className="text-text-muted mt-0.5 text-sm">Here&apos;s an overview of your platform.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} variants={fadeUp} initial="hidden" animate="show"
            transition={{ delay: i * 0.06 }}
            className="dash-stat-card">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${stat.accent}/10 flex items-center justify-center`}>
                <stat.icon size={18} className={`${stat.accent.replace('bg-', 'text-')}`} />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
              {loading ? "—" : stat.value}
            </p>
            <p className="text-xs text-text-muted mt-1 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Activity */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }} className="dash-section">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-text-muted" />
          <h2 className="text-sm font-bold text-text-primary">Recent Activity</h2>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start gap-3 py-3">
                <div className="w-8 h-8 rounded-lg bg-bg-secondary shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-bg-secondary rounded w-1/3" />
                  <div className="h-2 bg-bg-secondary rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : stats.recentActivities.length === 0 ? (
          <p className="text-text-muted text-xs text-center py-10">No recent activity yet.</p>
        ) : (
          <div>
            {stats.recentActivities.map((activity) => (
              <div key={activity._id} className="dash-activity-item">
                <div className="w-8 h-8 rounded-lg bg-accent-orange/10 flex items-center justify-center shrink-0">
                  <Activity size={14} className="text-accent-orange" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">
                    {activity.type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">{activity.description}</p>
                </div>
                <span className="text-[11px] text-text-muted whitespace-nowrap">{timeAgo(activity.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
