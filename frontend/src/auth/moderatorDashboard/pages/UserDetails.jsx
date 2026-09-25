import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  AtSign,
  Building2,
  Loader2,
  Send,
  UserX,
  Calendar,
  CheckCircle,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import api from "../../../services/axios";
import { messagingHref } from "../../../services/messaging";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState("info");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/auth/users/${id}`);
        setUser(res.data.data.user);
      } catch (error) {
        if (error.response?.status === 404) {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    setSending(true);
    setSendError("");
    try {
      await api.post("/notifications", {
        userId: user._id,
        title: notifTitle.trim(),
        message: notifMessage.trim(),
        type: notifType,
      });
      setSent(true);
      setNotifTitle("");
      setNotifMessage("");
      setNotifType("info");
      setTimeout(() => {
        setSent(false);
        setShowNotificationForm(false);
      }, 2000);
    } catch (error) {
      setSendError(error.response?.data?.message || "Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-accent-orange" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-12">
        <UserX size={48} className="mx-auto text-text-muted mb-4" />
        <h2 className="text-xl font-bold text-text-primary mb-2">
          User Not Found
        </h2>
        <p className="text-text-muted mb-4">
          The requested user does not exist.
        </p>
        <Link
          to="/moderator/all-users"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-orange text-white text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to Users
        </Link>
      </div>
    );
  }

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-bg-secondary text-text-muted transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
              Student Details
            </h1>
            <p className="text-text-muted mt-1 text-sm">
              View student profile and send notifications.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start">
          {user?._id && (
            <Link
              to={messagingHref(user.role, user._id)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-color bg-bg-secondary text-text-primary font-semibold text-sm hover:bg-bg-tertiary transition-colors"
            >
              <MessageSquare size={16} />
              Message
            </Link>
          )}
          <button
            onClick={() => setShowNotificationForm(!showNotificationForm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white font-bold text-sm shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <Send size={16} />
            Send Notification
          </button>
        </div>
      </div>

      {/* Notification Form */}
      {showNotificationForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-text-primary mb-4">
            Send Notification to {user?.name}
          </h3>

          {sent ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 text-green-500">
              <CheckCircle size={20} />
              <p className="text-sm font-medium">Notification sent successfully!</p>
            </div>
          ) : (
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Type
                </label>
                <select
                  value={notifType}
                  onChange={(e) => setNotifType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="alert">Alert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="Notification title"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Message
                </label>
                <textarea
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="Write your message here..."
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30 resize-none"
                />
              </div>

              {sendError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-500 text-sm">
                  <AlertCircle size={16} />
                  {sendError}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={sending || !notifTitle.trim() || !notifMessage.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white font-bold text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  {sending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  Send
                </button>
                <button
                  type="button"
                  onClick={() => setShowNotificationForm(false)}
                  className="px-5 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-secondary text-sm font-medium hover:bg-bg-tertiary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </motion.div>
      )}

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        {/* Cover */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-accent-orange/20 to-accent-orange-hover/10 relative">
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent-orange to-accent-orange-hover flex items-center justify-center text-white text-3xl font-bold border-4 border-bg-primary shadow-lg">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || "U"
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="pt-14 px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                {user?.name || "Student"}
              </h2>
              <p className="text-sm text-accent-orange font-medium flex items-center gap-1.5 mt-0.5">
                <AtSign size={14} />
                {user?.username || "N/A"}
              </p>
            </div>
            {joinDate && (
              <span className="text-xs text-text-muted bg-bg-secondary px-3 py-1.5 rounded-full self-start flex items-center gap-1.5">
                <Calendar size={12} />
                Joined {joinDate}
              </span>
            )}
          </div>

          {user?.bio && (
            <p className="text-sm text-text-secondary mt-4 leading-relaxed">
              {user.bio}
            </p>
          )}

          {/* Details */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ProfileDetail
              icon={<Building2 size={16} />}
              label="University"
              value={user?.university?.name || "N/A"}
            />
            <ProfileDetail
              icon={<Mail size={16} />}
              label="Email"
              value={user?.email || "N/A"}
            />
            <ProfileDetail
              icon={<Phone size={16} />}
              label="Phone"
              value={user?.phone || "Not set"}
            />
            <ProfileDetail
              icon={<MapPin size={16} />}
              label="Location"
              value={user?.location || "Not set"}
            />
            <ProfileDetail
              icon={<Building2 size={16} />}
              label="Department"
              value={user?.department || "Not set"}
            />
            {user?.studentId && (
              <ProfileDetail
                icon={<Calendar size={16} />}
                label="Student ID"
                value={user.studentId}
              />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ProfileDetail({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary">
      <span className="text-text-muted">{icon}</span>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm font-medium text-text-primary">{value}</p>
      </div>
    </div>
  );
}
