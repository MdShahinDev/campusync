import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Package,
  Users,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/axios";

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

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingUsers: 0,
    totalResources: 0,
    totalComponents: 0,
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/moderator/dashboard/stats");
        setStats(res.data.data);
      } catch (error) {
        console.error("Failed to fetch moderator dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "from-blue-500/20 to-blue-600/20",
      iconColor: "text-blue-500",
    },
    {
      label: "Pending Users",
      value: stats.pendingUsers,
      icon: Clock,
      color: "from-yellow-500/20 to-yellow-600/20",
      iconColor: "text-yellow-500",
    },
    {
      label: "Total Resources",
      value: stats.totalResources,
      icon: BookOpen,
      color: "from-accent-orange/20 to-accent-orange-hover/20",
      iconColor: "text-accent-orange",
    },
    {
      label: "Total Components",
      value: stats.totalComponents,
      icon: Package,
      color: "from-cyan-500/20 to-cyan-600/20",
      iconColor: "text-cyan-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Welcome back, {user?.name?.split(" ")[0] || "Moderator"}!
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Here&apos;s an overview of your assignments.
        </p>
      </div>

      {/* Unverified Notice */}
      {user && user.isVerified === false && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3"
        >
          <AlertTriangle size={20} className="text-yellow-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
              Your account is not verified. Please wait for verify through Administrator.
            </p>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
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
                  {loading ? "..." : stat.value}
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

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-6"
      >
        <h2 className="text-lg font-bold text-text-primary mb-4">
          Recent Activity
        </h2>
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start gap-4 p-3">
                <div className="w-2 h-2 rounded-full bg-bg-secondary mt-2 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-bg-secondary rounded w-1/3" />
                  <div className="h-2 bg-bg-secondary rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : stats.recentActivities.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-8">
            No recent activity yet.
          </p>
        ) : (
          <div className="space-y-4">
            {stats.recentActivities.map((activity) => (
              <div
                key={activity._id}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-bg-secondary transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-accent-orange mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">
                    {activity.type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {activity.description}
                  </p>
                </div>
                <span className="text-xs text-text-muted whitespace-nowrap">
                  {timeAgo(activity.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
