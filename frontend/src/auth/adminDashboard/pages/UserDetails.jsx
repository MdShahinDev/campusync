import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  IdCard,
  Calendar,
  ShieldCheck,
  ShieldX,
  Clock,
  FileText,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../services/axios";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/auth/users/${id}`);
        setUser(res.data.data.user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setError(
          err.response?.data?.message || "Failed to load user details."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const capitalizeRole = (role) => {
    if (!role) return "N/A";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-text-muted text-sm">
        Loading user details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-accent-orange transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="glass-card rounded-2xl p-12 text-center text-red-500 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-text-muted hover:text-accent-orange transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Profile Header Card */}
        <motion.div
          variants={item}
          className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6"
        >
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent-orange to-accent-orange-hover flex items-center justify-center text-white text-3xl font-bold shrink-0">
            {user.name?.charAt(0) || "?"}
          </div>
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h1 className="text-2xl font-bold text-text-primary truncate">
                {user.name}
              </h1>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full self-center ${
                  user.isVerified
                    ? "bg-green-500/10 text-green-500"
                    : "bg-red-500/10 text-red-500"
                }`}
              >
                {user.isVerified ? "Verified" : "Unverified"}
              </span>
            </div>
            <p className="text-text-muted text-sm mt-1 flex items-center gap-1.5 justify-center sm:justify-start">
              <Mail size={14} />
              {user.email}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3 justify-center sm:justify-start">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500">
                {capitalizeRole(user.role)}
              </span>
              {user.department && user.role !== "moderator" && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500">
                  {user.department}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Details Grid */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
              Account Information
            </h2>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-bg-tertiary flex items-center justify-center text-accent-orange shrink-0">
                <IdCard size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-text-muted">Student ID</p>
                <p className="text-sm font-medium text-text-primary truncate">
                  {user.studentId || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-bg-tertiary flex items-center justify-center text-accent-orange shrink-0">
                <Phone size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-text-muted">Phone</p>
                <p className="text-sm font-medium text-text-primary truncate">
                  {user.phone || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-bg-tertiary flex items-center justify-center text-accent-orange shrink-0">
                <MapPin size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-text-muted">Location</p>
                <p className="text-sm font-medium text-text-primary truncate">
                  {user.location || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
              Account Status
            </h2>

            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  user.isVerified
                    ? "bg-green-500/10 text-green-500"
                    : "bg-red-500/10 text-red-500"
                }`}
              >
                {user.isVerified ? <ShieldCheck size={16} /> : <ShieldX size={16} />}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-text-muted">Verification</p>
                <p
                  className={`text-sm font-medium ${
                    user.isVerified ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {user.isVerified ? "Verified" : "Unverified / Pending"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-bg-tertiary flex items-center justify-center text-accent-orange shrink-0">
                <Calendar size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-text-muted">Joined</p>
                <p className="text-sm font-medium text-text-primary">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-bg-tertiary flex items-center justify-center text-accent-orange shrink-0">
                <Clock size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-text-muted">Last Updated</p>
                <p className="text-sm font-medium text-text-primary">
                  {formatDate(user.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bio */}
        <motion.div variants={item} className="glass-card rounded-2xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <FileText size={16} />
            Bio
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            {user.bio || "No bio provided."}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
