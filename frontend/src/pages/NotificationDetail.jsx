import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  Loader2,
  UserX,
  Calendar,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import api from "../services/axios";
import { useAuth } from "../context/AuthContext";

function getTypeStyle(type) {
  switch (type) {
    case "warning":
      return {
        bg: "bg-yellow-500/10",
        text: "text-yellow-500",
        icon: <AlertTriangle size={20} />,
      };
    case "success":
      return {
        bg: "bg-green-500/10",
        text: "text-green-500",
        icon: <CheckCircle size={20} />,
      };
    case "alert":
      return {
        bg: "bg-red-500/10",
        text: "text-red-500",
        icon: <AlertCircle size={20} />,
      };
    default:
      return {
        bg: "bg-blue-500/10",
        text: "text-blue-500",
        icon: <Info size={20} />,
      };
  }
}

function getRoleBadgeStyle(role) {
  switch (role) {
    case "admin":
      return "bg-red-500/10 text-red-500";
    case "moderator":
      return "bg-blue-500/10 text-blue-500";
    default:
      return "bg-green-500/10 text-green-500";
  }
}

export default function NotificationDetail() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const res = await api.get(`/notifications/${id}`);
        setNotification(res.data.data.notification);
      } catch (error) {
        if (error.response?.status === 404) {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchNotification();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={32} className="animate-spin text-accent-orange" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <UserX size={48} className="mx-auto text-text-muted mb-4" />
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Notification Not Found
        </h1>
        <p className="text-text-muted mb-6">
          This notification does not exist or has been removed.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white font-bold text-sm shadow-lg"
        >
          <ArrowLeft size={16} />
          Go Home
        </Link>
      </div>
    );
  }

  const typeStyle = getTypeStyle(notification?.type);
  const date = notification?.createdAt
    ? new Date(notification.createdAt).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  const sender = notification?.senderId;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className={`px-6 py-5 ${typeStyle.bg} border-b border-border-color`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-xl ${typeStyle.bg} ${typeStyle.text}`}>
              {typeStyle.icon}
            </div>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${typeStyle.bg} ${typeStyle.text}`}
            >
              {notification?.type || "info"}
            </span>
          </div>
          <h1 className="text-xl font-bold text-text-primary">
            {notification?.title}
          </h1>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {/* Sender Info */}
          {sender ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-bg-secondary mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-orange to-accent-orange-hover flex items-center justify-center text-white font-bold text-sm shrink-0">
                {sender.avatar ? (
                  <img
                    src={sender.avatar}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  sender.name?.charAt(0)?.toUpperCase() || "U"
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {sender.name}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize ${getRoleBadgeStyle(
                      sender.role
                    )}`}
                  >
                    {sender.role}
                  </span>
                  <span className="text-xs text-text-muted">
                    @{sender.username}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-bg-secondary mb-6">
              <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center text-text-muted shrink-0">
                <Bell size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  System
                </p>
                <p className="text-xs text-text-muted">
                  Automated notification
                </p>
              </div>
            </div>
          )}

          {/* Message */}
          <div className="mb-6">
            <p className="text-sm text-text-muted mb-2 font-medium">Message</p>
            <p className="text-text-primary leading-relaxed whitespace-pre-wrap">
              {notification?.message}
            </p>
          </div>

          {/* Date */}
          {date && (
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Calendar size={14} />
              <span>{date}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-color">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-accent-orange hover:underline font-medium"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
