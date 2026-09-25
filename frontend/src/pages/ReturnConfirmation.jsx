import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Loader2,
  AlertCircle,
  Clock,
  QrCode,
  ArrowLeft,
} from "lucide-react";
import api from "../services/axios";

const STATUS_STYLES = {
  success: {
    icon: CheckCircle,
    iconClass: "text-green-500",
    ring: "bg-green-500/10",
    title: "Return Successful",
  },
  invalid: {
    icon: AlertCircle,
    iconClass: "text-red-500",
    ring: "bg-red-500/10",
    title: "Invalid QR Code",
  },
  expired: {
    icon: Clock,
    iconClass: "text-amber-500",
    ring: "bg-amber-500/10",
    title: "QR Code Expired",
  },
  used: {
    icon: AlertCircle,
    iconClass: "text-amber-500",
    ring: "bg-amber-500/10",
    title: "QR Already Used",
  },
  failed: {
    icon: AlertCircle,
    iconClass: "text-red-500",
    ring: "bg-red-500/10",
    title: "Confirmation Failed",
  },
};

export default function ReturnConfirmation() {
  const { token } = useParams();
  const [phase, setPhase] = useState("loading");
  const [code, setCode] = useState("failed");
  const [message, setMessage] = useState("");
  const [detail, setDetail] = useState(null);
  // Single-flight confirmation. The request is issued once per token and the
  // very same promise is shared by every effect run, so a StrictMode double
  // invoke (or any re-run) can never drop the response: the second run attaches
  // to the in-flight request instead of starting a second one, and its result
  // still reaches setState. This keeps the page from getting stuck on the
  // loading screen after the return has already succeeded server-side.
  const inflightRef = useRef({ token: null, promise: null });

  useEffect(() => {
    let active = true;

    if (inflightRef.current.token !== token || !inflightRef.current.promise) {
      inflightRef.current = {
        token,
        promise: api
          .post("/borrowing/return/confirm", { token })
          .then((res) => ({ ok: true, res }))
          .catch((err) => ({ ok: false, err })),
      };
    }

    inflightRef.current.promise.then((outcome) => {
      if (!active) return;

      if (outcome.ok) {
        const data = outcome.res.data?.data;
        setDetail(data || null);
        setMessage(
          outcome.res.data?.message || "Return confirmed successfully"
        );
        setCode("success");
        setPhase("done");
        return;
      }

      const errCode = outcome.err.response?.data?.code;
      const mapped =
        errCode === "invalid"
          ? "invalid"
          : errCode === "expired"
          ? "expired"
          : errCode === "used"
          ? "used"
          : "failed";
      setCode(mapped);
      setMessage(
        outcome.err.response?.data?.message ||
          "This return QR could not be confirmed. Please ask the owner for a new code."
      );
      setPhase("done");
    });

    return () => {
      active = false;
    };
  }, [token]);

  const style = STATUS_STYLES[code] || STATUS_STYLES.failed;
  const StatusIcon = style.icon;

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 size={36} className="animate-spin text-accent-orange" />
          <p className="text-sm text-text-muted">Confirming return...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md rounded-2xl border border-border-color bg-bg-card p-8 text-center shadow-xl"
      >
        <div
          className={`mx-auto w-16 h-16 rounded-2xl ${style.ring} flex items-center justify-center mb-5`}
        >
          <StatusIcon size={32} className={style.iconClass} />
        </div>

        <h1 className="text-xl font-bold text-text-primary mb-2">{style.title}</h1>
        <p className="text-sm text-text-muted leading-relaxed mb-6">{message}</p>

        {detail?.component_name && (
          <div className="mb-6 p-4 rounded-xl bg-bg-secondary border border-border-color/50 text-left">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">
              Component
            </p>
            <p className="text-sm font-medium text-text-primary">
              {detail.component_name}
              {detail.quantity ? ` ×${detail.quantity}` : ""}
            </p>
            {detail.returned_date && (
              <p className="text-xs text-text-muted mt-1">
                Returned: {new Date(detail.returned_date).toLocaleString()}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
          <QrCode size={14} className="text-accent-orange" />
          CampusSync Return Confirmation
        </div>

        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-accent-orange hover:underline"
        >
          <ArrowLeft size={13} />
          Back to home
        </Link>
      </motion.div>
    </div>
  );
}
