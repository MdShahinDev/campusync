import { useParams, Link } from "react-router-dom";
import {
  User,
  GraduationCap,
  Phone,
  Mail,
  Building2,
  Clock,
  Calendar,
  FileText,
  Info,
  Check,
  X,
  Handshake,
  CheckCircle,
  AlertTriangle,
  Bell,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useBorrowRequest } from "../components/borrow/useBorrowRequest";
import { formatDate } from "../components/borrow/detailsUtils";
import {
  ComponentDetailsCard,
  SectionCard,
  InfoField,
  StatusField,
  LoadingState,
  ErrorState,
  ActionFeedback,
  TopBar,
} from "../components/borrow/detailsShared";

export default function ReceivedRequestDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const {
    request,
    loading,
    error,
    actionLoading,
    actionError,
    actionSuccess,
    imageFailed,
    setImageFailed,
    fetchRequest,
    handleAction,
  } = useBorrowRequest(id, "owner");

  const component =
    request?.component_id && typeof request.component_id === "object"
      ? request.component_id
      : null;
  const borrower =
    request?.borrower_id && typeof request.borrower_id === "object"
      ? request.borrower_id
      : null;

  const ownerId = request?.owner_id?._id || request?.owner_id || null;
  const isOwner = Boolean(user && ownerId && String(user._id) === String(ownerId));
  const isAdmin = user?.role === "admin";

  const componentName = component?.name || request?.component_name || "Unknown Component";
  const componentCategory = component?.category || request?.component_category || "";
  const hasImage =
    (component?.image_url && component?._id) ||
    Boolean(request?.component_image && request?.component_id);
  const imageSrc =
    component?.image_url && component?._id
      ? `${import.meta.env.VITE_API_URL}/components/${component._id}/image`
      : request?.component_id
      ? `${import.meta.env.VITE_API_URL}/components/${request.component_id}/image`
      : "";

  if (loading) {
    return <LoadingState label="Loading received request..." />;
  }

  if (error || !request) {
    return (
      <ErrorState
        error={error}
        backTo="/student/received-requests"
        backLabel="Back to Received Requests"
        onRetry={() => fetchRequest()}
      />
    );
  }

  if (!isOwner && !isAdmin) {
    return (
      <ErrorState
        error="You are not the owner of this component"
        backTo="/student/received-requests"
        backLabel="Back to Received Requests"
      />
    );
  }

  const status = request.status;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <TopBar
        backTo="/student/received-requests"
        backLabel="Back to Received Requests"
        quantity={request.quantity}
        status={status}
        isOverdue={request.is_overdue === true}
      />

      <ActionFeedback success={actionSuccess} error={actionError} />

      {/* Component Details */}
      <ComponentDetailsCard
        component={component}
        request={request}
        componentName={componentName}
        componentCategory={componentCategory}
        hasImage={hasImage}
        imageSrc={imageSrc}
        imageFailed={imageFailed}
        onImageError={() => setImageFailed(true)}
      />

      {/* Requester Information — the other party (borrower) */}
      <SectionCard
        icon={User}
        title="Requester Information"
        subtitle="Student who wants to borrow your component"
        delay={0.05}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <InfoField
            icon={User}
            label="Name"
            value={borrower?.name || request.borrower_name}
          />
          <InfoField
            icon={GraduationCap}
            label="University"
            value={borrower?.university?.name}
          />
          <InfoField icon={Phone} label="Phone Number" value={borrower?.phone} />
          <InfoField icon={Mail} label="Email" value={borrower?.email} />
          <InfoField icon={Building2} label="Department" value={borrower?.department} />
          <InfoField
            icon={FileText}
            label="Requested Quantity"
            value={request.quantity}
          />
        </div>

        {borrower?.username && (
          <div className="mt-4">
            <Link
              to={`/user/${borrower.username}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-orange hover:underline"
            >
              <User size={13} />
              View requester profile
            </Link>
          </div>
        )}
      </SectionCard>

      {/* Borrow Request Information */}
      <SectionCard
        icon={FileText}
        title="Borrow Request Information"
        subtitle="Details of the incoming borrow request"
        delay={0.08}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <InfoField
            icon={Clock}
            label="Request Date"
            value={formatDate(request.request_date || request.createdAt)}
          />
          <InfoField
            icon={Calendar}
            label="Expected Return Date"
            value={formatDate(request.expected_return_date)}
          />
          <StatusField status={status} isOverdue={request.is_overdue === true} />
          <InfoField icon={FileText} label="Purpose" value={request.purpose} multiline />
          <InfoField
            icon={Info}
            label="Additional Information"
            value={request.notes}
            multiline
          />
        </div>
      </SectionCard>

      {/* Owner Actions */}
      <SectionCard
        icon={CheckCircle}
        title="Actions"
        subtitle="You own this component — manage the borrow request below."
        delay={0.1}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          {status === "pending" && (
            <>
              <button
                onClick={() => handleAction("approve", "Request approved")}
                disabled={Boolean(actionLoading)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500/10 text-green-500 text-sm font-semibold hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading === "approve" ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Check size={15} />
                )}
                Approve
              </button>
              <button
                onClick={() => handleAction("reject", "Request rejected")}
                disabled={Boolean(actionLoading)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 text-red-500 text-sm font-semibold hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading === "reject" ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <X size={15} />
                )}
                Reject
              </button>
              <button
                disabled
                title="Coming soon"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-muted text-sm font-semibold disabled:cursor-not-allowed opacity-70"
              >
                <Bell size={15} />
                Notify
              </button>
            </>
          )}

          {status === "approved" && (
            <>
              <button
                onClick={() => handleAction("borrowed", "Component marked as borrowed")}
                disabled={Boolean(actionLoading)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white text-sm font-bold shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {actionLoading === "borrowed" ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Handshake size={15} />
                )}
                Mark as Handover
              </button>
              <button
                onClick={() => handleAction("reject", "Request rejected")}
                disabled={Boolean(actionLoading)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 text-red-500 text-sm font-semibold hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading === "reject" ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <X size={15} />
                )}
                Reject
              </button>
              <button
                disabled
                title="Coming soon"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-muted text-sm font-semibold disabled:cursor-not-allowed opacity-70"
              >
                <Bell size={15} />
                Notify
              </button>
            </>
          )}

          {status === "return_requested" && (
            <button
              onClick={() => handleAction("confirm-return", "Return confirmed")}
              disabled={Boolean(actionLoading)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500/10 text-green-500 text-sm font-semibold hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {actionLoading === "confirm-return" ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <CheckCircle size={15} />
              )}
              Confirm Return
            </button>
          )}

          {status === "borrowed" && (
            <span className="text-xs text-text-muted italic">
              Waiting for the borrower to request a return
            </span>
          )}

          {["returned", "rejected", "cancelled"].includes(status) && (
            <span className="inline-flex items-center gap-2 text-xs text-text-muted">
              <AlertTriangle size={14} />
              This request is {status} — no further actions are available.
            </span>
          )}

          {["pending", "approved"].includes(status) === false &&
            ["return_requested", "borrowed", "returned", "rejected", "cancelled"].includes(
              status
            ) === false && (
              <span className="text-xs text-text-muted">
                No actions available for this status.
              </span>
            )}
        </div>
      </SectionCard>
    </div>
  );
}
