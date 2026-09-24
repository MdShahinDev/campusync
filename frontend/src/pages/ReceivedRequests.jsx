import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Check,
  X,
  Handshake,
  RotateCcw,
  Inbox,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import api from "../services/axios";
import SearchInput from "../components/common/SearchInput";
import BorrowStatusBadge from "../components/common/BorrowStatusBadge";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemAnim = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "borrowed", label: "Borrowed" },
  { key: "return_requested", label: "Returns" },
  { key: "returned", label: "Returned" },
];

const TERMINAL_STATUSES = ["returned", "rejected", "cancelled"];

function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
}

function mergeUpdatedRequest(prev, updated) {
  if (!prev || !updated || prev._id !== updated._id) return prev;
  const status = updated.status ?? prev.status;
  const expectedReturn = updated.expected_return_date ?? prev.expected_return_date;
  const isOverdue =
    ["borrowed", "return_requested"].includes(status) &&
    expectedReturn &&
    new Date(expectedReturn) < new Date();
  return {
    ...prev,
    ...updated,
    borrower_id: prev.borrower_id,
    component_id: prev.component_id,
    is_overdue: isOverdue,
  };
}

export default function ReceivedRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const fetchRequests = useCallback(async (silent = false) => {
    if (silent !== true) setLoading(true);
    try {
      setError("");
      const res = await api.get("/borrowing/received");
      const data = res.data?.data;
      setRequests(Array.isArray(data?.requests) ? data.requests : []);
    } catch {
      if (silent !== true) {
        setError("Failed to load received requests");
        setRequests([]);
      }
    } finally {
      if (silent !== true) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (requestId, action) => {
    if (actionLoading) return;
    const actionKey = `${requestId}:${action}`;
    setActionLoading(actionKey);
    setActionError("");
    setActionSuccess("");
    try {
      const res = await api.put(`/borrowing/${requestId}/${action}`);
      const updated = res.data?.data?.request;
      if (updated && updated._id) {
        setRequests((prev) => prev.map((r) => mergeUpdatedRequest(r, updated)));
      }
      setActionSuccess(res.data?.message || "Request updated successfully");
      fetchRequests(true);
    } catch (err) {
      setActionError(
        err.response?.data?.message || "The action failed. Please try again."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = requests.filter((r) => {
    if (!r) return false;
    const matchesTab = activeTab === "all" || r.status === activeTab;
    const matchesSearch =
      !searchTerm ||
      (r.component_name && r.component_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.borrower_name && r.borrower_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const countBy = (status) => requests.filter((r) => r && r.status === status).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Received Requests
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Manage incoming borrow requests for your components.
        </p>
      </div>

      {/* Summary Cards */}
      {!loading && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
        >
          <motion.div variants={itemAnim} className="glass-card rounded-2xl p-4 md:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm text-text-muted font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-500 mt-1">{countBy("pending")}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-yellow-500/10">
                <Clock size={18} className="text-yellow-500" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemAnim} className="glass-card rounded-2xl p-4 md:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm text-text-muted font-medium">Approved</p>
                <p className="text-2xl font-bold text-blue-500 mt-1">{countBy("approved")}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-500/10">
                <CheckCircle size={18} className="text-blue-500" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemAnim} className="glass-card rounded-2xl p-4 md:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm text-text-muted font-medium">Borrowed</p>
                <p className="text-2xl font-bold text-accent-orange mt-1">{countBy("borrowed")}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-accent-orange/10">
                <Package size={18} className="text-accent-orange" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemAnim} className="glass-card rounded-2xl p-4 md:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm text-text-muted font-medium">Return Requests</p>
                <p className="text-2xl font-bold text-purple-500 mt-1">{countBy("return_requested")}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-500/10">
                <RotateCcw size={18} className="text-purple-500" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by component or borrower..."
          className="flex-1"
        />
        <div className="flex gap-1 bg-bg-secondary rounded-xl p-1 border border-border-color overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-accent-orange text-white"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Feedback */}
      {actionSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-green-500/10 border border-green-500/20"
        >
          <CheckCircle size={18} className="text-green-500 shrink-0" />
          <p className="text-xs font-medium text-green-600 dark:text-green-400 flex-1">
            {actionSuccess}
          </p>
          <button
            onClick={() => setActionSuccess("")}
            className="text-green-600/60 hover:text-green-600 transition-colors"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
      {actionError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20"
        >
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <p className="text-xs font-medium text-red-500 flex-1">{actionError}</p>
          <button
            onClick={() => setActionError("")}
            className="text-red-500/60 hover:text-red-500 transition-colors"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={32} className="animate-spin text-accent-orange" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="text-center py-12">
          <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
          <p className="text-text-primary font-medium mb-2">{error}</p>
          <button
            onClick={() => fetchRequests()}
            className="text-sm text-accent-orange hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 rounded-2xl bg-bg-secondary flex items-center justify-center mx-auto mb-4">
            <Inbox size={36} className="text-text-muted" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            {searchTerm || activeTab !== "all" ? "No requests found" : "No received requests"}
          </h3>
          <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
            {searchTerm || activeTab !== "all"
              ? "Try adjusting your search or filter."
              : "When others request to borrow your components, they will appear here."}
          </p>
        </motion.div>
      )}

      {/* Requests Table */}
      {!loading && !error && filtered.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px]">
              <thead>
                <tr className="border-b border-border-color">
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                    Image
                  </th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                    Component
                  </th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                    Requested By
                  </th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                    Expected Return
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
                {filtered.map((request) => {
                  if (!request || !request._id) return null;
                  const rowActionKey = actionLoading ? actionLoading.split(":")[0] : null;
                  const isRowBusy = rowActionKey === request._id;
                  const isActionBusy = (action) =>
                    actionLoading === `${request._id}:${action}`;
                  const hasImage = Boolean(request.component_image);
                  const imageSrc =
                    request.component_id && hasImage
                      ? `${import.meta.env.VITE_API_URL}/components/${request.component_id}/image`
                      : "";

                  return (
                    <motion.tr
                      key={request._id}
                      variants={itemAnim}
                      className="hover:bg-bg-secondary transition-colors align-middle"
                    >
                      {/* Image */}
                      <td className="px-6 py-4">
                        <div className="relative w-10 h-10 rounded-lg bg-bg-secondary overflow-hidden flex items-center justify-center shrink-0">
                          <Package size={18} className="text-text-muted" />
                          {imageSrc && (
                            <img
                              src={imageSrc}
                              alt={request.component_name || "Component"}
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          )}
                        </div>
                      </td>

                      {/* Component */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/student/received-requests/${request._id}`)}
                          className="text-sm font-semibold text-text-primary hover:text-accent-orange transition-colors text-left max-w-[220px] truncate block"
                          title="View request details"
                        >
                          {request.component_name || "Unknown Component"}
                        </button>
                        <div className="flex items-center gap-2 mt-0.5">
                          {request.component_category && (
                            <span className="text-xs text-text-muted truncate max-w-[140px]">
                              {request.component_category}
                            </span>
                          )}
                          {request.quantity > 1 && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-bg-secondary text-text-secondary">
                              x{request.quantity}
                            </span>
                          )}
                          <ChevronRight size={12} className="text-text-muted shrink-0" />
                        </div>
                      </td>

                      {/* Requested By */}
                      <td className="px-6 py-4">
                        <Link
                          to={`/user/${request.borrower_username || ""}`}
                          className="text-sm font-medium text-accent-orange hover:underline truncate block max-w-[160px]"
                        >
                          {request.borrower_name || "Unknown"}
                        </Link>
                      </td>

                      {/* Expected Return */}
                      <td className="px-6 py-4 text-sm text-text-secondary whitespace-nowrap">
                        {formatDate(request.expected_return_date)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <BorrowStatusBadge
                          status={request.status}
                          isOverdue={request.is_overdue === true}
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {request.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleAction(request._id, "approve")}
                                disabled={isRowBusy}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 text-xs font-medium hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {isActionBusy("approve") ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Check size={12} />
                                )}
                                Approve
                              </button>
                              <button
                                onClick={() => handleAction(request._id, "reject")}
                                disabled={isRowBusy}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {isActionBusy("reject") ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <X size={12} />
                                )}
                                Reject
                              </button>
                            </>
                          )}

                          {request.status === "approved" && (
                            <>
                              <button
                                onClick={() => handleAction(request._id, "borrowed")}
                                disabled={isRowBusy}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-orange/10 text-accent-orange text-xs font-medium hover:bg-accent-orange/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {isActionBusy("borrowed") ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Handshake size={12} />
                                )}
                                Mark as Handed Over
                              </button>
                              <button
                                onClick={() => handleAction(request._id, "reject")}
                                disabled={isRowBusy}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {isActionBusy("reject") ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <X size={12} />
                                )}
                                Reject
                              </button>
                            </>
                          )}

                          {request.status === "return_requested" && (
                            <button
                              onClick={() => handleAction(request._id, "confirm-return")}
                              disabled={isRowBusy}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 text-xs font-medium hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {isActionBusy("confirm-return") ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <CheckCircle size={12} />
                              )}
                              Confirm Return
                            </button>
                          )}

                          {request.status === "borrowed" && (
                            <span className="text-xs text-text-muted italic">
                              Waiting for return request
                            </span>
                          )}

                          {TERMINAL_STATUSES.includes(request.status) && (
                            <button
                              onClick={() => navigate(`/student/received-requests/${request._id}`)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-secondary text-text-muted text-xs font-medium hover:text-text-primary transition-colors"
                              title="View request details"
                            >
                              View
                              <ChevronRight size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
