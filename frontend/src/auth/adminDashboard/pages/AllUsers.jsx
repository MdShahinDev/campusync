import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Search, Mail, Trash2, Edit } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [roleFilter, setRoleFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/auth/users");
        setUsers(res.data.data.users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const departments = useMemo(() => {
    const deptSet = new Set();
    users.forEach((u) => {
      if (u.department) deptSet.add(u.department);
    });
    return ["All", ...Array.from(deptSet).sort()];
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        searchQuery === "" ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.department && user.department.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRole =
        roleFilter === "All" ||
        user.role.charAt(0).toUpperCase() + user.role.slice(1) === roleFilter;

      const matchesDepartment =
        departmentFilter === "All" || user.department === departmentFilter;

      return matchesSearch && matchesRole && matchesDepartment;
    });
  }, [users, searchQuery, roleFilter, departmentFilter]);

  const capitalizeRole = (role) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          All Users
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Manage and view all registered users.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search users by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-secondary text-sm hover:bg-bg-tertiary transition-colors"
          >
            <Filter size={16} />
            Filter
            {(roleFilter !== "All" || departmentFilter !== "All") && (
              <span className="ml-1 w-5 h-5 rounded-full bg-accent-orange text-white text-xs flex items-center justify-center">
                {(roleFilter !== "All" ? 1 : 0) + (departmentFilter !== "All" ? 1 : 0)}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showFilter && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-2 w-64 glass-card rounded-xl border border-border-color shadow-lg z-20 p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-text-primary">Filters</h3>
                  <button
                    onClick={() => {
                      setRoleFilter("All");
                      setDepartmentFilter("All");
                    }}
                    className="text-xs text-accent-orange hover:underline"
                  >
                    Clear all
                  </button>
                </div>

                <div>
                  <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                    Role
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
                  >
                    <option value="All">All Roles</option>
                    <option value="Student">Student</option>
                    <option value="Moderator">Moderator</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                    Department
                  </label>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept === "All" ? "All Departments" : dept}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
                <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-text-muted text-sm">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-text-muted text-sm">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <motion.tr
                    key={user._id}
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
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          user.role === "moderator"
                            ? "bg-purple-500/10 text-purple-500"
                            : "bg-blue-500/10 text-blue-500"
                        }`}
                      >
                        {capitalizeRole(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {user.role === "moderator"
                        ? "Not Applicable"
                        : user.department || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          user.isVerified
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {user.isVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 rounded-lg text-text-muted hover:text-accent-orange hover:bg-bg-tertiary transition-colors">
                          <Edit size={16} />
                        </button>
                        <button className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}