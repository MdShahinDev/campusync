import { motion } from "framer-motion";
import {
  BookOpen,
  CalendarCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const stats = [
  {
    label: "Total Resources",
    value: "12",
    icon: BookOpen,
    change: "+2 this month",
    color: "from-blue-500/20 to-blue-600/20",
    iconColor: "text-blue-500",
  },
  {
    label: "Active Bookings",
    value: "5",
    icon: CalendarCheck,
    change: "+1 today",
    color: "from-green-500/20 to-green-600/20",
    iconColor: "text-green-500",
  },
  {
    label: "Total Users",
    value: "48",
    icon: Users,
    change: "+8 this week",
    color: "from-purple-500/20 to-purple-600/20",
    iconColor: "text-purple-500",
  },
  {
    label: "Growth Rate",
    value: "24%",
    icon: TrendingUp,
    change: "+4% vs last month",
    color: "from-accent-orange/20 to-accent-orange-hover/20",
    iconColor: "text-accent-orange",
  },
];

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Welcome back, {user?.name?.split(" ")[0] || "Student"}!
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Here&apos;s an overview of your resources.
        </p>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat) => (
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
                  {stat.value}
                </p>
                <p className="text-xs text-text-muted mt-2">{stat.change}</p>
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
        <div className="space-y-4">
          {[
            {
              title: "New resource added",
              description: "Conference Room A was added to your resources",
              time: "2 hours ago",
            },
            {
              title: "Booking confirmed",
              description: "Lab B was booked for tomorrow's session",
              time: "5 hours ago",
            },
            {
              title: "Resource updated",
              description: "Meeting Room C details were updated",
              time: "1 day ago",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-3 rounded-xl hover:bg-bg-secondary transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-accent-orange mt-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary">
                  {activity.title}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {activity.description}
                </p>
              </div>
              <span className="text-xs text-text-muted whitespace-nowrap">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
