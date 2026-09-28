import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Loader2, Send } from "lucide-react";
import api from "../../services/axios";
import { REPORT_CATEGORIES } from "./reportUtils";

const fieldClass =
  "w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent-orange/30";

export default function CreateReportPage() {
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("other");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextSubject = subject.trim();
    const nextDescription = description.trim();

    if (nextSubject.length < 5) {
      setError("Subject must be at least 5 characters.");
      return;
    }
    if (nextDescription.length < 5) {
      setError("Please describe the issue in at least 5 characters.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = await api.post("/tickets", {
        subject: nextSubject,
        description: nextDescription,
        category,
      });
      const created = res.data?.data?.ticket;
      navigate(`/reports/${created?._id || ""}`, { replace: true });
    } catch (err) {
      const validation = err.response?.data?.errors;
      setError(
        Array.isArray(validation) && validation.length > 0
          ? validation[0].message
          : err.response?.data?.message || "Could not submit your report."
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-3xl mx-auto">
      <Link
        to="/reports"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-accent-orange transition-colors mb-4"
      >
        <ArrowLeft size={13} />
        Back to Reports
      </Link>

      <div className="rounded-2xl border border-border-color bg-bg-card overflow-hidden">
        <div className="px-5 sm:px-6 py-5 border-b border-border-color bg-bg-secondary/50">
          <h1 className="text-lg sm:text-xl font-bold text-text-primary">
            Open a New Report
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Describe the issue and the team will get back to you in this thread.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 sm:px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="report-subject"
              className="block text-xs font-semibold text-text-secondary mb-1.5"
            >
              Subject
            </label>
            <input
              id="report-subject"
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Short summary of your report"
              maxLength={200}
              disabled={submitting}
              className={fieldClass}
            />
            <p className="text-[11px] text-text-muted mt-1">
              {subject.trim().length}/200 characters · minimum 5
            </p>
          </div>

          <div>
            <label
              htmlFor="report-category"
              className="block text-xs font-semibold text-text-secondary mb-1.5"
            >
              Report Type
            </label>
            <select
              id="report-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              disabled={submitting}
              className={fieldClass}
            >
              {REPORT_CATEGORIES.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="report-description"
              className="block text-xs font-semibold text-text-secondary mb-1.5"
            >
              Description
            </label>
            <textarea
              id="report-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What happened? Steps to reproduce, error messages, or anything that helps us investigate…"
              rows={7}
              maxLength={8000}
              disabled={submitting}
              className={`${fieldClass} resize-y leading-relaxed`}
            />
            <p className="text-[11px] text-text-muted mt-1">
              {description.trim().length}/8000 characters · minimum 5
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
            <Link
              to="/reports"
              className="px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-sm font-medium text-text-secondary hover:bg-bg-tertiary transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-orange hover:bg-accent-orange-hover text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
              {submitting ? "Submitting…" : "Submit Report"}
            </button>
          </div>
        </form>
      </div>

      <p className="text-[11px] text-text-muted mt-3 text-center">
        Your report starts as <span className="font-semibold">Open</span>. You can
        keep replying until it is marked as Solved.
      </p>
    </div>
  );
}
