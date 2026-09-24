import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  Loader2,
  AlertCircle,
  Calendar,
  Flag,
  Info,
  Inbox,
  Package,
  User,
  UserCheck,
  UserX,
  Mail,
} from "lucide-react";
import api from "../services/axios";
import { useAuth } from "../context/AuthContext";
import {
  NOTIFICATIONS_PATH,
  dashboardPathFor,
  notificationTypeMeta,
  formatNotificationDate,
} from "../services/notifications";
import BorrowStatusBadge from "../components/common/BorrowStatusBadge";
import { SectionCard, InfoField } from "../components/borrow/detailsShared";
import { formatDate } from "../components/borrow/detailsUtils";

/**
 * Fetch the entity a notification points at, using the existing APIs.
 * Never rejects: it always resolves with a state so the page can render the
 * stored notification even when the related record is gone or forbidden.
 */
function fetchRelatedEntity(notification) {
  const { relatedEntityType, relatedEntityId } = notification;

  if (!relatedEntityType || !relatedEntityId) {
    return Promise.resolve({ state: "none", data: null });
  }

  let request;

  if (relatedEntityType === "BORROW") {
    request = api
      .get(`/borrowing/${relatedEntityId}`)
      .then((res) => ({ state: "ready", data: res.data?.data?.request || null }));
  } else if (relatedEntityType === "REPORT") {
    request = api
      .get(`/reports/${relatedEntityId}`)
      .then((res) => ({ state: "ready", data: res.data?.data?.report || null }));
  } else if (relatedEntityType === "USER") {
    // A user can always load their own profile; anything else needs the
    // admin/moderator user API (the backend enforces the rest).
    const isSelf =
      notification.recipient &&
      relatedEntityId &&
      String(relatedEntityId) === String(notification.recipient);
    request = api
      .get(isSelf ? "/auth/me" : `/auth/users/${relatedEntityId}`)
      .then((res) => ({ state: "ready", data: res.data?.data?.user || null }));
  } else {
    return Promise.resolve({ state: "none", data: null });
  }

  return request.catch((err) => {
    const status = err.response?.status;
    if (status === 404) return { state: "missing", data: null };
    if (status === 403) return { state: "denied", data: null };
    return { state: "error", data: null };
  });
}

function describeError(error) {
  const status = error?.response?.status;
  if (status === 404) return "Notification not found";
  if (status === 403) return "You are not authorized to view this notification";
  if (status === 401) return "Please log in to view this notification";
  return error?.response?.data?.message || "Failed to load this notification";
}

const RELATED_MESSAGE = {
  missing: "The related record no longer exists.",
  denied: "You do not have permission to view the related record.",
  error: "The related record could not be loaded right now.",
};

function RelatedNotice({ state, onRetry }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-bg-secondary border border-border-color">
      <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
        <AlertCircle size={16} className="text-yellow-500" />
      </div>
      <p className="text-sm text-text-muted flex-1">
        {RELATED_MESSAGE[state] || RELATED_MESSAGE.error}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-medium text-accent-orange hover:underline self-start sm:self-auto"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export default function NotificationDetail() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [notification, setNotification] = useState(null);
  const [loadedId, setLoadedId] = useState(null);
  const [error, setError] = useState("");
  const [retryTick, setRetryTick] = useState(0);
  const [related, setRelated] = useState(null);
  const [relatedState, setRelatedState] = useState("none");

  // Derived loading state — covers direct URLs, refresh and back navigation.
  const loading = !error && loadedId !== id;

  useEffect(() => {
    let cancelled = false;

    api
      .get(`/notifications/${id}`)
      .then((res) => {
        if (cancelled) return;

        const record = res.data?.data?.notification;
        if (!record) {
          setNotification(null);
          setError("Notification not found");
          return;
        }

        setNotification(record);
        setLoadedId(id);
        setError("");
        setRelated(null);
        setRelatedState("loading");

        // Opening a notification marks only this one as read.
        if (!record.isRead) {
          api
            .put(`/notifications/${id}/read`)
            .then((readRes) => {
              if (cancelled) return;
              const updated = readRes.data?.data?.notification;
              setNotification((prev) =>
                prev
                  ? {
                      ...prev,
                      isRead: updated ? updated.isRead : true,
                      readAt: updated ? updated.readAt : new Date().toISOString(),
                    }
                  : prev
              );
            })
            .catch(() => {
              // The list/dropdown keeps the unread state; nothing breaks.
            });
        }

        return fetchRelatedEntity(record)
          .then((result) => {
            if (cancelled) return;
            setRelated(result.data);
            setRelatedState(result.state);
          });
      })
      .catch((err) => {
        if (cancelled) return;
        setNotification(null);
        setRelated(null);
        setRelatedState("none");
        setError(describeError(err));
      });

    return () => {
      cancelled = true;
    };
  }, [id, retryTick]);

  const handleRetry = () => {
    setError("");
    setRetryTick((tick) => tick + 1);
  };

  const handleRelatedRetry = () => {
    if (!notification) return;
    setRelatedState("loading");
    setRelated(null);
    fetchRelatedEntity(notification).then((result) => {
      setRelated(result.data);
      setRelatedState(result.state);
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 size={30} className="animate-spin text-accent-orange" />
        <p className="text-xs text-text-muted">Loading notification…</p>
      </div>
    );
  }

  if (error || !notification) {
    const notFound = error === "Notification not found";
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={30} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          {notFound ? "Notification Not Found" : "Something went wrong"}
        </h1>
        <p className="text-text-muted mb-6">
          {error ||
            "This notification does not exist, was removed, or you do not have access to it."}
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {!notFound && (
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-sm font-medium text-text-primary hover:bg-bg-tertiary transition-colors"
            >
              Try again
            </button>
          )}
          <Link
            to={NOTIFICATIONS_PATH}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white font-bold text-sm shadow-lg"
          >
            <ArrowLeft size={16} />
            Back to Notifications
          </Link>
        </div>
      </div>
    );
  }

  const meta = notificationTypeMeta(notification);
  const Icon = meta.icon;
  const type = notification.type;
  const metadata = notification.metadata || {};
  const sender = notification.sender;
  const createdAt = formatNotificationDate(notification.createdAt);

  const isBorrow = type.startsWith("BORROW_");
  const isAccount = [
    "ACCOUNT_CREATED",
    "ACCOUNT_APPROVED",
    "ACCOUNT_REJECTED",
    "NEW_USER_REGISTERED",
    "UNIVERSITY_NEW_STUDENT_REGISTERED",
  ].includes(type);
  const isReport = ["USER_REPORTED", "UNIVERSITY_USER_REPORTED"].includes(type);

  const borrow = isBorrow && relatedState === "ready" ? related : null;
  const account = isAccount && relatedState === "ready" ? related : null;
  const report = isReport && relatedState === "ready" ? related : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      {/* Back */}
      <div className="flex items-center justify-between gap-3">
        <Link
          to={NOTIFICATIONS_PATH}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-accent-orange transition-colors"
        >
          <ArrowLeft size={15} />
          All notifications
        </Link>
        <span
          className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${meta.toneClasses.chip}`}
        >
          {meta.label}
        </span>
      </div>

      {/* Notification card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border-color bg-bg-card overflow-hidden"
      >
        <div className="px-5 sm:px-6 py-5 border-b border-border-color bg-bg-secondary/50">
          <div className="flex items-start gap-4">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${meta.toneClasses.icon}`}
            >
              <Icon size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-text-primary">
                  {notification.title}
                </h1>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${meta.toneClasses.chip}`}
                >
                  {notification.isRead ? "Read" : "Unread"}
                </span>
              </div>
              {createdAt && (
                <p className="text-xs text-text-muted mt-1">{createdAt}</p>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-6 py-5 space-y-5">
          {/* Sender */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-bg-secondary">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-orange to-accent-orange-hover flex items-center justify-center text-white font-bold text-sm shrink-0">
              {sender?.avatar ? (
                <img
                  src={sender.avatar}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                (sender?.name || "S").charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">
                {sender?.name || "CampusSync"}
              </p>
              <p className="text-xs text-text-muted truncate">
                {sender?.role
                  ? `${sender.role}${sender.username ? ` · @${sender.username}` : ""}`
                  : "System notification"}
              </p>
            </div>
          </div>

          {/* Message */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Message
            </p>
            <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
              {notification.message}
            </p>
          </div>

          {/* Related record states */}
          {relatedState === "loading" && (
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Loader2 size={14} className="animate-spin text-accent-orange" />
              Loading related details…
            </div>
          )}
          {["missing", "denied", "error"].includes(relatedState) && (
            <RelatedNotice state={relatedState} onRetry={handleRelatedRetry} />
          )}

          {/* ---------------- Borrow ---------------- */}
          {isBorrow && relatedState === "ready" && (
            <SectionCard
              icon={Package}
              title="Borrow Request"
              subtitle="Live data from the borrow request"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoField
                  icon={Package}
                  label="Component Name"
                  value={borrow?.component_name || metadata.componentName}
                />
                <InfoField
                  icon={Inbox}
                  label="Status"
                  value={
                    <span className="inline-block">
                      <BorrowStatusBadge
                        status={borrow?.status || metadata.status}
                        isOverdue={borrow?.is_overdue === true}
                      />
                    </span>
                  }
                />
                <InfoField
                  icon={User}
                  label="Borrower"
                  value={
                    borrow?.borrower_id?.name ||
                    borrow?.borrower_name ||
                    metadata.borrowerName
                  }
                />
                <InfoField
                  icon={User}
                  label="Owner"
                  value={
                    borrow?.owner_id?.name ||
                    borrow?.owner_name ||
                    metadata.ownerName
                  }
                />
                <InfoField
                  icon={Info}
                  label="Requested Quantity"
                  value={borrow?.quantity || metadata.quantity}
                />
                <InfoField
                  icon={Calendar}
                  label="Requested Date"
                  value={formatDate(borrow?.request_date)}
                />
                <InfoField
                  icon={Calendar}
                  label="Expected Return Date"
                  value={formatDate(borrow?.expected_return_date)}
                />
                <InfoField
                  icon={Calendar}
                  label="Return Date"
                  value={formatDate(borrow?.returned_date)}
                />
                <InfoField
                  icon={Flag}
                  label="Previous Status"
                  value={metadata.previousStatus}
                />
                <InfoField
                  icon={UserCheck}
                  label="Purpose"
                  value={borrow?.purpose}
                  multiline
                />
              </div>
            </SectionCard>
          )}

          {isBorrow && relatedState !== "ready" && (
            <SectionCard
              icon={Package}
              title="Borrow Request Snapshot"
              subtitle="Values stored with this notification"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoField
                  icon={Package}
                  label="Component Name"
                  value={metadata.componentName}
                />
                <InfoField
                  icon={Info}
                  label="Quantity"
                  value={metadata.quantity}
                />
                <InfoField icon={Info} label="Status" value={metadata.status} />
                <InfoField
                  icon={Info}
                  label="Previous Status"
                  value={metadata.previousStatus}
                />
                <InfoField
                  icon={User}
                  label="Borrower"
                  value={metadata.borrowerName}
                />
                <InfoField
                  icon={User}
                  label="Owner"
                  value={metadata.ownerName}
                />
              </div>
            </SectionCard>
          )}

          {/* ---------------- Account ---------------- */}
          {isAccount && relatedState === "ready" && (
            <SectionCard
              icon={type === "ACCOUNT_REJECTED" ? UserX : UserCheck}
              title={
                type === "ACCOUNT_REJECTED"
                  ? "Rejected Account"
                  : "Account Information"
              }
              subtitle="Live data from the user profile"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoField icon={User} label="Name" value={account?.name} />
                <InfoField icon={UserCheck} label="Role" value={account?.role} />
                <InfoField
                  icon={Mail}
                  label="Email"
                  value={account?.email}
                />
                <InfoField
                  icon={User}
                  label="Username"
                  value={account?.username}
                />
                <InfoField
                  icon={Flag}
                  label="University"
                  value={account?.university?.name || account?.university}
                />
                <InfoField
                  icon={Calendar}
                  label={
                    type === "ACCOUNT_REJECTED"
                      ? "Rejection Date"
                      : "Registration Date"
                  }
                  value={
                    type === "ACCOUNT_REJECTED"
                      ? metadata.rejectedAt || notification.createdAt
                      : account?.createdAt || notification.createdAt
                  }
                />
              </div>
              {type === "ACCOUNT_REJECTED" && (
                <div className="mt-3">
                  <InfoField
                    icon={AlertCircle}
                    label="Rejection Feedback"
                    value={metadata.feedback}
                    multiline
                  />
                </div>
              )}
            </SectionCard>
          )}

          {isAccount && relatedState !== "ready" && (
            <SectionCard
              icon={User}
              title="Account Snapshot"
              subtitle="Values stored with this notification"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoField icon={User} label="Name" value={metadata.name} />
                <InfoField icon={UserCheck} label="Role" value={metadata.role} />
                <InfoField
                  icon={Calendar}
                  label="Created"
                  value={metadata.createdAt || notification.createdAt}
                />
              </div>
              {type === "ACCOUNT_REJECTED" && (
                <div className="mt-3">
                  <InfoField
                    icon={AlertCircle}
                    label="Rejection Feedback"
                    value={metadata.feedback}
                    multiline
                  />
                </div>
              )}
            </SectionCard>
          )}

          {/* ---------------- Report ---------------- */}
          {isReport && (
            <SectionCard
              icon={Flag}
              title="Report Details"
              subtitle={
                relatedState === "ready"
                  ? "Live data from the report"
                  : "Values stored with this notification"
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoField
                  icon={User}
                  label="Reporter"
                  value={report?.reporterName || metadata.reporterName}
                />
                <InfoField
                  icon={UserX}
                  label="Reported User"
                  value={report?.reportedUserName || metadata.reportedUserName}
                />
                <InfoField
                  icon={Flag}
                  label="Reason"
                  value={report?.reason || metadata.reason}
                  multiline
                />
                <InfoField
                  icon={Info}
                  label="Status"
                  value={report?.status || metadata.status}
                />
                <InfoField
                  icon={Calendar}
                  label="Reported At"
                  value={report?.createdAt || notification.createdAt}
                />
                <InfoField
                  icon={Mail}
                  label="Details"
                  value={report?.details}
                  multiline
                />
              </div>
            </SectionCard>
          )}

          {/* Fallback footer note when there is no related record at all */}
          {relatedState === "none" && (
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Bell size={13} />
              <span>
                {type === "ACCOUNT_CREATED"
                  ? "Complete your profile to get approved faster."
                  : "No related record is attached to this notification."}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3">
        <Link
          to={NOTIFICATIONS_PATH}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-accent-orange transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Notifications
        </Link>
        <Link
          to={dashboardPathFor(currentUser?.role)}
          className="text-xs font-medium text-text-muted hover:text-accent-orange transition-colors"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
