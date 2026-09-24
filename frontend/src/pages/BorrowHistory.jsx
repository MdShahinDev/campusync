import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Loader2,
  AlertTriangle,
  Box,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import api from "../services/axios";
import SearchInput from "../components/common/SearchInput";
import BorrowStatusBadge from "../components/common/BorrowStatusBadge";
import ConfirmDialog from "../components/common/ConfirmDialog";

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
  { key: "approved", label: "Approved" },
  { key: "borrowed", label: "Borrowed" },
  { key: "return_requested", label: "Return Requested" },
  { key: "returned", label: "Returned" },
  { key: "rejected", label: "Rejected" },
  { key: "cancelled", label: "Cancelled" },
];

export default function BorrowHistory({ basePath = "/admin/borrow-history" }) {
  const [historyData, setHistoryData] = useState(null);
  const [loadedKey, setLoadedKey] = useState(null);
  const [fetchTick, setFetchTick] = useState(0);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  // Derived loading state: true whenever the current filter/page combination
  // has not been loaded yet (or a retry was requested), so first load, page
  // changes, tab changes and retries all show the spinner without any
  // setState inside the effect.
  const fetchKey = `${page}|${activeTab}|${searchTerm}`;
  const loading = !error && loadedKey !== fetchKey;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const refresh = () => setFetchTick((tick) => tick + 1);

  const changeTab = (key) => {
    setError("");
    setActiveTab(key);
    setPage(1);
    refresh();
  };

  const changeSearch = (value) => {
    setError("");
    setSearchTerm(value);
    setPage(1);
    refresh();
  };

  const changePage = (updater) => {
    setError("");
    setPage(updater);
    refresh();
  };

  const handleRetry = () => {
    setError("");
    refresh();
  };

  const clearFilters = () => {
    setError("");
    setSearchTerm("");
    setActiveTab("all");
    setPage(1);
    refresh();
  };

  useEffect(() => {
    let cancelled = false;
    const key = `${page}|${activeTab}|${searchTerm}`;
    const params = { page, limit: 10 };
    if (activeTab !== "all") params.status = activeTab;
    if (searchTerm.trim()) params.search = searchTerm.trim();

    api
      .get("/borrowing/history", { params })
      .then((res) => {
        if (cancelled) return;
        setHistoryData(res.data?.data || null);
        setLoadedKey(key);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setHistoryData(null);
        setError(err.response?.data?.message || "Failed to load borrow history");
      });

    return () => {
      cancelled = true;
    };
  }, [page, activeTab, searchTerm, fetchTick]);

  const handleDelete = async () => {
    if (deleting || !deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/borrowing/history/${deleteTarget._id}`);
      const deletedId = deleteTarget._id;
      const remaining = (historyData?.requests || []).filter(
        (r) => r._id !== deletedId
      );

      setDeleteTarget(null);
      setHistoryData((prev) =>
        prev ? { ...prev, requests: remaining } : prev
      );
      showToast("Borrow record deleted successfully");

      if (remaining.length === 0 && page > 1) {
        setPage((p) => Math.max(1, p - 1));
      } else {
        refresh();
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to delete borrow record",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  const requests = historyData?.requests || [];
  const pagination = historyData?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg ${
              toast.type === "error"
                ? "bg-red-500/10 border-red-500/30 text-red-500"
                : "bg-green-500/10 border-green-500/30 text-green-500"
            }`}
          >
            {toast.type === "error" ? (
              <AlertTriangle size={16} />
            ) : (
              <CheckCircle size={16} />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Borrow Record?"
        message={`This will remove the borrow history record for "${
          deleteTarget?.component_name || "this component"
        }".`}
        detail="The component, the owner, the requester and any other borrow records are not affected. This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          Borrow{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8A00] to-[#FF6B00]">
            History
          </span>
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Centralized record of every borrow request and its lifecycle.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={searchTerm}
          onChange={changeSearch}
          placeholder="Search by component, owner, or requester..."
          className="flex-1"
        />
        <div className="flex gap-1 bg-bg-secondary rounded-xl p-1 border border-border-color overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => changeTab(tab.key)}
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
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <p className="text-text-primary font-medium mb-2">{error}</p>
          <button
            onClick={handleRetry}
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
              ? "No borrow records found"
              : "No borrow history yet"}
          </h3>
          <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
            {searchTerm || activeTab !== "all"
              ? "Try adjusting your search or filter."
              : "Borrow requests will appear here once students start borrowing components."}
          </p>
          {(searchTerm || activeTab !== "all") && (
            <button
              onClick={clearFilters}
              className="text-sm text-accent-orange hover:underline"
            >
              Clear search and filters
            </button>
          )}
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
              <table className="w-full min-w-[860px]">
                <thead>
                  <tr className="border-b border-border-color">
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                      Image
                    </th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                      Component Name
                    </th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                      Owner &amp; Requester
                    </th>
                    <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                      Status
                    </th>
                    <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider px-6 py-4">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {requests.map((record) => {
                    if (!record || !record._id) return null;
                    const hasImage = Boolean(record.component_image);
                    const imageSrc =
                      record.component_id && hasImage
                        ? `${import.meta.env.VITE_API_URL}/components/${
                            record.component_id
                          }/image`
                        : "";

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

                        {/* Component Name — opens this borrow request's details */}
                        <td className="px-6 py-4">
                          <Link
                            to={`${basePath}/${record._id}`}
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

                        {/* Owner & Requester */}
                        <td className="px-6 py-4">
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted shrink-0">
                                Owner
                              </span>
                              <span className="text-sm font-medium text-text-primary truncate max-w-[150px]">
                                {record.owner_name || "Unknown"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted shrink-0">
                                Requester
                              </span>
                              <span className="text-sm text-text-secondary truncate max-w-[150px]">
                                {record.borrower_name || "Unknown"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <BorrowStatusBadge
                            status={record.status}
                            isOverdue={record.is_overdue === true}
                          />
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => setDeleteTarget(record)}
                              disabled={deleting}
                              className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete borrow record"
                              aria-label="Delete borrow record"
                            >
                              <Trash2 size={16} />
                            </button>
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
                onClick={() => changePage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrev}
                className="p-2 rounded-xl bg-bg-secondary border border-border-color text-text-muted hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-text-muted">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => changePage((p) => p + 1)}
                disabled={!pagination.hasNext}
                className="p-2 rounded-xl bg-bg-secondary border border-border-color text-text-muted hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
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
