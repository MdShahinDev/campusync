import { useParams, Link } from "react-router-dom";
import {
  User,
  GraduationCap,
  Building2,
  Clock,
  Calendar,
  FileText,
  Info,
  X,
  Send,
  RotateCcw,
  AlertTriangle,
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

export default function MyBorrowingDetails() {
  const { borrowId } = useParams();
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
  } = useBorrowRequest(borrowId, "borrower");

  const component =
    request?.component_id && typeof request.component_id === "object"
      ? request.component_id
      : null;
  const owner =
    request?.owner_id && typeof request.owner_id === "object" ? request.owner_id : null;

  const borrowerId =
    request?.borrower_id?._id || request?.borrower_id || null;
  const isBorrower = Boolean(
    user && borrowerId && String(user._id) === String(borrowerId)
  );
  const isAdmin = user?.role === "admin";

  const ownerName =
    owner?.name || request?.owner_name || component?.owner_name || "Unknown Owner";
  const ownerUsername =
    owner?.username || request?.owner_username || component?.owner_username || "";
  const ownerUniversity = owner?.university?.name || "";
  const ownerDepartment = owner?.department || "";

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
    return <LoadingState label="Loading your borrow request..." />;
  }

  if (error || !request) {
    return (
      <ErrorState
        error={error}
        backTo="/student/my-borrowing"
        backLabel="Back to My Borrowing"
        onRetry={() => fetchRequest()}
      />
    );
  }

  if (!isBorrower && !isAdmin) {
    return (
      <ErrorState
        error="This is not your borrowing request"
        backTo="/student/my-borrowing"
        backLabel="Back to My Borrowing"
      />
    );
  }

  const status = request.status;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <TopBar
        backTo="/student/my-borrowing"
        backLabel="Back to My Borrowing"
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

      {/* Owner Information — the other party (component owner) */}
      <SectionCard
        icon={User}
        title="Owner Information"
        subtitle="Owner of the component you requested"
        delay={0.05}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <InfoField icon={User} label="Owner Name" value={ownerName} />
          <InfoField
            icon={GraduationCap}
            label="Owner University"
            value={ownerUniversity}
          />
          <InfoField icon={Building2} label="Owner Department" value={ownerDepartment} />
        </div>

        {ownerUsername && (
          <div className="mt-4">
            <Link
              to={`/user/${ownerUsername}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-orange hover:underline"
            >
              <User size={13} />
              View owner profile
            </Link>
          </div>
        )}
      </SectionCard>

      {/* My Borrow Request information */}
      <SectionCard
        icon={FileText}
        title="My Borrow Request"
        subtitle="Your borrowing request details"
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
          <InfoField
            icon={FileText}
            label="Requested Quantity"
            value={request.quantity}
          />
          <InfoField icon={FileText} label="Purpose" value={request.purpose} multiline />
          <InfoField
            icon={Info}
            label="Additional Information"
            value={request.notes}
            multiline
          />
        </div>
      </SectionCard>

      {/* Borrower Actions */}
      <SectionCard
        icon={Send}
        title="Actions"
        subtitle="You created this request — manage it below."
        delay={0.1}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          {(status === "pending" || status === "approved") && (
            <button
              onClick={() => handleAction("cancel", "Request cancelled")}
              disabled={Boolean(actionLoading)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 text-red-500 text-sm font-semibold hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {actionLoading === "cancel" ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <X size={15} />
              )}
              Cancel Request
            </button>
          )}

          {status === "borrowed" && (
            <button
              onClick={() => handleAction("return-request", "Return request sent to owner")}
              disabled={Boolean(actionLoading)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-orange/10 text-accent-orange text-sm font-semibold hover:bg-accent-orange/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {actionLoading === "return-request" ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
              Return to Owner
            </button>
          )}

          {status === "return_requested" && (
            <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 text-purple-500 text-xs font-medium">
              <RotateCcw size={14} />
              Return requested — waiting for owner to generate return QR
            </span>
          )}

          {status === "approved" && (
            <span className="text-xs text-text-muted italic">
              Waiting for the owner to hand over the component
            </span>
          )}

          {status === "pending" && (
            <span className="text-xs text-text-muted italic">
              Waiting for the owner to review your request
            </span>
          )}

          {["returned", "rejected", "cancelled"].includes(status) && (
            <span className="inline-flex items-center gap-2 text-xs text-text-muted">
              <AlertTriangle size={14} />
              This request is {status} — no further actions are available.
            </span>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
