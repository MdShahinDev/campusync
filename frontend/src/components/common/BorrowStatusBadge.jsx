import { Clock, CheckCircle, Package, RotateCcw, AlertTriangle } from "lucide-react";

function getStatusBadge(status, isOverdue = false) {
  if (isOverdue) {
    return {
      bg: "bg-red-500/10",
      text: "text-red-500",
      label: "Overdue",
      icon: <AlertTriangle size={12} />,
    };
  }
  switch (status) {
    case "pending":
      return {
        bg: "bg-yellow-500/10",
        text: "text-yellow-500",
        label: "Pending",
        icon: <Clock size={12} />,
      };
    case "approved":
      return {
        bg: "bg-blue-500/10",
        text: "text-blue-500",
        label: "Approved",
        icon: <CheckCircle size={12} />,
      };
    case "borrowed":
      return {
        bg: "bg-accent-orange/10",
        text: "text-accent-orange",
        label: "Borrowed",
        icon: <Package size={12} />,
      };
    case "return_requested":
      return {
        bg: "bg-purple-500/10",
        text: "text-purple-500",
        label: "Return Requested",
        icon: <RotateCcw size={12} />,
      };
    case "returned":
      return {
        bg: "bg-green-500/10",
        text: "text-green-500",
        label: "Returned",
        icon: <CheckCircle size={12} />,
      };
    case "rejected":
      return {
        bg: "bg-red-500/10",
        text: "text-red-500",
        label: "Rejected",
        icon: <AlertTriangle size={12} />,
      };
    case "cancelled":
      return {
        bg: "bg-gray-500/10",
        text: "text-gray-500",
        label: "Cancelled",
        icon: <AlertTriangle size={12} />,
      };
    default:
      return {
        bg: "bg-gray-500/10",
        text: "text-gray-500",
        label: status ? String(status) : "Unknown",
        icon: null,
      };
  }
}

export default function BorrowStatusBadge({ status, isOverdue = false, className = "" }) {
  const badge = getStatusBadge(status, isOverdue);
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${badge.bg} ${badge.text} ${className}`}
    >
      {badge.icon}
      {badge.label}
    </span>
  );
}
