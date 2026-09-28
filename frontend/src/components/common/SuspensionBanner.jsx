import { AlertTriangle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { SUSPENDED_MESSAGE } from "../../services/suspension";

/**
 * Persistent dashboard warning shown to a suspended account. The backend is
 * the authority (protected writes return 403 with the same message); this
 * banner only makes the state visible on every dashboard page.
 */
export default function SuspensionBanner() {
  const { user } = useAuth();

  if (!user?.isSuspended) return null;

  return (
    <div
      role="alert"
      className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400"
    >
      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold">
          ⚠️ {SUSPENDED_MESSAGE}
        </p>
        <p className="text-xs mt-1 leading-relaxed opacity-90">
          Creating, uploading, borrowing, posting, replying and messaging are
          disabled until an administrator restores your account. Your data is
          kept intact.
        </p>
      </div>
    </div>
  );
}
