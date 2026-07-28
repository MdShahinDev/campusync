import { motion } from "framer-motion";
import { Filter, Search, FileWarning, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const reports = [
  { id: 1, title: "AC not working in Lab B", resource: "Lab B", reportedBy: "John Doe", date: "2026-07-28", status: "Pending", priority: "High" },
  { id: 2, title: "Projector malfunction", resource: "Conference Room A", reportedBy: "Jane Smith", date: "2026-07-27", status: "In Progress", priority: "Medium" },
  { id: 3, title: "Broken chair", resource: "Meeting Room C", reportedBy: "Mike Johnson", date: "2026-07-26", status: "Resolved", priority: "Low" },
  { id: 4, title: "Network connectivity issue", resource: "Computer Lab D", reportedBy: "Sarah Wilson", date: "2026-07-28", status: "Pending", priority: "High" },
  { id: 5, title: "Light not working", resource: "Seminar Hall", reportedBy: "Alex Brown", date: "2026-07-25", status: "Resolved", priority: "Low" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function Report() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Reports
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          View and manage resource reports and issues.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search reports..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-secondary text-sm hover:bg-bg-tertiary transition-colors">
          <Filter size={16} />
          Filter
        </button>
      </div>

      {/* Reports List */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {reports.map((report) => (
          <motion.div
            key={report.id}
            variants={item}
            className="glass-card rounded-2xl p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-text-primary">
                    {report.title}
                  </h3>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      report.priority === "High"
                        ? "bg-red-500/10 text-red-500"
                        : report.priority === "Medium"
                        ? "bg-yellow-500/10 text-yellow-500"
                        : "bg-green-500/10 text-green-500"
                    }`}
                  >
                    {report.priority}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <FileWarning size={14} /> {report.resource}
                  </span>
                  <span>Reported by: {report.reportedBy}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {report.date}
                  </span>
                </div>
              </div>
              <span
                className={`text-xs font-medium px-3 py-1.5 rounded-full self-start sm:self-center flex items-center gap-1 ${
                  report.status === "Resolved"
                    ? "bg-green-500/10 text-green-500"
                    : report.status === "In Progress"
                    ? "bg-blue-500/10 text-blue-500"
                    : "bg-yellow-500/10 text-yellow-500"
                }`}
              >
                {report.status === "Resolved" && <CheckCircle size={14} />}
                {report.status === "In Progress" && <AlertTriangle size={14} />}
                {report.status === "Pending" && <Clock size={14} />}
                {report.status}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
