import { useState } from "react";
import { Ban, ShieldCheck } from "lucide-react";
import api from "../../services/axios";
import ConfirmDialog from "./ConfirmDialog";

/**
 * Suspend / Unsuspend action used by the Admin and Moderator User Details
 * pages. The backend is the authority: it re-checks the requester's role,
 * moderator verification and university scope before changing the state.
 */
export default function SuspensionControl({
  user,
  onUpdated,
  className = "",
  disabled = false,
  disabledReason,
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!user?._id) return null;

  const suspended = !!user.isSuspended;
  const action = suspended ? "unsuspend" : "suspend";

  const handleConfirm = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await api.put(`/auth/users/${user._id}/${action}`);
      onUpdated?.(res.data.data.user);
      setOpen(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update the suspension status."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = () => {
    if (busy) return;
    setError("");
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled || busy}
        title={disabled ? disabledReason : undefined}
        className={
          className ||
          "inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border-color bg-bg-secondary text-text-primary text-sm font-semibold hover:bg-bg-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        }
      >
        {suspended ? <ShieldCheck size={15} /> : <Ban size={15} />}
        {suspended ? "Unsuspend User" : "Suspend User"}
      </button>

      <ConfirmDialog
        open={open}
        title={suspended ? "Unsuspend User?" : "Suspend User?"}
        message={
          suspended
            ? "This user will regain access to normal platform activities. Existing role, verification and university restrictions still apply."
            : "This user will be restricted from performing platform activities until their account is unsuspended."
        }
        detail={error || undefined}
        confirmLabel={suspended ? "Unsuspend User" : "Suspend User"}
        loading={busy}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
