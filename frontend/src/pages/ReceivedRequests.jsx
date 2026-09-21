import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  User,
  Check,
  X,
  Handshake,
  RotateCcw,
  Inbox,
} from "lucide-react";
import api from "../services/axios";

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
];

function getStatusBadge(status) {
  switch (status) {
    case "pending":
      return {
        bg: "bg-yellow-500/10",
        text: "text-yellow-500",
        label: "Pending",
        icon: <Clock size={12} />,
      };
    case "approved":
      return {
        bg: "bg-blue-500/10",
        text: "text-blue-500",
        label: "Approved",
        icon: <CheckCircle size={12} />,
      };
    case "borrowed":
      return {
        bg: "bg-accent-orange/10",
        text: "text-accent-orange",
        label: "Borrowed",
        icon: <Package size={12} />,
      };
    case "return_requested":
      return {
        bg: "bg-purple-500/10",
        text: "text-purple-500",
        label: "Return Requested",
        icon: <RotateCcw size={12} />,
      };
    case "returned":
      return {
        bg: "bg-green-500/10",
        text: "text-green-500",
        label: "Returned",
        icon: <CheckCircle size={12} />,
      };
    case "rejected":
      return {
        bg: "bg-red-500/10",
        text: "text-red-500",
        label: "Rejected",
        icon: <AlertTriangle size={12} />,
      };
    case "cancelled":
      return {
        bg: "bg-gray-500/10",
        text: "text-gray-500",
        label: "Cancelled",
        icon: <AlertTriangle size={12} />,
      };
    default:
      return {
        bg: "bg-gray-500/10",
        text: "text-gray-500",
        label: status || "Unknown",
        icon: null,
      };
  }
}

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

export default function ReceivedRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/borrowing/received");
      const data = res.data?.data;
      setRequests(Array.isArray(data?.requests) ? data.requests : []);
    } catch {
      setError("Failed to load received requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (requestId, action) => {
    const actionKey = `${requestId}-${action}`;
    try {
      setActionLoading(actionKey);
      await api.put(`/borrowing/${requestId}/${action}`);
      await fetchRequests();
    } catch {
      // Keep the page stable even on error
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
                <p className="text-2xl font-bold text-yellow-500 mt-1">
                  {requests.filter((r) => r && r.status === "pending").length}
                </p>
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
                <p className="text-2xl font-bold text-blue-500 mt-1">
                  {requests.filter((r) => r && r.status === "approved").length}
                </p>
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
                <p className="text-2xl font-bold text-accent-orange mt-1">
                  {requests.filter((r) => r && r.status === "borrowed").length}
                </p>
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
                <p className="text-2xl font-bold text-purple-500 mt-1">
                  {requests.filter((r) => r && r.status === "return_requested").length}
                </p>
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
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="Search by component or borrower..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
          />
        </div>
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
            onClick={fetchRequests}
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
            {searchTerm || activeTab !== "all"
              ? "No requests found"
              : "No received requests"}
          </h3>
          <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
            {searchTerm || activeTab !== "all"
              ? "Try adjusting your search or filter."
              : "When others request to borrow your components, they will appear here."}
          </p>
        </motion.div>
      )}

      {/* Requests List */}
      {!loading && !error && filtered.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {filtered.map((request) => {
            if (!request || !request._id) return null;
            const statusStyle = getStatusBadge(request.status);
            const isProcessing = actionLoading?.startsWith(request._id);

            return (
              <motion.div
                key={request._id}
                variants={itemAnim}
                className="glass-card rounded-2xl p-4 md:p-5 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Component Image */}
                  <div className="w-full sm:w-24 aspect-[407/305] sm:aspect-square rounded-xl bg-bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                    {request.component_image ? (
                      <img
                        src={request.component_image}
                        alt={request.component_name || "Component"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package size={28} className="text-text-muted" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <h3 className="text-sm md:text-base font-bold text-text-primary truncate">
                          {request.component_name || "Unknown Component"}
                        </h3>
                        {request.component_category && (
                          <span className="text-xs text-text-muted">
                            {request.component_category}
                          </span>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {statusStyle.icon}
                        {statusStyle.label}
                      </span>
                    </div>

                    {/* Quantity */}
                    {request.quantity > 1 && (
                      <div className="text-xs text-text-muted mb-1">
                        Quantity: <span className="font-medium text-text-primary">{request.quantity}</span>
                      </div>
                    )}

                    {/* Borrower */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <User size={13} className="text-text-muted shrink-0" />
                      <span className="text-xs text-text-muted">Borrower:</span>
                      <Link
                        to={`/user/${request.borrower_username || ""}`}
                        className="text-xs font-medium text-accent-orange hover:underline truncate"
                      >
                        {request.borrower_name || "Unknown"}
                      </Link>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mb-3">
                      <div>
                        <span className="text-text-muted block">Requested</span>
                        <span className="font-medium text-text-primary">
                          {formatDate(request.request_date || request.createdAt)}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-muted block">Expected Return</span>
                        <span className="font-medium text-text-primary">
                          {formatDate(request.expected_return_date)}
                        </span>
                      </div>
                      {request.borrowed_date && (
                        <div>
                          <span className="text-text-muted block">Handed Over</span>
                          <span className="font-medium text-text-primary">
                            {formatDate(request.borrowed_date)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Purpose */}
                    {request.purpose && (
                      <p className="text-xs text-text-muted mb-3 line-clamp-2">
                        <span className="font-medium">Purpose:</span> {request.purpose}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border-color">
                      {request.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleAction(request._id, "approve")}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 text-xs font-medium hover:bg-green-500/20 disabled:opacity-50 transition-colors"
                          >
                            {isProcessing?.endsWith("approve") ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Check size={12} />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(request._id, "reject")}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                          >
                            {isProcessing?.endsWith("reject") ? (
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
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-orange/10 text-accent-orange text-xs font-medium hover:bg-accent-orange/20 disabled:opacity-50 transition-colors"
                          >
                            {isProcessing?.endsWith("borrowed") ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Handshake size={12} />
                            )}
                            Mark as Handed Over
                          </button>
                          <button
                            onClick={() => handleAction(request._id, "reject")}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                          >
                            {isProcessing?.endsWith("reject") ? (
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
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 text-xs font-medium hover:bg-green-500/20 disabled:opacity-50 transition-colors"
                        >
                          {isProcessing?.endsWith("confirm-return") ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <CheckCircle size={12} />
                          )}
                          Confirm Return
                        </button>
                      )}

                      {request.status === "borrowed" && (
                        <span className="text-xs text-text-muted italic">
                          Waiting for borrower to request return
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
