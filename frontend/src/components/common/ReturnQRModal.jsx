import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertCircle, QrCode, RefreshCw, Copy, Check, Clock } from "lucide-react";
import QRCode from "qrcode";
import api from "../../services/axios";

export default function ReturnQRModal({ requestId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [scanUrl, setScanUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [copied, setCopied] = useState(false);
  const [generated, setGenerated] = useState(false);

  const buildUrl = (path) => `${window.location.origin}${path}`;

  const generate = useCallback(async () => {
    if (!requestId || loading) return;
    setLoading(true);
    setError("");
    setCopied(false);
    try {
      const res = await api.put(`/borrowing/${requestId}/generate-return-qr`);
      const { token, expires_at, path } = res.data?.data || {};
      if (!token || !path) {
        setError("Failed to generate return QR");
        return;
      }
      const url = buildUrl(path);
      const dataUrl = await QRCode.toDataURL(url, {
        width: 280,
        margin: 2,
        errorCorrectionLevel: "M",
        color: { dark: "#111827", light: "#ffffff" },
      });
      setScanUrl(url);
      setQrDataUrl(dataUrl);
      setExpiresAt(expires_at ? new Date(expires_at) : null);
      setGenerated(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to generate return QR. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [requestId, loading]);

  const handleCopy = async () => {
    if (!scanUrl) return;
    try {
      await navigator.clipboard.writeText(scanUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy link");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md rounded-2xl border border-border-color bg-bg-card p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-accent-orange/10 flex items-center justify-center">
                <QrCode size={18} className="text-accent-orange" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">Return QR Code</h3>
                <p className="text-[11px] text-text-muted">
                  Let the borrower scan to confirm the return
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-3 py-10">
              <Loader2 size={28} className="animate-spin text-accent-orange" />
              <p className="text-xs text-text-muted">Generating secure QR code...</p>
            </div>
          )}

          {!loading && qrDataUrl && generated && (
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-2xl bg-white shadow-lg">
                <img
                  src={qrDataUrl}
                  alt="Return confirmation QR code"
                  width={280}
                  height={280}
                  className="block"
                />
              </div>

              {expiresAt && (
                <div className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                  <Clock size={13} className="text-accent-orange" />
                  Expires {expiresAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" · "}single use
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                <button
                  onClick={handleCopy}
                  disabled={!scanUrl}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-bg-secondary border border-border-color text-text-muted text-xs font-semibold hover:text-text-primary transition-colors disabled:opacity-50"
                >
                  {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                  {copied ? "Copied" : "Copy link"}
                </button>
                <button
                  onClick={generate}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-orange/10 text-accent-orange text-xs font-semibold hover:bg-accent-orange/20 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                  Regenerate
                </button>
              </div>

              <p className="text-[10px] text-text-muted text-center leading-relaxed">
                Regenerating invalidates the previous QR. The scan link expires automatically
                and can only complete the return once.
              </p>
            </div>
          )}

          {!loading && !qrDataUrl && (
            <div className="flex flex-col items-center gap-3 py-8">
              <button
                onClick={generate}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white text-sm font-bold shadow-md shadow-orange-500/20 disabled:opacity-50"
              >
                <QrCode size={15} />
                Generate QR
              </button>
              <p className="text-[10px] text-text-muted text-center">
                Creates a single-use link that expires in 15 minutes
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
