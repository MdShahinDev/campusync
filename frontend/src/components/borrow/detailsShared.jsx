import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  Loader2,
  AlertCircle,
  MapPin,
  ArrowLeft,
  Calendar,
  CheckCircle,
} from "lucide-react";
import BorrowStatusBadge from "../common/BorrowStatusBadge";
import { getConditionColor, formatDate, orFallback } from "./detailsUtils";

export function InfoField({ icon: Icon, label, value, multiline = false }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-secondary border border-border-color/50">
      <div className="w-8 h-8 rounded-lg bg-accent-orange/10 flex items-center justify-center shrink-0">
        <Icon size={15} className="text-accent-orange" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          {label}
        </p>
        <p
          className={`text-sm font-medium text-text-primary ${multiline ? "whitespace-pre-wrap break-words" : "truncate"}`}
        >
          {orFallback(value)}
        </p>
      </div>
    </div>
  );
}

export function StatusField({ status, isOverdue }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-secondary border border-border-color/50">
      <div className="w-8 h-8 rounded-lg bg-accent-orange/10 flex items-center justify-center shrink-0">
        <CheckCircle size={15} className="text-accent-orange" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          Status
        </p>
        <div className="mt-1">
          <BorrowStatusBadge status={status} isOverdue={isOverdue} />
        </div>
      </div>
    </div>
  );
}

export function SectionCard({ icon: Icon, title, subtitle, delay = 0, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-2xl border border-border-color bg-bg-card overflow-hidden"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent-orange/10 flex items-center justify-center">
            <Icon size={16} className="text-accent-orange" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary">{title}</h2>
            {subtitle && <p className="text-[11px] text-text-muted">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
    </motion.div>
  );
}

export function LoadingState({ label = "Loading borrow request..." }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={28} className="animate-spin text-accent-orange" />
        <p className="text-xs text-text-muted">{label}</p>
      </div>
    </div>
  );
}

export function ErrorState({ error, backTo, backLabel, onRetry }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} className="text-red-500" />
        </div>
        <p className="text-sm font-semibold text-text-primary mb-1">
          {error || "Borrow request not found"}
        </p>
        <p className="text-xs text-text-muted mb-4">
          This request may have been removed, or you may not have permission to view it.
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-bg-secondary border border-border-color text-xs font-medium text-text-primary hover:bg-bg-tertiary transition-colors"
            >
              Try again
            </button>
          )}
          <Link
            to={backTo}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-orange/10 border border-accent-orange/20 text-xs font-medium text-accent-orange hover:bg-accent-orange/20 transition-colors"
          >
            <ArrowLeft size={14} />
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ActionFeedback({ success, error }) {
  return (
    <>
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-green-500/10 border border-green-500/20"
        >
          <CheckCircle size={18} className="text-green-500 shrink-0" />
          <p className="text-xs font-medium text-green-600 dark:text-green-400">{success}</p>
        </motion.div>
      )}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20"
        >
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <p className="text-xs font-medium text-red-500">{error}</p>
        </motion.div>
      )}
    </>
  );
}

export function ComponentDetailsCard({
  component,
  request,
  componentName,
  componentCategory,
  hasImage,
  imageSrc,
  imageFailed,
  onImageError,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-border-color bg-bg-card overflow-hidden"
    >
      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <div className="w-full">
            <div className="w-full aspect-[4/3] rounded-2xl bg-bg-secondary overflow-hidden border border-border-color/50 flex items-center justify-center">
              {hasImage && imageSrc && !imageFailed ? (
                <img
                  src={imageSrc}
                  alt={componentName}
                  className="w-full h-full object-contain"
                  onError={onImageError}
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                  <Package size={40} className="text-text-muted/30" />
                  <p className="text-[10px] text-text-muted/40">No image available</p>
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 leading-tight break-words">
              {componentName}
            </h1>

            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-bg-secondary text-[11px] font-medium text-text-secondary">
                {orFallback(componentCategory)}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${getConditionColor(
                  component?.condition
                )}`}
              >
                {orFallback(component?.condition)}
              </span>
              {component?.is_active === false && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-500/10 text-[11px] font-medium text-red-500 border border-red-500/20">
                  Inactive
                </span>
              )}
              {request?.quantity > 1 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-bg-secondary text-[11px] font-medium text-text-secondary border border-border-color">
                  x{request.quantity} requested
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-bg-secondary border border-border-color/50 mb-4 w-fit">
              <span
                className={`w-2 h-2 rounded-full ${
                  component && component.available_quantity > 0 ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <div>
                <div className="flex items-baseline gap-0.5">
                  <span
                    className={`text-lg font-bold ${
                      component && component.available_quantity > 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {component ? orFallback(component.available_quantity) : "Not available"}
                  </span>
                  {component && (
                    <span className="text-xs text-text-muted font-medium">
                      / {orFallback(component.quantity)}
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-text-muted leading-none">available</p>
              </div>
            </div>

            <div className="mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Description
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed break-words whitespace-pre-wrap">
                {orFallback(component?.description)}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoField icon={MapPin} label="Location" value={component?.location} />
              <InfoField
                icon={Calendar}
                label="Buying Date"
                value={formatDate(component?.buyingDate)}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function TopBar({ backTo, backLabel, quantity, status, isOverdue }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-accent-orange transition-colors"
      >
        <ArrowLeft size={15} />
        {backLabel}
      </Link>
      <div className="flex items-center gap-2">
        {quantity > 1 && (
          <span className="text-[11px] font-semibold px-2 py-1 rounded-md bg-bg-secondary text-text-secondary border border-border-color">
            x{quantity}
          </span>
        )}
        <BorrowStatusBadge status={status} isOverdue={isOverdue} />
      </div>
    </div>
  );
}
