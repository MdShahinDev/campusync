import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  Loader2,
  AlertCircle,
  MapPin,
  User,
  ArrowLeft,
  Calendar,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import api from "../services/axios";
import { useAuth } from "../context/AuthContext";
import BorrowRequestModal from "../components/common/BorrowRequestModal";

function getConditionColor(condition) {
  switch (condition) {
    case "New":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "Excellent":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "Good":
      return "bg-accent-orange/10 text-accent-orange border-accent-orange/20";
    case "Fair":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "Poor":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  }
}

function getRequestStateLabel(status) {
  switch (status) {
    case "pending":
      return { label: "Requested", icon: <Clock size={16} />, color: "text-yellow-500" };
    case "approved":
      return { label: "Approved", icon: <CheckCircle size={16} />, color: "text-blue-500" };
    case "borrowed":
      return { label: "Borrowed", icon: <Package size={16} />, color: "text-accent-orange" };
    case "return_requested":
      return { label: "Return Requested", icon: <Package size={16} />, color: "text-purple-500" };
    default:
      return null;
  }
}

export default function ComponentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [borrowSuccess, setBorrowSuccess] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);

  const fetchComponent = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/components/${id}`);
      setComponent(res.data.data.component);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Component not found");
      } else {
        setError("Failed to load component details");
      }
    } finally {
      setLoading(false);
    }
  };

  const checkActiveRequest = async () => {
    try {
      const res = await api.get(`/borrowing/active-request?component_id=${id}`);
      setActiveRequest(res.data.data.request || null);
    } catch {
      setActiveRequest(null);
    }
  };

  useEffect(() => {
    fetchComponent();
  }, [id]);

  useEffect(() => {
    if (user && component && user._id !== component.owner_id) {
      checkActiveRequest();
    }
  }, [user, component, id]);

  const handleBorrowSuccess = () => {
    setShowBorrowModal(false);
    setBorrowSuccess(true);
    setTimeout(() => setBorrowSuccess(false), 5000);
    fetchComponent();
    checkActiveRequest();
  };

  const isOwner = user && component && user._id === component.owner_id;
  const isVerified = user && user.isVerified !== false;
  const canBorrow =
    user &&
    component &&
    !isOwner &&
    isVerified &&
    component.is_active &&
    component.available_quantity > 0 &&
    !activeRequest;

  const requestState = activeRequest ? getRequestStateLabel(activeRequest.status) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-accent-orange" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <p className="text-text-primary font-medium mb-2">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-accent-orange hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!component) return null;

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent-orange transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </motion.div>

        {/* Success Alert */}
        {borrowSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30"
          >
            <AlertCircle size={20} className="text-green-500 shrink-0" />
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Borrow request sent successfully! The owner will review your request.
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          {/* Image */}
          <div className="aspect-[407/305] sm:aspect-[407/305] bg-bg-secondary flex items-center justify-center overflow-hidden">
            {component.image_url ? (
              <img
                src={`${import.meta.env.VITE_API_URL}/components/${component._id}/image`}
                alt={component.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package size={64} className="text-text-muted" />
            )}
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-2">
                  {component.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-bg-secondary px-3 py-1 rounded-full text-sm text-text-secondary font-medium">
                    {component.category}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full border ${getConditionColor(
                      component.condition
                    )}`}
                  >
                    {component.condition}
                  </span>
                </div>
              </div>

              {/* Availability */}
              <div className="shrink-0 text-right">
                <p className="text-sm text-text-muted mb-1">Availability</p>
                <p
                  className={`text-2xl font-bold ${
                    component.available_quantity > 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {component.available_quantity}
                  <span className="text-sm font-normal text-text-muted">
                    {" "}
                    / {component.quantity}
                  </span>
                </p>
              </div>
            </div>

            {/* Description */}
            {component.description && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-text-primary mb-2">
                  Description
                </h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {component.description}
                </p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Owner */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary">
                <div className="p-2 rounded-lg bg-accent-orange/10">
                  <User size={16} className="text-accent-orange" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-text-muted">Owner</p>
                  <Link
                    to={`/user/${component.owner_username || ""}`}
                    className="text-sm font-medium text-accent-orange hover:underline truncate block"
                  >
                    {component.owner_name}
                  </Link>
                </div>
              </div>

              {/* Location */}
              {component.location && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary">
                  <div className="p-2 rounded-lg bg-accent-orange/10">
                    <MapPin size={16} className="text-accent-orange" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-text-muted">Location</p>
                    <p className="text-sm font-medium text-text-primary truncate">
                      {component.location}
                    </p>
                  </div>
                </div>
              )}

              {/* Listed Date */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary">
                <div className="p-2 rounded-lg bg-accent-orange/10">
                  <Calendar size={16} className="text-accent-orange" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Listed</p>
                  <p className="text-sm font-medium text-text-primary">
                    {new Date(component.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border-color">
              {canBorrow && (
                <button
                  onClick={() => setShowBorrowModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white font-bold text-sm shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  <Package size={16} />
                  Request to Borrow
                </button>
              )}

              {user && !isOwner && !isVerified && !activeRequest && (
                <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 text-sm font-medium">
                  <AlertTriangle size={16} />
                  Account verification required to borrow
                </div>
              )}

              {requestState && (
                <div className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-bg-secondary text-sm font-medium ${requestState.color}`}>
                  {requestState.icon}
                  {requestState.label}
                </div>
              )}

              {isOwner && (
                <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-bg-secondary text-text-muted text-sm font-medium">
                  <Package size={16} />
                  This is your component
                </div>
              )}

              {!user && (
                <Link
                  to="/login"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white font-bold text-sm shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  Login to Borrow
                </Link>
              )}

              {user && component.owner_username && (
                <Link
                  to={`/messages`}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-bg-secondary border border-border-color text-text-secondary font-medium text-sm hover:bg-bg-primary hover:text-text-primary transition-colors"
                >
                  <MessageSquare size={16} />
                  Message Owner
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Borrow Request Modal */}
      {showBorrowModal && (
        <BorrowRequestModal
          component={component}
          onClose={() => setShowBorrowModal(false)}
          onSuccess={handleBorrowSuccess}
        />
      )}
    </div>
  );
}
