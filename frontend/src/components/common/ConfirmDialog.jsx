import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  detail,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => !loading && onCancel?.()}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={title}
              className="w-full max-w-sm rounded-2xl bg-bg-card border border-border-color shadow-2xl p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-text-primary text-center mb-2">
                {title}
              </h3>
              <p className="text-sm text-text-muted text-center leading-relaxed">{message}</p>
              {detail && (
                <p className="text-xs text-text-muted text-center mt-2 mb-6">{detail}</p>
              )}
              {!detail && <div className="mb-6" />}
              <div className="flex gap-3">
                <button
                  onClick={() => !loading && onCancel?.()}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border-color text-sm font-medium text-text-secondary hover:bg-bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={() => !loading && onConfirm?.()}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      Deleting...
                    </span>
                  ) : (
                    confirmLabel
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
