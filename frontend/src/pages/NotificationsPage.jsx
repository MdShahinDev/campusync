import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Box,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Mail,
} from "lucide-react";
import api from "../services/axios";
import {
  NOTIFICATIONS_PATH,
  notificationTypeMeta,
  formatNotificationTime,
} from "../services/notifications";

const PAGE_SIZE = 15;

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState(null);
  const [loadedKey, setLoadedKey] = useState(null);
  const [fetchTick, setFetchTick] = useState(0);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [markingAll, setMarkingAll] = useState(false);

  // Derived loading state: nothing synchronous happens inside the effect, so
  // first load, page changes, filter changes and retries all show the spinner
  // without tripping React's "setState inside an effect" rule.
  const fetchKey = `${page}|${filter}`;
  const loading = !error && loadedKey !== fetchKey;

  const refresh = () => setFetchTick((tick) => tick + 1);

  const changeFilter = (key) => {
    setError("");
    setFilter(key);
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

  useEffect(() => {
    let cancelled = false;
    const effectKey = `${page}|${filter}`;
    const params = { page, limit: PAGE_SIZE };
    if (filter === "unread") params.unreadOnly = "true";

    api
      .get("/notifications", { params })
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data || {};
        setItems(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        setPagination(data.pagination || null);
        setLoadedKey(effectKey);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setItems(null);
        setError(
          err.response?.data?.message || "Failed to load your notifications"
        );
      });

    return () => {
      cancelled = true;
    };
  }, [page, filter, fetchTick]);

  const markAsRead = (event, id) => {
    event.stopPropagation();
    api
      .put(`/notifications/${id}/read`)
      .then(() => {
        setItems((prev) =>
          (prev || []).map((n) =>
            n._id === id
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      })
      .catch(() => {
        // The details page marks it read again as a fallback.
      });
  };

  const markAllAsRead = () => {
    if (markingAll) return;
    setMarkingAll(true);
    api
      .put("/notifications/read-all")
      .then(() => {
        setItems((prev) => (prev || []).map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        refresh();
      })
      .catch(() => {
        // silent
      })
      .finally(() => setMarkingAll(false));
  };

  const openNotification = (notification) => {
    if (!notification.isRead) {
      api
        .put(`/notifications/${notification._id}/read`)
        .then(() => setUnreadCount((prev) => Math.max(0, prev - 1)))
        .catch(() => {
          // fallback happens on the details page
        });
    }
    navigate(`${NOTIFICATIONS_PATH}/${notification._id}`);
  };

  const notifications = items || [];

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Notification{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8A00] to-[#FF6B00]">
              Center
            </span>
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            Everything that happened to your account, in one place.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            disabled={markingAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-xs font-medium text-text-primary hover:bg-bg-tertiary transition-colors self-start"
          >
            {markingAll ? (
              <Loader2 size={14} className="animate-spin text-accent-orange" />
            ) : (
              <CheckCheck size={14} className="text-accent-orange" />
            )}
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-1 bg-bg-secondary rounded-xl p-1 border border-border-color w-fit">
        {FILTERS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => changeFilter(tab.key)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === tab.key
                ? "bg-accent-orange text-white"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
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
      {!loading && !error && notifications.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 rounded-2xl bg-bg-secondary flex items-center justify-center mx-auto mb-4">
            {filter === "unread" ? (
              <CheckCheck size={36} className="text-text-muted" />
            ) : (
              <Box size={36} className="text-text-muted" />
            )}
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            {filter === "unread" ? "You are all caught up" : "No notifications yet"}
          </h3>
          <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
            {filter === "unread"
              ? "There are no unread notifications waiting for you."
              : "Borrow updates, account news and reports will appear here."}
          </p>
          {filter === "unread" && (
            <button
              onClick={() => changeFilter("all")}
              className="text-sm text-accent-orange hover:underline"
            >
              Show all notifications
            </button>
          )}
        </motion.div>
      )}

      {/* List */}
      {!loading && !error && notifications.length > 0 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {notifications.map((notification, index) => {
                const meta = notificationTypeMeta(notification);
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, delay: Math.min(index, 8) * 0.03 }}
                    onClick={() => openNotification(notification)}
                    className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-colors ${
                      notification.isRead
                        ? "bg-bg-card border-border-color hover:bg-bg-secondary"
                        : "bg-accent-orange/5 border-accent-orange/20 hover:bg-accent-orange/10"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.toneClasses.icon}`}
                    >
                      <Icon size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-text-primary">
                          {notification.title}
                        </p>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${meta.toneClasses.chip}`}
                        >
                          {meta.label}
                        </span>
                        {!notification.isRead && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-accent-orange text-white">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-muted mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-text-muted/70 mt-1.5">
                        {formatNotificationTime(notification.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!notification.isRead && (
                        <button
                          onClick={(e) => markAsRead(e, notification._id)}
                          className="p-2 rounded-lg text-accent-orange hover:bg-accent-orange/10 transition-colors"
                          title="Mark as read"
                          aria-label="Mark as read"
                        >
                          <CheckCheck size={16} />
                        </button>
                      )}
                      <Mail
                        size={16}
                        className="text-text-muted/50"
                        aria-hidden="true"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
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
                Page {pagination.page} of {pagination.totalPages}
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
