import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  User,
  ChevronLeft,
  ChevronRight,
  Box,
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
  { key: "returned", label: "Returned" },
  { key: "rejected", label: "Rejected" },
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

function formatDuration(days) {
  if (!days && days !== 0) return "";
  if (days === 0) return "Same day";
  if (days === 1) return "1 day";
  return `${days} days`;
}

export default function OwnerHistory() {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = { page, limit: 10 };
      if (activeTab !== "all") params.status = activeTab;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await api.get("/borrowing/owner-history", { params });
      setHistoryData(res.data.data);
    } catch {
      setError("Failed to load owner history");
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

  const requests = historyData?.requests || [];
  const summary = historyData?.summary || {};
  const pagination = historyData?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Lending History
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          History of all borrow requests for your components.
        </p>
      </div>

      {/* Summary Cards */}
      {!loading && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4"
        >
          <motion.div variants={itemAnim} className="glass-card rounded-2xl p-4 md:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm text-text-muted font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-500 mt-1">{summary.pending || 0}</p>
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
                <p className="text-2xl font-bold text-blue-500 mt-1">{summary.approved || 0}</p>
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
                <p className="text-2xl font-bold text-accent-orange mt-1">{summary.borrowed || 0}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-accent-orange/10">
                <Package size={18} className="text-accent-orange" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemAnim} className="glass-card rounded-2xl p-4 md:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm text-text-muted font-medium">Returned</p>
                <p className="text-2xl font-bold text-green-500 mt-1">{summary.returned || 0}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-green-500/10">
                <CheckCircle size={18} className="text-green-500" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemAnim} className="glass-card rounded-2xl p-4 md:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm text-text-muted font-medium">Rejected</p>
                <p className="text-2xl font-bold text-red-500 mt-1">{summary.rejected || 0}</p>
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
            onClick={fetchData}
            className="text-sm text-accent-orange hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
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
            {searchTerm || activeTab !== "all"
              ? "No requests found"
              : "No lending history yet"}
          </h3>
          <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
            {searchTerm || activeTab !== "all"
              ? "Try adjusting your search or filter."
              : "When others request to borrow your components, they will appear here."}
          </p>
        </motion.div>
      )}

      {/* Records List */}
      {!loading && !error && requests.length > 0 && (
        <div className="space-y-3">
          {requests.map((record) => {
            if (!record || !record._id) return null;

            return (
              <motion.div
                key={record._id}
                variants={itemAnim}
                initial="hidden"
                animate="show"
                className="glass-card rounded-2xl p-4 md:p-5 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Component Image */}
                  <div className="w-full sm:w-24 aspect-[407/305] sm:aspect-square rounded-xl bg-bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                    {record.component_image ? (
                      <img
                        src={record.component_image}
                        alt={record.component_name || "Component"}
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
                          {record.component_name || "Unknown Component"}
                        </h3>
                        {record.component_category && (
                          <span className="text-xs text-text-muted">
                            {record.component_category}
                          </span>
                        )}
                      </div>
                      <BorrowStatusBadge
                        status={record.status}
                        isOverdue={record.is_overdue === true}
                        className="shrink-0"
                      />
                    </div>

                    {/* Quantity */}
                    {record.quantity > 1 && (
                      <div className="text-xs text-text-muted mb-1">
                        Quantity: <span className="font-medium text-text-primary">{record.quantity}</span>
                      </div>
                    )}

                    {/* Borrower */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <User size={13} className="text-text-muted shrink-0" />
                      <span className="text-xs text-text-muted">Borrower:</span>
                      <Link
                        to={`/user/${record.borrower_username || ""}`}
                        className="text-sm font-medium text-accent-orange hover:underline truncate"
                      >
                        {record.borrower_name || "Unknown"}
                      </Link>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-2">
                      <div>
                        <span className="text-text-muted block">Requested</span>
                        <span className="font-medium text-text-primary">
                          {formatDate(record.request_date || record.createdAt)}
                        </span>
                      </div>
                      {record.approved_date && (
                        <div>
                          <span className="text-text-muted block">Approved</span>
                          <span className="font-medium text-text-primary">
                            {formatDate(record.approved_date)}
                          </span>
                        </div>
                      )}
                      {record.borrowed_date && (
                        <div>
                          <span className="text-text-muted block">Handed Over</span>
                          <span className="font-medium text-text-primary">
                            {formatDate(record.borrowed_date)}
                          </span>
                        </div>
                      )}
                      {record.returned_date && (
                        <div>
                          <span className="text-text-muted block">Returned</span>
                          <span className="font-medium text-green-500">
                            {formatDate(record.returned_date)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Duration */}
                    {record.duration_days !== null && record.duration_days !== undefined && (
                      <span className="text-xs text-text-muted">
                        Duration:{" "}
                        <span className="font-medium text-text-primary">
                          {formatDuration(record.duration_days)}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
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
