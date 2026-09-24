import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Box,
  ChevronLeft,
  ChevronRight,
  Send,
  X,
  AlertCircle,
} from "lucide-react";
import api from "../../../services/axios";
import SearchInput from "../../../components/common/SearchInput";
import BorrowStatusBadge from "../../../components/common/BorrowStatusBadge";

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

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "active", label: "Active" },
  { key: "returned", label: "Returned" },
  { key: "overdue", label: "Overdue" },
];

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

export default function MyBorrowing() {
  const [borrowingData, setBorrowingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [returning, setReturning] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const fetchData = useCallback(async (silent = false) => {
    if (silent !== true) setLoading(true);
    try {
      setError("");
      const params = {
        page,
        limit: 10,
      };
      if (activeTab !== "all") params.status = activeTab;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await api.get("/borrowing/my-history", { params });
      setBorrowingData(res.data?.data || null);
    } catch {
      if (silent !== true) {
        setError("Failed to load borrowing history");
      }
    } finally {
      if (silent !== true) setLoading(false);
    }
  }, [activeTab, searchTerm, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, searchTerm]);

  const handleRequestReturn = async (requestId) => {
    if (returning || cancelling) return;
    setReturning(requestId);
    setActionError("");
    setActionSuccess("");
    try {
      const res = await api.put(`/borrowing/${requestId}/return-request`);
      setActionSuccess(res.data?.message || "Return requested successfully");
      fetchData(true);
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Failed to request return. Please try again."
      );
    } finally {
      setReturning(null);
    }
  };

  const handleCancel = async (requestId) => {
    if (returning || cancelling) return;
    setCancelling(requestId);
    setActionError("");
    setActionSuccess("");
    try {
      const res = await api.put(`/borrowing/${requestId}/cancel`);
      setActionSuccess(res.data?.message || "Request cancelled");
      fetchData(true);
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Failed to cancel request. Please try again."
      );
    } finally {
      setCancelling(null);
    }
  };

  const requests = borrowingData?.requests || [];
  const summary = borrowingData?.summary || { active: 0, returned: 0, overdue: 0, pending: 0 };
  const pagination = borrowingData?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          My Borrowing
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Track your borrowed components and borrowing history.
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
          <motion.div variants={item} className="glass-card rounded-2xl p-4 md:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm text-text-muted font-medium">
                  Pending
                </p>
                <p className="text-2xl font-bold text-yellow-500 mt-1">
                  {summary.pending}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-yellow-500/10">
                <Clock size={18} className="text-yellow-500" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="glass-card rounded-2xl p-4 md:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm text-text-muted font-medium">
                  Currently Borrowed
                </p>
                <p className="text-2xl font-bold text-text-primary mt-1">
                  {summary.active}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-accent-orange/10">
                <Package size={18} className="text-accent-orange" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="glass-card rounded-2xl p-4 md:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm text-text-muted font-medium">
                  Returned
                </p>
                <p className="text-2xl font-bold text-green-500 mt-1">
                  {summary.returned}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-green-500/10">
                <CheckCircle size={18} className="text-green-500" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="glass-card rounded-2xl p-4 md:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm text-text-muted font-medium">
                  Overdue
                </p>
                <p className="text-2xl font-bold text-red-500 mt-1">
                  {summary.overdue}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-red-500/10">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by component, category, or owner..."
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={32} className="animate-spin text-accent-orange" />
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="text-center py-12">
          <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
          <p className="text-text-primary font-medium mb-2">{error}</p>
          <button
            onClick={() => fetchData()}
            className="text-sm text-accent-orange hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && requests.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 rounded-2xl bg-bg-secondary flex items-center justify-center mx-auto mb-4">
            <Box size={36} className="text-text-muted" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            No borrowing history yet
          </h3>
          <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
            Browse available components and request one for your next project.
          </p>
          <Link
            to="/components"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white font-bold text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            Browse Components
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      )}

      {/* Records Table */}
      {!loading && !error && requests.length > 0 && (
        <div className="space-y-6">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="glass-card rounded-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead>
                  <tr className="border-b border-border-color">
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                      Image
                    </th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                      Component
                    </th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                      Owner
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
                  {requests.map((record) => {
                    if (!record || !record._id) return null;
                    const isReturning = returning === record._id;
                    const isCancelling = cancelling === record._id;
                    const isRowBusy = isReturning || isCancelling;
                    const hasImage = Boolean(record.component_image);
                    const imageSrc =
                      record.component_id && hasImage
                        ? `${import.meta.env.VITE_API_URL}/components/${record.component_id}/image`
                        : "";
                    const showReturn =
                      (record.status === "borrowed" || record.status === "return_requested") &&
                      (activeTab === "all" || activeTab === "active" || activeTab === "overdue");
                    const showCancel =
                      (record.status === "pending" || record.status === "approved") &&
                      (activeTab === "all" || activeTab === "pending");

                    return (
                      <motion.tr
                        key={record._id}
                        variants={item}
                        className="hover:bg-bg-secondary transition-colors align-middle"
                      >
                        {/* Image */}
                        <td className="px-6 py-4">
                          <div className="relative w-10 h-10 rounded-lg bg-bg-secondary overflow-hidden flex items-center justify-center shrink-0">
                            <Package size={18} className="text-text-muted" />
                            {imageSrc && (
                              <img
                                src={imageSrc}
                                alt={record.component_name || "Component"}
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
                          <Link
                            to={`/student/my-borrowing/${record._id}`}
                            className="text-sm font-semibold text-text-primary hover:text-accent-orange transition-colors text-left max-w-[220px] truncate block"
                            title="View borrow details"
                          >
                            {record.component_name || "Unknown Component"}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5">
                            {record.component_category && (
                              <span className="text-xs text-text-muted truncate max-w-[140px]">
                                {record.component_category}
                              </span>
                            )}
                            {record.quantity > 1 && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-bg-secondary text-text-secondary">
                                x{record.quantity}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Owner */}
                        <td className="px-6 py-4">
                          <Link
                            to={`/user/${record.owner_username || ""}`}
                            className="text-sm font-medium text-accent-orange hover:underline truncate block max-w-[150px]"
                          >
                            {record.owner_name || "Unknown"}
                          </Link>
                        </td>

                        {/* Expected Return */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-sm ${
                              record.is_overdue ? "text-red-500 font-semibold" : "text-text-secondary"
                            }`}
                          >
                            {formatDate(record.expected_return_date)}
                          </span>
                          {record.is_overdue && record.overdue_days > 0 && (
                            <p className="text-[11px] font-medium text-red-500">
                              Overdue by {record.overdue_days} day
                              {record.overdue_days !== 1 ? "s" : ""}
                            </p>
                          )}
                          {record.returned_date && (
                            <p className="text-[11px] text-green-500">
                              Returned {formatDate(record.returned_date)}
                            </p>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <BorrowStatusBadge
                            status={record.status}
                            isOverdue={record.is_overdue === true}
                          />
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {showReturn && (
                              <button
                                onClick={() => handleRequestReturn(record._id)}
                                disabled={isRowBusy || record.status === "return_requested"}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-orange/10 text-accent-orange text-xs font-medium hover:bg-accent-orange/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {isReturning ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Send size={12} />
                                )}
                                {record.status === "return_requested"
                                  ? "Return Requested"
                                  : "Request Return"}
                              </button>
                            )}

                            {showCancel && (
                              <button
                                onClick={() => handleCancel(record._id)}
                                disabled={isRowBusy}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {isCancelling ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <X size={12} />
                                )}
                                Cancel
                              </button>
                            )}

                            {!showReturn && !showCancel && (
                              <Link
                                to={`/student/my-borrowing/${record._id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-secondary border border-border-color text-text-muted text-xs font-medium hover:text-text-primary transition-colors"
                              >
                                View
                              </Link>
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrev}
                className="p-2 rounded-xl bg-bg-secondary border border-border-color text-text-muted hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-text-muted">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNext}
                className="p-2 rounded-xl bg-bg-secondary border border-border-color text-text-muted hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
