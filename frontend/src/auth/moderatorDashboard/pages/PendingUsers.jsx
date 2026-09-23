import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Check,
  Loader2,
  MessageSquare,
  Users,
  Clock,
  Calendar,
  Building2,
  BookOpen,
} from "lucide-react";
import api from "../../../services/axios";
import SearchInput from "../../../components/common/SearchInput";

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

export default function PendingUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionInProgress, setActionInProgress] = useState(null);

  const [rejectModal, setRejectModal] = useState({ open: false, userId: null, userName: "" });
  const [rejectFeedback, setRejectFeedback] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const [detailModal, setDetailModal] = useState({ open: false, user: null });

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/moderator/pending-users");
      setUsers(res.data.data.users);
    } catch (error) {
      console.error("Failed to fetch pending users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (!searchQuery) return true;
      const term = searchQuery.toLowerCase();
      return (
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.username?.toLowerCase().includes(term) ||
        user.studentId?.toLowerCase().includes(term) ||
        user.department?.toLowerCase().includes(term)
      );
    });
  }, [users, searchQuery]);

  const handleApprove = async (userId) => {
    setActionInProgress(userId);
    try {
      await api.put(`/moderator/users/${userId}/approve`);
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
      await api.put(`/moderator/users/${rejectModal.userId}/reject`, {
        feedback: rejectFeedback.trim(),
      });
      setUsers((prev) => prev.filter((u) => u._id !== rejectModal.userId));
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
      await api.put(`/moderator/users/${rejectModal.userId}/reject`, {
        feedback: "",
      });
      setUsers((prev) => prev.filter((u) => u._id !== rejectModal.userId));
      setRejectModal({ open: false, userId: null, userName: "" });
      setRejectFeedback("");
    } catch (error) {
      console.error("Failed to reject user:", error);
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Pending Users
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Review and approve unverified students from your university.
        </p>
      </div>

      {/* Search */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by name, email, username, student ID, or department..."
      />

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
                  Student
                </th>
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4 hidden sm:table-cell">
                  Student ID
                </th>
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4 hidden md:table-cell">
                  Department
                </th>
                <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4 hidden lg:table-cell">
                  Registered
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
                    <Loader2 size={24} className="animate-spin text-accent-orange mx-auto mb-2" />
                    Loading pending users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Users size={48} className="mx-auto text-text-muted mb-4" />
                    <p className="text-text-muted">
                      {searchQuery ? "No pending users found" : "No pending users at your university"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isBusy = actionInProgress === user._id;
                  const regDate = user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A";

                  return (
                    <motion.tr
                      key={user._id}
                      variants={item}
                      className="hover:bg-bg-secondary transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-orange to-accent-orange-hover flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div className="min-w-0">
                            <button
                              onClick={() => setDetailModal({ open: true, user })}
                              className="text-sm font-semibold text-text-primary truncate hover:text-accent-orange transition-colors text-left"
                              title="View student details"
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
                      <td className="px-6 py-4 text-sm text-text-secondary hidden sm:table-cell">
                        {user.studentId || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary hidden md:table-cell">
                        {user.department || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-xs text-text-muted hidden lg:table-cell">
                        {regDate}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {isBusy ? (
                            <Loader2 size={16} className="animate-spin text-accent-orange" />
                          ) : (
                            <>
                              <button
                                onClick={() => handleApprove(user._id)}
                                className="p-2 rounded-lg text-text-muted hover:text-green-500 hover:bg-green-500/10 transition-colors"
                                title="Approve student"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => handleRejectClick(user._id, user.name)}
                                className="p-2 rounded-lg text-text-muted hover:text-orange-500 hover:bg-orange-500/10 transition-colors"
                                title="Reject student"
                              >
                                <MessageSquare size={16} />
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

      {/* User Detail Modal */}
      <AnimatePresence>
        {detailModal.open && detailModal.user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setDetailModal({ open: false, user: null })}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-bg-primary border border-border-color rounded-2xl shadow-xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-orange to-accent-orange-hover flex items-center justify-center text-white text-lg font-bold">
                  {detailModal.user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">
                    {detailModal.user.name}
                  </h2>
                  <p className="text-xs text-accent-orange font-medium">
                    @{detailModal.user.username}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <DetailRow icon={<Mail size={14} />} label="Email" value={detailModal.user.email} />
                <DetailRow icon={<Building2 size={14} />} label="University" value={detailModal.user.university?.name || "N/A"} />
                <DetailRow icon={<BookOpen size={14} />} label="Student ID" value={detailModal.user.studentId || "N/A"} />
                <DetailRow icon={<Building2 size={14} />} label="Department" value={detailModal.user.department || "N/A"} />
                <DetailRow
                  icon={<Calendar size={14} />}
                  label="Registered"
                  value={
                    detailModal.user.createdAt
                      ? new Date(detailModal.user.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"
                  }
                />
                <DetailRow
                  icon={<Clock size={14} />}
                  label="Status"
                  value={detailModal.user.isVerified ? "Verified" : "Pending"}
                  valueClass={detailModal.user.isVerified ? "text-green-500" : "text-yellow-500"}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDetailModal({ open: false, user: null })}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:bg-bg-secondary transition-colors"
                >
                  Close
                </button>
                {!detailModal.user.isVerified && (
                  <>
                    <button
                      onClick={() => {
                        setDetailModal({ open: false, user: null });
                        handleRejectClick(detailModal.user._id, detailModal.user.name);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors"
                    >
                      <MessageSquare size={14} />
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        setDetailModal({ open: false, user: null });
                        handleApprove(detailModal.user._id);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors"
                    >
                      <Check size={14} />
                      Approve
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                Provide feedback for this student. They will receive it in their notification center.
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

function DetailRow({ icon, label, value, valueClass = "" }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary">
      <span className="text-text-muted">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-text-muted">{label}</p>
        <p className={`text-sm font-medium text-text-primary truncate ${valueClass}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
