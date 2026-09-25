import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  Mail,
  Trash2,
  Check,
  X,
  Loader2,
  MessageSquare,
} from "lucide-react";
import SearchInput from "../../../components/common/SearchInput";
import { useNavigate } from "react-router-dom";
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

export default function UserListPage({
  verified = true,
  showAll = false,
  title,
  subtitle,
  emptyMessage,
  showPendingActions = false,
}) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [roleFilter, setRoleFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [actionInProgress, setActionInProgress] = useState(null);
  const filterRef = useRef(null);

  const [rejectModal, setRejectModal] = useState({ open: false, userId: null, userName: "" });
  const [rejectFeedback, setRejectFeedback] = useState("");
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };
    if (showFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilter]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const params = { excludeSelf: "true" };
        if (!showAll) {
          params.verified = verified ? "true" : "false";
        }
        const res = await api.get("/auth/users", { params });
        setUsers(res.data.data.users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [verified, showAll]);

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
        (user.department &&
          user.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.university?.name &&
          user.university.name.toLowerCase().includes(searchQuery.toLowerCase()));

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

  const handleApprove = async (userId) => {
    setActionInProgress(userId);
    try {
      await api.put(`/auth/users/${userId}/approve`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (error) {
      console.error("Failed to approve user:", error);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRejectClick = (userId, userName) => {
    setRejectModal({ open: true, userId, userName });
    setRejectFeedback("");
  };

  const handleRejectSubmit = async () => {
    if (!rejectFeedback.trim()) return;
    setRejecting(true);
    try {
      await api.put(`/auth/users/${rejectModal.userId}/reject`, {
        feedback: rejectFeedback.trim(),
      });
      setUsers((prev) =>
        prev.map((u) =>
          u._id === rejectModal.userId ? { ...u, feedbackSent: true } : u
        )
      );
      setRejectModal({ open: false, userId: null, userName: "" });
      setRejectFeedback("");
    } catch (error) {
      console.error("Failed to reject user:", error);
    } finally {
      setRejecting(false);
    }
  };

  const handleRejectSkip = async () => {
    setRejecting(true);
    try {
      await api.put(`/auth/users/${rejectModal.userId}/reject`, {
        feedback: "",
      });
      setRejectModal({ open: false, userId: null, userName: "" });
      setRejectFeedback("");
    } catch (error) {
      console.error("Failed to reject user:", error);
    } finally {
      setRejecting(false);
    }
  };

  const handleDelete = async (userId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }
    setActionInProgress(userId);
    try {
      await api.delete(`/auth/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          {title}
        </h1>
        <p className="text-text-muted mt-1 text-sm">{subtitle}</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search users by name, email, or department..."
          className="flex-1"
        />
        <div className="relative" ref={filterRef}>
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
                className="absolute right-0 top-full mt-2 w-64 bg-bg-primary rounded-xl border border-border-color shadow-lg z-50 p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-text-primary">Filters</h3>
                  <button
                    onClick={() => {
                      setRoleFilter("All");
                      setDepartmentFilter("All");
                    }}
                    className="text-sm text-accent-orange hover:underline"
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
                    <option value="Admin">Admin</option>
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
                  University
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
                  <td colSpan="6" className="px-6 py-12 text-center text-text-muted text-sm">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-text-muted text-sm">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isBusy = actionInProgress === user._id;
                  return (
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
                            <button
                              onClick={() => navigate(`/admin/users/${user._id}`)}
                              className="text-sm font-semibold text-text-primary truncate hover:text-accent-orange transition-colors text-left"
                              title="View user details"
                            >
                              {user.name}
                            </button>
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
                              : user.role === "admin"
                              ? "bg-orange-500/10 text-orange-500"
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
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {user.university?.name || "N/A"}
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
                          {isBusy ? (
                            <Loader2 size={16} className="animate-spin text-accent-orange" />
                          ) : (
                            <>
                              {showPendingActions && (
                                <>
                                  <button
                                    onClick={() => handleApprove(user._id)}
                                    className="p-2 rounded-lg text-text-muted hover:text-green-500 hover:bg-green-500/10 transition-colors"
                                    title="Approve user"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleRejectClick(user._id, user.name)}
                                    className={`p-2 rounded-lg transition-colors ${
                                      user.feedbackSent
                                        ? "text-orange-500 bg-orange-500/10"
                                        : "text-text-muted hover:text-orange-500 hover:bg-orange-500/10"
                                    }`}
                                    title={user.feedbackSent ? "Feedback sent" : "Reject user"}
                                  >
                                    <MessageSquare size={16} />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDelete(user._id)}
                                className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                title="Delete user"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Reject Feedback Modal */}
      <AnimatePresence>
        {rejectModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => !rejecting && setRejectModal({ open: false, userId: null, userName: "" })}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-bg-primary border border-border-color rounded-2xl shadow-xl p-6 space-y-4"
            >
              <h2 className="text-lg font-bold text-text-primary">
                Reject {rejectModal.userName}
              </h2>
              <p className="text-sm text-text-muted">
                Provide feedback for this user. They will receive it in their notification center.
              </p>
              <textarea
                value={rejectFeedback}
                onChange={(e) => setRejectFeedback(e.target.value)}
                rows={4}
                placeholder="Enter feedback message..."
                className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30 resize-none"
              />
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleRejectSkip}
                  disabled={rejecting}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:bg-bg-secondary transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={rejecting || !rejectFeedback.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rejecting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <MessageSquare size={14} />
                  )}
                  Send Feedback
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
