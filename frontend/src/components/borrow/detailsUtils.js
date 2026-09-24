export function getConditionColor(condition) {
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
      return "bg-red-500/10 text-red-500 border border-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border border-gray-500/20";
  }
}

export function formatDate(dateString) {
  if (!dateString) return "Not available";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Not available";
  }
}

export function orFallback(value) {
  if (value === null || value === undefined || value === "") return "Not available";
  return value;
}

export function mergeStatusFromResponse(prev, updated) {
  if (!prev || !updated) return prev;
  const status = updated.status ?? prev.status;
  const expectedReturn = updated.expected_return_date ?? prev.expected_return_date;
  const isOverdue =
    ["borrowed", "return_requested"].includes(status) &&
    expectedReturn &&
    new Date(expectedReturn) < new Date();
  return {
    ...prev,
    status,
    approved_date: updated.approved_date ?? prev.approved_date,
    borrowed_date: updated.borrowed_date ?? prev.borrowed_date,
    returned_date: updated.returned_date ?? prev.returned_date,
    expected_return_date: expectedReturn,
    is_overdue: Boolean(isOverdue),
  };
}
