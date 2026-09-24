import { useState, useEffect } from "react";
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
  Handshake,
  RotateCcw,
} from "lucide-react";
import api from "../services/axios";
import { formatDate } from "../components/borrow/detailsUtils";
import {
  ComponentDetailsCard,
  SectionCard,
  InfoField,
  StatusField,
  LoadingState,
  ErrorState,
  TopBar,
} from "../components/borrow/detailsShared";

const dateOrDash = (value) => (value ? formatDate(value) : "—");

const describeError = (err) => {
  if (err?.response?.status === 404) return "Borrow request not found";
  if (err?.response?.status === 403) {
    return (
      err.response?.data?.message || "You are not authorized to view this record"
    );
  }
  if (err?.response?.status === 401) return "Please log in to view this record";
  if (err?.response?.status === 400) {
    return err.response?.data?.message || "Borrow request not found";
  }
  return "Failed to load borrow request details";
};

export default function BorrowHistoryDetails({
  basePath = "/admin/borrow-history",
}) {
  const { borrowId } = useParams();
  const [request, setRequest] = useState(null);
  const [loadedId, setLoadedId] = useState(null);
  const [error, setError] = useState("");
  const [retryTick, setRetryTick] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  // Derived loading state: true until this specific borrow id has been loaded,
  // so direct URLs, refresh, back navigation and retries never render a blank
  // page while the request is in flight.
  const loading = !error && loadedId !== borrowId;

  useEffect(() => {
    let cancelled = false;

    api
      .get(`/borrowing/history/${borrowId}`)
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data?.request;
        if (!data) {
          setRequest(null);
          setError("Borrow request not found");
          return;
        }
        setRequest(data);
        setLoadedId(borrowId);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setRequest(null);
        setError(describeError(err));
      });

    return () => {
      cancelled = true;
    };
  }, [borrowId, retryTick]);

  const handleRetry = () => {
    setError("");
    setRetryTick((tick) => tick + 1);
  };

  const component =
    request?.component_id && typeof request.component_id === "object"
      ? request.component_id
      : null;
  const borrower =
    request?.borrower_id && typeof request.borrower_id === "object"
      ? request.borrower_id
      : null;
  const owner =
    request?.owner_id && typeof request.owner_id === "object"
      ? request.owner_id
      : null;

  const componentName =
    component?.name || request?.component_name || "Unknown Component";
  const componentCategory =
    component?.category || request?.component_category || "";
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
    return <LoadingState label="Loading borrow record..." />;
  }

  if (error || !request) {
    return (
      <ErrorState
        error={error || "Borrow request not found"}
        backTo={basePath}
        backLabel="Back to Borrow History"
        onRetry={handleRetry}
      />
    );
  }

  const status = request.status;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <TopBar
        backTo={basePath}
        backLabel="Back to Borrow History"
        quantity={request.quantity}
        status={status}
        isOverdue={request.is_overdue === true}
      />

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

      {/* Requester Information */}
      <SectionCard
        icon={User}
        title="Requester Information"
        subtitle="Student who requested this borrow"
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
          <InfoField icon={Phone} label="Phone No" value={borrower?.phone} />
          <InfoField icon={Mail} label="Email" value={borrower?.email} />
          <InfoField
            icon={Building2}
            label="Department"
            value={borrower?.department}
          />
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

      {/* Owner Information */}
      <SectionCard
        icon={User}
        title="Owner Information"
        subtitle="Owner of the borrowed component"
        delay={0.08}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <InfoField
            icon={User}
            label="Name"
            value={owner?.name || request.owner_name}
          />
          <InfoField
            icon={GraduationCap}
            label="University"
            value={owner?.university?.name}
          />
          <InfoField icon={Phone} label="Phone No" value={owner?.phone} />
          <InfoField icon={Mail} label="Email" value={owner?.email} />
          <InfoField
            icon={Building2}
            label="Department"
            value={owner?.department}
          />
        </div>

        {owner?.username && (
          <div className="mt-4">
            <Link
              to={`/user/${owner.username}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-orange hover:underline"
            >
              <User size={13} />
              View owner profile
            </Link>
          </div>
        )}
      </SectionCard>

      {/* Borrow History */}
      <SectionCard
        icon={FileText}
        title="Borrow History"
        subtitle="Full lifecycle of this borrow request"
        delay={0.11}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <InfoField
            icon={Clock}
            label="Requested Date"
            value={dateOrDash(request.request_date || request.createdAt)}
          />
          <InfoField
            icon={Calendar}
            label="Expected Return Date"
            value={dateOrDash(request.expected_return_date)}
          />
          <InfoField
            icon={FileText}
            label="Purpose"
            value={request.purpose}
            multiline
          />
          <InfoField
            icon={Info}
            label="Additional Information"
            value={request.notes}
            multiline
          />
          <InfoField
            icon={Handshake}
            label="Handover Date"
            value={dateOrDash(request.borrowed_date)}
          />
          <InfoField
            icon={RotateCcw}
            label="Return Date"
            value={dateOrDash(request.returned_date)}
          />
          <StatusField status={status} isOverdue={request.is_overdue === true} />
        </div>
      </SectionCard>
    </div>
  );
}
