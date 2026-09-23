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
  Clock,
  CheckCircle,
  AlertTriangle,
  GraduationCap,
} from "lucide-react";
import api from "../services/axios";
import { useAuth } from "../context/AuthContext";
import BorrowRequestModal from "../components/common/BorrowRequestModal";

function getConditionColor(condition) {
  switch (condition) {
    case "New":
      return "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20";
    case "Excellent":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
    case "Good":
      return "bg-accent-orange/10 text-accent-orange border border-accent-orange/20";
    case "Fair":
      return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20";
    case "Poor":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border border-gray-500/20";
  }
}

function getRequestStateLabel(status) {
  switch (status) {
    case "pending":
      return { label: "Requested", icon: <Clock size={15} />, color: "text-yellow-500 bg-yellow-500/10 border border-yellow-500/20" };
    case "approved":
      return { label: "Approved", icon: <CheckCircle size={15} />, color: "text-blue-500 bg-blue-500/10 border border-blue-500/20" };
    case "borrowed":
      return { label: "Borrowed", icon: <Package size={15} />, color: "text-accent-orange bg-accent-orange/10 border border-accent-orange/20" };
    case "return_requested":
      return { label: "Return Requested", icon: <Package size={15} />, color: "text-purple-500 bg-purple-500/10 border border-purple-500/20" };
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

  const isDifferentUniversity =
    user &&
    component &&
    !isOwner &&
    user.university &&
    component.university &&
    user.university !== component.university._id;

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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-accent-orange" />
          <p className="text-xs text-text-muted">Loading component details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <p className="text-sm font-semibold text-text-primary mb-1">{error}</p>
          <p className="text-xs text-text-muted mb-4">The component you're looking for might have been removed or is unavailable.</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-bg-secondary border border-border-color text-xs font-medium text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            <ArrowLeft size={14} />
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!component) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-accent-orange transition-colors"
        >
          <ArrowLeft size={15} />
          Back to components
        </button>

        {requestState && (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${requestState.color}`}>
            {requestState.icon}
            {requestState.label}
          </span>
        )}
      </div>

      {/* Success Alert */}
      {borrowSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-center gap-3 p-3.5 rounded-xl bg-green-500/10 border border-green-500/20"
        >
          <CheckCircle size={18} className="text-green-500 shrink-0" />
          <p className="text-xs font-medium text-green-600 dark:text-green-400">
            Borrow request sent successfully! The owner will review your request.
          </p>
        </motion.div>
      )}

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-border-color bg-bg-card overflow-hidden"
      >
        {/* Content */}
        <div className="p-5 sm:p-6">
          {/* Header Row: Image + Info */}
          <div className="flex gap-4 sm:gap-5 mb-5">
            {/* Compact Image */}
            <div className="shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-xl bg-bg-secondary overflow-hidden border border-border-color/50">
              {component.image_url ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}/components/${component._id}/image`}
                  alt={component.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-1">
                  <Package size={28} className="text-text-muted/30" />
                  <p className="text-[9px] text-text-muted/40">No image</p>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-1.5 leading-tight">
                    {component.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-bg-secondary text-[11px] font-medium text-text-secondary">
                      {component.category}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${getConditionColor(component.condition)}`}>
                      {component.condition}
                    </span>
                    {component.is_active === false && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-500/10 text-[11px] font-medium text-red-500 border border-red-500/20">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Availability */}
                <div className="shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-bg-secondary border border-border-color/50">
                  <span className={`w-2 h-2 rounded-full ${
                    component.available_quantity > 0 ? "bg-green-500" : "bg-red-500"
                  }`} />
                  <div>
                    <div className="flex items-baseline gap-0.5">
                      <span className={`text-lg font-bold ${
                        component.available_quantity > 0 ? "text-green-500" : "text-red-500"
                      }`}>
                        {component.available_quantity}
                      </span>
                      <span className="text-xs text-text-muted font-medium">
                        / {component.quantity}
                      </span>
                    </div>
                    <p className="text-[9px] text-text-muted leading-none">
                      {component.available_quantity > 0 ? "available" : "unavailable"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {component.description && (
            <div className="mb-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Description</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                {component.description}
              </p>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            {/* Owner */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary border border-border-color/50">
              <div className="w-8 h-8 rounded-lg bg-accent-orange/10 flex items-center justify-center shrink-0">
                <User size={15} className="text-accent-orange" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Owner</p>
                <Link
                  to={`/user/${component.owner_username || ""}`}
                  className="text-sm font-medium text-accent-orange hover:underline truncate block"
                >
                  {component.owner_name}
                </Link>
              </div>
            </div>

            {/* University */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary border border-border-color/50">
              <div className="w-8 h-8 rounded-lg bg-accent-orange/10 flex items-center justify-center shrink-0">
                <GraduationCap size={15} className="text-accent-orange" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">University</p>
                <p className="text-sm font-medium text-text-primary truncate">
                  {component.university?.name || "Not specified"}
                </p>
              </div>
            </div>

            {/* Location */}
            {component.location && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary border border-border-color/50">
                <div className="w-8 h-8 rounded-lg bg-accent-orange/10 flex items-center justify-center shrink-0">
                  <MapPin size={15} className="text-accent-orange" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Location</p>
                  <p className="text-sm font-medium text-text-primary truncate">
                    {component.location}
                  </p>
                </div>
              </div>
            )}

            {/* Buying Date */}
            {component.buyingDate && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary border border-border-color/50">
                <div className="w-8 h-8 rounded-lg bg-accent-orange/10 flex items-center justify-center shrink-0">
                  <Calendar size={15} className="text-accent-orange" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Buying Date</p>
                  <p className="text-sm font-medium text-text-primary">
                    {new Date(component.buyingDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Listed Date */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary border border-border-color/50">
              <div className="w-8 h-8 rounded-lg bg-accent-orange/10 flex items-center justify-center shrink-0">
                <Calendar size={15} className="text-accent-orange" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Listed</p>
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

          {/* Action Area */}
          <div className="pt-4 border-t border-border-color">
            {isDifferentUniversity && canBorrow && (
              <div className="mb-3 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium">
                <GraduationCap size={15} className="shrink-0" />
                You're not from the same university as the owner. Please contact the owner before borrowing.
              </div>
            )}

            {canBorrow && (
              <button
                onClick={() => setShowBorrowModal(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white text-sm font-bold shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                <Package size={15} />
                Request to Borrow
              </button>
            )}

            {user && !isOwner && !isVerified && !activeRequest && (
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs font-medium">
                <AlertTriangle size={15} />
                Account verification required to borrow
              </div>
            )}

            {requestState && !canBorrow && (
              <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium ${requestState.color}`}>
                {requestState.icon}
                {requestState.label}
              </div>
            )}

            {isOwner && (
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-muted text-xs font-medium">
                <Package size={15} />
                This is your component
              </div>
            )}

            {!user && (
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white text-sm font-bold shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Login to Borrow
              </Link>
            )}
          </div>
        </div>
      </motion.div>

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
