import { motion } from "framer-motion";
import {
  BookOpen,
  CalendarCheck,
  FileWarning,
  Users,
} from "lucide-react";

const stats = [
  {
    label: "Assigned Resources",
    value: "18",
    icon: BookOpen,
    change: "+2 this week",
    color: "from-blue-500/20 to-blue-600/20",
    iconColor: "text-blue-500",
  },
  {
    label: "Active Bookings",
    value: "12",
    icon: CalendarCheck,
    change: "+3 today",
    color: "from-green-500/20 to-green-600/20",
    iconColor: "text-green-500",
  },
  {
    label: "Total Users",
    value: "89",
    icon: Users,
    change: "+5 this week",
    color: "from-purple-500/20 to-purple-600/20",
    iconColor: "text-purple-500",
  },
  {
    label: "Pending Reports",
    value: "4",
    icon: FileWarning,
    change: "2 urgent",
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
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Moderator Dashboard
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Welcome back! Here&apos;s an overview of your assignments.
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
              title: "New booking request",
              description: "John Doe requested Conference Room A",
              time: "30 min ago",
            },
            {
              title: "Resource report submitted",
              description: "Lab B maintenance issue reported",
              time: "2 hours ago",
            },
            {
              title: "Booking confirmed",
              description: "Meeting Room C approved for tomorrow",
              time: "4 hours ago",
            },
            {
              title: "New user registered",
              description: "Sarah Wilson joined as a student",
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
