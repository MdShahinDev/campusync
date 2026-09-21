import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertCircle, Calendar, FileText, Hash } from "lucide-react";
import api from "../../services/axios";

export default function BorrowRequestModal({ component, onClose, onSuccess }) {
  const maxQty = component?.available_quantity || 1;
  const [form, setForm] = useState({
    expected_return_date: "",
    purpose: "",
    notes: "",
    quantity: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleQuantityChange = (e) => {
    const val = e.target.value;
    if (val === "") {
      setForm((prev) => ({ ...prev, quantity: "" }));
      setError("");
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      setForm((prev) => ({ ...prev, quantity: num }));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.expected_return_date) {
      setError("Expected return date is required");
      return;
    }

    const returnDate = new Date(form.expected_return_date);
    if (returnDate <= new Date()) {
      setError("Return date must be in the future");
      return;
    }

    const qty = parseInt(form.quantity, 10);
    if (!qty || qty < 1) {
      setError("Quantity must be at least 1");
      return;
    }

    if (qty > maxQty) {
      setError(`Only ${maxQty} unit(s) available`);
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/borrowing", {
        component_id: component._id,
        expected_return_date: form.expected_return_date,
        purpose: form.purpose.trim(),
        notes: form.notes.trim(),
        quantity: qty,
      });
      onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit borrow request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full max-w-md glass-card rounded-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border-color">
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Borrow Request
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                {component.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-500">{error}</p>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Quantity * <span className="text-text-muted font-normal">(Max: {maxQty})</span>
              </label>
              <div className="relative">
                <Hash
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleQuantityChange}
                  min={1}
                  max={maxQty}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
                />
              </div>
            </div>

            {/* Expected Return Date */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Expected Return Date *
              </label>
              <div className="relative">
                <Calendar
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="date"
                  name="expected_return_date"
                  value={form.expected_return_date}
                  onChange={handleChange}
                  min={today}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
                />
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Purpose
              </label>
              <div className="relative">
                <FileText
                  size={16}
                  className="absolute left-3 top-3 text-text-muted"
                />
                <textarea
                  name="purpose"
                  value={form.purpose}
                  onChange={handleChange}
                  placeholder="What do you need this component for?"
                  rows={3}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30 resize-none"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Any other details for the owner..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-secondary text-sm font-medium hover:bg-bg-primary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
