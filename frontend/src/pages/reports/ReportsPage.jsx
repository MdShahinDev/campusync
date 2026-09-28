import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
  MessageSquare,
  Plus,
  RotateCcw,
  User2,
} from "lucide-react";
import api from "../../services/axios";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../../components/common/Avatar/Avatar";
import SearchInput from "../../components/common/SearchInput";
import {
  REPORT_SORT_OPTIONS,
  REPORT_STATUSES,
  categoryLabel,
  dashboardRoutes,
  excerpt,
  formatTimeAgo,
  isStaff,
  roleLabel,
  statusMeta,
} from "./reportUtils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const selectClass =
  "px-3 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-orange/30";

export default function ReportsPage() {
  const { user } = useAuth();
  const dashboardPath = dashboardRoutes[user?.role] || "/login";
  const staff = isStaff(user?.role);

  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(null);
  const [loadedKey, setLoadedKey] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [fetchTick, setFetchTick] = useState(0);

  const searchTimer = useRef(null);

  const requestKey = `${debouncedSearch}|${statusFilter}|${sort}|${page}|${fetchTick}`;
  const loading = loadedKey !== requestKey;

  const refresh = () => setFetchTick((tick) => tick + 1);

  useEffect(() => {
    let cancelled = false;
    const effectKey = `${debouncedSearch}|${statusFilter}|${sort}|${page}|${fetchTick}`;
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (statusFilter) params.set("status", statusFilter);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", "10");

    api
      .get(`/tickets?${params.toString()}`)
      .then((res) => {
        if (cancelled) return;
        setReports(res.data.data.tickets || []);
        setPagination(res.data.data.pagination || null);
        setError(null);
        setLoadedKey(effectKey);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.data?.message || "Could not load your reports.");
        setLoadedKey(effectKey);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, statusFilter, sort, page, fetchTick]);

  const handleSearchChange = (value) => {
    setSearch(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400);
  };

  const handleReset = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("");
    setSort("latest");
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(debouncedSearch || statusFilter) || sort !== "latest";

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <Link
            to={dashboardPath}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-accent-orange transition-colors mb-1.5"
          >
            <ArrowLeft size={13} />
            Back to Dashboard
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
            {staff ? "Reports" : "My Reports"}
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            {staff
              ? "Support reports from your users — reply, track and update their status."
              : "Track every report you have opened and continue the conversation."}
          </p>
        </div>
        <Link
          to="/reports/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-orange hover:bg-accent-orange-hover text-white text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          New Report
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder={staff ? "Search subject or reporter…" : "Search your reports…"}
          className="sm:flex-1"
        />
        <div className="flex gap-2.5">
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            className={`${selectClass} flex-1 sm:flex-none`}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {REPORT_STATUSES.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
            className={`${selectClass} flex-1 sm:flex-none`}
            aria-label="Sort reports"
          >
            {REPORT_SORT_OPTIONS.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 size={28} className="animate-spin text-accent-orange" />
          <p className="text-xs text-text-muted">Loading reports…</p>
        </div>
      ) : error ? (
        <div className="text-center py-14 rounded-2xl border border-border-color bg-bg-card">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-3">
            <Inbox size={22} className="text-red-500" />
          </div>
          <p className="text-sm text-text-primary font-medium mb-1">
            Could not load reports
          </p>
          <p className="text-xs text-text-muted mb-4">{error}</p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              refresh();
            }}
            className="px-4 py-2 rounded-xl bg-accent-orange/10 text-accent-orange text-sm font-medium hover:bg-accent-orange/20 transition-colors"
          >
            Try again
          </button>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border-color bg-bg-card/50">
          <Inbox size={34} className="text-text-muted/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-text-primary mb-1">
            {hasActiveFilters ? "No reports match your filters" : "No reports yet"}
          </p>
          <p className="text-xs text-text-muted mb-4">
            {hasActiveFilters
              ? "Try a different search or status."
              : staff
                ? "Reports opened by your users will show up here."
                : "Something not working? Open a report and the team will get back to you."}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-bg-secondary border border-border-color text-sm text-text-primary hover:bg-bg-tertiary transition-colors"
            >
              Clear filters
            </button>
          ) : (
            <Link
              to="/reports/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-orange hover:bg-accent-orange-hover text-white text-sm font-semibold transition-colors"
            >
              <Plus size={15} />
              New Report
            </Link>
          )}
        </div>
      ) : (
        <>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {reports.map((report) => {
              const meta = statusMeta(report.status);
              const preview =
                report.lastMessagePreview ||
                excerpt(report.description, 160);
              return (
                <motion.div key={report._id} variants={item}>
                  <Link
                    to={`/reports/${report._id}`}
                    className="block rounded-2xl border border-border-color bg-bg-card p-4 sm:p-5 hover:border-accent-orange/40 hover:bg-bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-2 w-2.5 h-2.5 rounded-full shrink-0 ${meta.dot}`}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-text-primary text-sm sm:text-base truncate max-w-full">
                            {report.subject}
                          </h3>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${meta.chip}`}
                          >
                            {meta.label}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-bg-secondary border border-border-color text-text-muted whitespace-nowrap">
                            {categoryLabel(report.category)}
                          </span>
                        </div>

                        <p className="text-sm text-text-muted mt-1 line-clamp-2">
                          {preview}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-[11px] text-text-muted">
                          <span>Created {formatTimeAgo(report.createdAt)}</span>
                          <span>Updated {formatTimeAgo(report.lastActivityAt)}</span>
                          <span className="inline-flex items-center gap-1">
                            <MessageSquare size={12} />
                            {report.messageCount || 0}{" "}
                            {(report.messageCount || 0) === 1 ? "reply" : "replies"}
                          </span>
                        </div>

                        {staff && (
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 pt-3 border-t border-border-color">
                            <div className="flex items-center gap-2 min-w-0">
                              <Avatar
                                user={report.reporter}
                                size="w-6 h-6 text-[10px]"
                              />
                              <span className="text-[11px] text-text-muted">Reporter</span>
                              <span className="text-xs font-medium text-text-secondary truncate">
                                {report.reporter?.name || "Unknown"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 min-w-0">
                              {report.handledBy ? (
                                <>
                                  <Avatar
                                    user={report.handledBy}
                                    size="w-6 h-6 text-[10px]"
                                  />
                                  <span className="text-[11px] text-text-muted">
                                    Handled by
                                  </span>
                                  <span className="text-xs font-medium text-text-secondary truncate">
                                    {report.handledBy.name}
                                    {report.handledBy.role
                                      ? ` · ${roleLabel(report.handledBy.role)}`
                                      : ""}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <User2 size={14} className="text-text-muted/60" />
                                  <span className="text-[11px] text-text-muted">
                                    Handled by
                                  </span>
                                  <span className="text-xs text-text-muted">Not assigned</span>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 mt-5">
              <p className="text-xs text-text-muted">
                Page {pagination.currentPage} of {pagination.totalPages} ·{" "}
                {pagination.totalCount} total
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!pagination.hasPrev}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-bg-secondary border border-border-color text-xs font-medium text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-tertiary transition-colors"
                >
                  <ChevronLeft size={14} />
                  Prev
                </button>
                <button
                  type="button"
                  disabled={!pagination.hasNext}
                  onClick={() => setPage((current) => current + 1)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-bg-secondary border border-border-color text-xs font-medium text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-tertiary transition-colors"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
