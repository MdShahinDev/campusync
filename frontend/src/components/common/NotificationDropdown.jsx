import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/axios";
import {
  NOTIFICATIONS_PATH,
  notificationTypeMeta,
  formatNotificationTime,
} from "../../services/notifications";

const LIST_LIMIT = 8;

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(() => {
    return api
      .get("/notifications", { params: { limit: LIST_LIMIT } })
      .then((res) => {
        const data = res.data?.data || {};
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {
        // Keep whatever is already on screen - the header must never break.
      });
  }, []);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/notifications", { params: { limit: LIST_LIMIT } })
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data || {};
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {
        if (cancelled) return;
        setNotifications([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) fetchNotifications();
  };

  const handleOpenNotification = (notification) => {
    setIsOpen(false);
    if (!notification?.isRead) {
      api
        .put(`/notifications/${notification._id}/read`)
        .then(() => setUnreadCount((prev) => Math.max(0, prev - 1)))
        .catch(() => {
          // the details page marks it read again as a fallback
        });
    }
    navigate(`${NOTIFICATIONS_PATH}/${notification._id}`);
  };

  const markAsRead = (event, id) => {
    event.stopPropagation();
    api
      .put(`/notifications/${id}/read`)
      .then(() => {
        setNotifications((prev) =>
          (prev || []).map((n) =>
            n._id === id
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      })
      .catch(() => {
        // silent
      });
  };

  const markAllAsRead = () => {
    if (markingAll) return;
    setMarkingAll(true);
    api
      .put("/notifications/read-all")
      .then(() => {
        setNotifications((prev) =>
          (prev || []).map((n) => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
      })
      .catch(() => {
        // silent
      })
      .finally(() => setMarkingAll(false));
  };

  const items = notifications || [];

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative p-2 rounded-xl text-text-primary hover:bg-bg-secondary transition-colors"
      >
        <Bell size={20} strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-accent-orange text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-bg-primary border border-border-color rounded-xl shadow-xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-color">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-text-primary">
                  Notifications
                </p>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-accent-orange text-white text-[9px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={markingAll}
                  className="text-xs text-accent-orange hover:text-accent-orange-hover transition-colors flex items-center gap-1"
                >
                  {markingAll ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <CheckCheck size={12} />
                  )}
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications === null ? (
                <div className="px-4 py-8 text-center">
                  <Loader2
                    size={22}
                    className="mx-auto animate-spin text-accent-orange mb-2"
                  />
                  <p className="text-xs text-text-muted">Loadingâ€¦</p>
                </div>
              ) : items.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell size={24} className="mx-auto text-text-muted mb-2" />
                  <p className="text-sm text-text-muted">No notifications yet</p>
                </div>
              ) : (
                items.map((notification) => {
                  const meta = notificationTypeMeta(notification);
                  const Icon = meta.icon;
                  return (
                    <div
                      key={notification._id}
                      onClick={() => handleOpenNotification(notification)}
                      className={`px-4 py-3 border-b border-border-color last:border-b-0 hover:bg-bg-secondary transition-colors cursor-pointer ${
                        !notification.isRead ? "bg-accent-orange/5" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.toneClasses.icon}`}
                        >
                          <Icon size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-text-primary truncate">
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-accent-orange shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-[11px] text-text-muted/70 mt-1">
                            {formatNotificationTime(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <button
                            onClick={(e) => markAsRead(e, notification._id)}
                            className="p-1 rounded-lg text-accent-orange hover:bg-accent-orange/10 transition-colors shrink-0"
                            title="Mark as read"
                            aria-label="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <button
              onClick={() => {
                setIsOpen(false);
                navigate(NOTIFICATIONS_PATH);
              }}
              className="w-full px-4 py-2.5 text-xs font-medium text-accent-orange hover:bg-bg-secondary border-t border-border-color transition-colors"
            >
              View all notifications
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
