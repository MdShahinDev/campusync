import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Mail, Loader2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../../services/axios";

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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/auth/users", {
          params: { role: "student", excludeSelf: "true" },
        });
        setUsers(res.data.data.users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.username?.toLowerCase().includes(term) ||
      user.university?.name?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-accent-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          All Students
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          View all registered student users.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          type="text"
          placeholder="Search students by name, email, or username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
        />
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-muted">
            {searchTerm ? "No students found" : "No students registered yet"}
          </p>
        </div>
      ) : (
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
                    Username
                  </th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                    Department
                  </th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                    University
                  </th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user._id}
                    variants={item}
                    className="hover:bg-bg-secondary transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        to={`/moderator/users/${user._id}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-orange to-accent-orange-hover flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-text-primary truncate group-hover:text-accent-orange transition-colors">
                            {user.name}
                          </p>
                          <p className="text-xs text-text-muted truncate flex items-center gap-1">
                            <Mail size={12} />
                            {user.email}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      @{user.username}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {user.department || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {user.university?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          user.isVerified
                            ? "bg-green-500/10 text-green-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }`}
                      >
                        {user.isVerified ? "Verified" : "Pending"}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
