import { motion } from "framer-motion";
import { Filter, Search, Mail } from "lucide-react";

const users = [
  { id: 1, name: "John Doe", email: "john@university.edu", role: "Student", department: "Computer Science", status: "Active" },
  { id: 2, name: "Jane Smith", email: "jane@university.edu", role: "Student", department: "Engineering", status: "Active" },
  { id: 3, name: "Mike Johnson", email: "mike@university.edu", role: "Student", department: "Business", status: "Inactive" },
  { id: 4, name: "Sarah Wilson", email: "sarah@university.edu", role: "Student", department: "Arts", status: "Active" },
  { id: 5, name: "Alex Brown", email: "alex@university.edu", role: "Student", department: "Science", status: "Active" },
  { id: 6, name: "Emily Davis", email: "emily@university.edu", role: "Student", department: "Computer Science", status: "Active" },
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

export default function AllUsers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          All Users
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          View all registered users.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-secondary text-sm hover:bg-bg-tertiary transition-colors">
          <Filter size={16} />
          Filter
        </button>
      </div>

      {/* Users Table */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="glass-card rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-color">
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                  User
                </th>
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                  Role
                </th>
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                  Department
                </th>
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {users.map((user) => (
                <motion.tr
                  key={user.id}
                  variants={item}
                  className="hover:bg-bg-secondary transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-orange to-accent-orange-hover flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-text-muted truncate flex items-center gap-1">
                          <Mail size={12} />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {user.department}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        user.status === "Active"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
