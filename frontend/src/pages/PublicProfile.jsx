import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  AtSign,
  Building2,
  Loader2,
  UserX,
  MessageCircle,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import api from "../services/axios";
import { useAuth } from "../context/AuthContext";

export default function PublicProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/auth/user/${username}`);
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
  }, [username]);

  const handleMessage = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (!user?._id) return;

    setMessaging(true);
    try {
      const res = await api.post("/messages/conversations", {
        userId: user._id,
      });
      navigate("/messages");
    } catch (error) {
      console.error("Failed to start conversation:", error);
    } finally {
      setMessaging(false);
    }
  };

  const isOwnProfile = currentUser?.username === username;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-accent-orange" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-accent-orange/10 flex items-center justify-center mx-auto mb-6">
            <UserX size={40} className="text-accent-orange" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            User Not Found
          </h1>
          <p className="text-text-muted mb-6">
            The user @{username} does not exist.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white font-bold text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <ArrowLeft size={16} />
            Go Home
          </Link>
        </motion.div>
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
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-2xl mx-auto">
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
                <h1 className="text-xl font-bold text-text-primary">
                  {user?.name || "User"}
                </h1>
                <p className="text-sm text-accent-orange font-medium flex items-center gap-1.5 mt-0.5">
                  <AtSign size={14} />
                  {user?.username || username}
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
              {user?.university?.name && (
                <ProfileDetail
                  icon={<Building2 size={16} />}
                  label="University"
                  value={user.university.name}
                />
              )}
              {user?.location && (
                <ProfileDetail
                  icon={<MapPin size={16} />}
                  label="Location"
                  value={user.location}
                />
              )}
              {user?.role && (
                <ProfileDetail
                  icon={<Building2 size={16} />}
                  label="Role"
                  value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                />
              )}
            </div>

            {/* Contact Actions */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {user?.email && (
                <a
                  href={`mailto:${user.email}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent-orange/10 text-accent-orange text-sm font-medium hover:bg-accent-orange/20 transition-colors"
                >
                  <Mail size={16} />
                  {user.email}
                </a>
              )}
              {user?.phone && (
                <a
                  href={`tel:${user.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent-orange/10 text-accent-orange text-sm font-medium hover:bg-accent-orange/20 transition-colors"
                >
                  <Phone size={16} />
                  {user.phone}
                </a>
              )}
              {!isOwnProfile && (
                <button
                  onClick={handleMessage}
                  disabled={messaging}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white text-sm font-medium shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:shadow-none disabled:translate-y-0"
                >
                  {messaging ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <MessageCircle size={16} />
                  )}
                  Message
                </button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="text-center mt-6">
          <Link
            to="/resources"
            className="text-sm text-accent-orange hover:underline font-medium"
          >
            Browse Resources
          </Link>
        </div>
      </div>
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
