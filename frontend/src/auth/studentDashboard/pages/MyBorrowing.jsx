import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Box,
  RotateCcw,
  User,
  ChevronLeft,
  ChevronRight,
  Send,
  X,
} from "lucide-react";
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

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "active", label: "Active" },
  { key: "returned", label: "Returned" },
  { key: "overdue", label: "Overdue" },
];

function getStatusBadge(status, isOverdue) {
  if (isOverdue) {
    return {
      bg: "bg-red-500/10",
      text: "text-red-500",
      label: "Overdue",
      icon: <AlertTriangle size={12} />,
    };
  }
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
        label: status,
        icon: null,
      };
  }
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(days) {
  if (!days && days !== 0) return "";
  if (days === 0) return "Same day";
  if (days === 1) return "1 day";
  return `${days} days`;
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = {
        page,
        limit: 10,
      };
      if (activeTab !== "all") params.status = activeTab;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await api.get("/borrowing/my-history", { params });
      setBorrowingData(res.data.data);
    } catch {
      setError("Failed to load borrowing history");
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, searchTerm]);

  const handleRequestReturn = async (requestId) => {
    try {
      setReturning(requestId);
      await api.put(`/borrowing/${requestId}/return-request`);
      fetchData();
    } catch {
      // silent
    } finally {
      setReturning(null);
    }
  };

  const handleCancel = async (requestId) => {
    try {
      setCancelling(requestId);
      await api.put(`/borrowing/${requestId}/cancel`);
      fetchData();
    } catch {
      // silent
    } finally {
      setCancelling(null);
    }
  };

  const requests = borrowingData?.requests || [];
  const summary = borrowingData?.summary || { active: 0, returned: 0, overdue: 0, pending: 0 };
  const pagination = borrowingData?.pagination || {};

  const pendingRecords = requests.filter((r) => r.status === "pending" || r.status === "approved");
  const activeRecords = requests.filter(
    (r) => r.status === "borrowed" || r.status === "return_requested"
  );
  const overdueRecords = requests.filter(
    (r) =>
      r.is_overdue &&
      (r.status === "borrowed" || r.status === "return_requested")
  );
  const historyRecords = requests.filter((r) => r.status === "returned");

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
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="Search by component, category, or owner..."
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
            onClick={fetchData}
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

      {/* Records List */}
      {!loading && !error && requests.length > 0 && (
        <div className="space-y-6">
          {/* Pending / Awaiting Approval */}
          {(activeTab === "all" || activeTab === "pending") &&
            pendingRecords.length > 0 && (
              <Section
                title="Pending Requests"
                icon={<Clock size={18} className="text-yellow-500" />}
                titleColor="text-yellow-500"
              >
                {pendingRecords.map((record) => (
                  <BorrowCard
                    key={record._id}
                    record={record}
                    onCancel={handleCancel}
                    cancelling={cancelling}
                    showCancelButton
                  />
                ))}
              </Section>
            )}

          {/* Active / Currently Borrowed */}
          {(activeTab === "all" || activeTab === "active") &&
            activeRecords.length > 0 && (
              <Section title="Currently Borrowed" icon={<Package size={18} />}>
                {activeRecords.map((record) => (
                  <BorrowCard
                    key={record._id}
                    record={record}
                    onRequestReturn={handleRequestReturn}
                    returning={returning}
                    showReturnButton
                  />
                ))}
              </Section>
            )}

          {/* Overdue (shown in "all" and "overdue" tabs) */}
          {(activeTab === "all" || activeTab === "overdue") &&
            overdueRecords.length > 0 && (
              <Section
                title="Overdue"
                icon={<AlertTriangle size={18} className="text-red-500" />}
                titleColor="text-red-500"
              >
                {overdueRecords.map((record) => (
                  <BorrowCard
                    key={record._id}
                    record={record}
                    onRequestReturn={handleRequestReturn}
                    returning={returning}
                    showReturnButton
                  />
                ))}
              </Section>
            )}

          {/* History */}
          {(activeTab === "all" || activeTab === "returned") &&
            historyRecords.length > 0 && (
              <Section
                title="Borrowing History"
                icon={<Clock size={18} />}
              >
                {historyRecords.map((record) => (
                  <BorrowCard key={record._id} record={record} />
                ))}
              </Section>
            )}

          {/* Active tab filtered results */}
          {activeTab !== "all" && activeTab !== "returned" && activeTab !== "pending" && (
            <Section
              title={
                activeTab === "active"
                  ? "Active Borrowings"
                  : activeTab === "overdue"
                  ? "Overdue"
                  : "Results"
              }
              icon={
                activeTab === "overdue" ? (
                  <AlertTriangle size={18} className="text-red-500" />
                ) : (
                  <Package size={18} />
                )
              }
            >
              {requests.map((record) => (
                <BorrowCard
                  key={record._id}
                  record={record}
                  onRequestReturn={handleRequestReturn}
                  returning={returning}
                  onCancel={handleCancel}
                  cancelling={cancelling}
                  showReturnButton={activeTab === "active"}
                  showCancelButton={activeTab === "pending"}
                />
              ))}
            </Section>
          )}

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

function Section({ title, icon, titleColor = "text-text-primary", children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={`flex items-center gap-2 mb-3 ${titleColor}`}>
        {icon}
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </motion.div>
  );
}

function BorrowCard({ record, onRequestReturn, returning, onCancel, cancelling, showReturnButton, showCancelButton }) {
  const statusStyle = getStatusBadge(record.status, record.is_overdue);

  return (
    <motion.div
      variants={item}
      className="glass-card rounded-2xl p-4 md:p-5 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Component Image */}
        <div className="w-full sm:w-20 h-32 sm:h-20 rounded-xl bg-bg-secondary flex items-center justify-center overflow-hidden shrink-0">
          {record.component_image ? (
            <img
              src={record.component_image}
              alt={record.component_name}
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
                {record.component_name}
              </h3>
              {record.component_category && (
                <span className="text-xs text-text-muted">
                  {record.component_category}
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
          {record.quantity > 1 && (
            <div className="text-xs text-text-muted mb-1">
              Quantity: <span className="font-medium text-text-primary">{record.quantity}</span>
            </div>
          )}

          {/* Owner */}
          <div className="flex items-center gap-1.5 mb-2">
            <User size={13} className="text-text-muted shrink-0" />
            <span className="text-xs text-text-muted">Owner:</span>
            <Link
              to={`/user/${record.owner_username || ""}`}
              className="text-xs font-medium text-accent-orange hover:underline truncate"
            >
              {record.owner_name}
            </Link>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-text-muted block">Requested</span>
              <span className="font-medium text-text-primary">
                {formatDate(record.request_date || record.createdAt)}
              </span>
            </div>
            <div>
              <span className="text-text-muted block">Expected Return</span>
              <span
                className={`font-medium ${
                  record.is_overdue ? "text-red-500" : "text-text-primary"
                }`}
              >
                {formatDate(record.expected_return_date)}
              </span>
            </div>
            {record.returned_date && (
              <div>
                <span className="text-text-muted block">Returned</span>
                <span className="font-medium text-green-500">
                  {formatDate(record.returned_date)}
                </span>
              </div>
            )}
          </div>

          {/* Duration & Overdue */}
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {record.duration_days !== null && record.duration_days !== undefined && (
              <span className="text-xs text-text-muted">
                {record.status === "returned" ? "Duration" : "Borrowed for"}:{" "}
                <span className="font-medium text-text-primary">
                  {formatDuration(record.duration_days)}
                </span>
              </span>
            )}
            {record.is_overdue && record.overdue_days > 0 && (
              <span className="text-xs font-medium text-red-500">
                Overdue by {record.overdue_days} day
                {record.overdue_days !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            {showReturnButton &&
              ["borrowed", "return_requested"].includes(record.status) && (
                <button
                  onClick={() => onRequestReturn(record._id)}
                  disabled={
                    returning === record._id ||
                    record.status === "return_requested"
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-orange/10 text-accent-orange text-xs font-medium hover:bg-accent-orange/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {returning === record._id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Send size={12} />
                  )}
                  {record.status === "return_requested"
                    ? "Return Requested"
                    : "Request Return"}
                </button>
              )}

            {showCancelButton &&
              ["pending", "approved"].includes(record.status) && (
                <button
                  onClick={() => onCancel(record._id)}
                  disabled={cancelling === record._id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {cancelling === record._id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <X size={12} />
                  )}
                  Cancel
                </button>
              )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
