import { useState, useEffect, useCallback } from "react";
import api from "../../services/axios";
import { mergeStatusFromResponse } from "./detailsUtils";

export function useBorrowRequest(requestId, context) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  const fetchRequest = useCallback(
    async (silent = false) => {
      if (silent !== true) {
        setLoading(true);
        setError("");
      }
      try {
        const params = context ? { context } : undefined;
        const res = await api.get(`/borrowing/${requestId}`, { params });
        const data = res.data?.data?.request;
        if (!data) {
          if (silent !== true) setError("Borrow request not found");
          return;
        }
        setRequest(data);
        if (silent !== true) setError("");
      } catch (err) {
        if (silent !== true) {
          if (err.response?.status === 404) {
            setError("Borrow request not found");
          } else if (err.response?.status === 403) {
            setError(err.response?.data?.message || "You are not authorized to view this request");
          } else if (err.response?.status === 401) {
            setError("Please log in to view this request");
          } else {
            setError("Failed to load borrow request details");
          }
        }
      } finally {
        if (silent !== true) setLoading(false);
      }
    },
    [requestId, context]
  );

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  const handleAction = async (action, successMessage) => {
    if (actionLoading || !request?._id) return;
    setActionLoading(action);
    setActionError("");
    setActionSuccess("");
    try {
      const res = await api.put(`/borrowing/${request._id}/${action}`);
      const updated = res.data?.data?.request;
      if (updated) {
        setRequest((prev) => mergeStatusFromResponse(prev, updated));
      }
      setActionSuccess(res.data?.message || successMessage);
      fetchRequest(true);
    } catch (err) {
      setActionError(
        err.response?.data?.message || "The action failed. Please try again."
      );
    } finally {
      setActionLoading(null);
    }
  };

  return {
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
  };
}
