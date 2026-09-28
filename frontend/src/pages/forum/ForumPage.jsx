import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  FolderOpen,
  Loader2,
  MessageSquare,
  Plus,
  RotateCcw,
  Tag,
  X,
} from "lucide-react";
import api from "../../services/axios";
import { useAuth } from "../../context/AuthContext";
import { isSuspended, SUSPENDED_MESSAGE } from "../../services/suspension";
import Avatar from "../../components/common/Avatar/Avatar";
import SearchInput from "../../components/common/SearchInput";
import { dashboardRoutes, excerpt, formatTimeAgo, roleLabel } from "./forumUtils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
  { value: "discussed", label: "Most discussed" },
  { value: "activity", label: "Recent activity" },
];

const inputClass =
  "w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent-orange/30";

export default function ForumPage() {
  const { user } = useAuth();
  const dashboardPath = dashboardRoutes[user?.role] || "/login";
  const canManageCategories =
    user?.role === "admin" || (user?.role === "moderator" && user?.isVerified);
  const suspended = isSuspended(user);

  const [categories, setCategories] = useState([]);
  const [issues, setIssues] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(null);
  const [loadedKey, setLoadedKey] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const searchTimer = useRef(null);
  const [fetchTick, setFetchTick] = useState(0);

  // Derived loading state: the effect itself never calls setState
  // synchronously, so first load, filter changes and retries all show the
  // spinner through this key comparison.
  const requestKey = `${debouncedSearch}|${categoryFilter}|${sort}|${page}|${fetchTick}`;
  const loading = loadedKey !== requestKey;

  const refresh = () => setFetchTick((tick) => tick + 1);

  useEffect(() => {
    let cancelled = false;
    const effectKey = `${debouncedSearch}|${categoryFilter}|${sort}|${page}|${fetchTick}`;
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (categoryFilter) params.set("category", categoryFilter);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", "10");

    api
      .get(`/forum/issues?${params.toString()}`)
      .then((res) => {
        if (cancelled) return;
        setIssues(res.data.data.issues);
        setPagination(res.data.data.pagination);
        setError(null);
        setLoadedKey(effectKey);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.data?.message || "Could not load the forum right now.");
        setLoadedKey(effectKey);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, categoryFilter, sort, page, fetchTick]);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/forum/categories")
      .then((res) => {
        if (cancelled) return;
        const list = res.data.data.categories || [];
        setCategories(list);
        // Pre-select the fallback category only while nothing is chosen yet.
        setCategoryId((current) => current || list.find((entry) => entry.isSystem)?._id || "");
      })
      .catch(() => {
        // Categories are optional for browsing; the create form surfaces an
        // error of its own when none are available.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearchChange = (value) => {
    setSearch(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400);
  };

  const clearFilters = () => {
    clearTimeout(searchTimer.current);
    setSearch("");
    setDebouncedSearch("");
    setCategoryFilter("");
    setSort("latest");
    setPage(1);
  };

  const handleRetry = () => {
    setError(null);
    refresh();
  };

  const closeCreate = () => {
    if (submitting) return;
    setCreateOpen(false);
    setFormError(null);
  };

  const openCreate = () => {
    if (suspended) {
      setFormError(SUSPENDED_MESSAGE);
      return;
    }
    setFormError(null);
    setCreateOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (suspended) {
      setFormError(SUSPENDED_MESSAGE);
      return;
    }
    const nextTitle = title.trim();
    const nextDescription = description.trim();

    if (nextTitle.length < 5) {
      setFormError("Title must be at least 5 characters.");
      return;
    }
    if (nextDescription.length < 5) {
      setFormError("Description must be at least 5 characters.");
      return;
    }
    if (!categoryId) {
      setFormError("Please select a category.");
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      await api.post("/forum/issues", {
        title: nextTitle,
        description: nextDescription,
        category: categoryId,
      });

      setCreateOpen(false);
      setTitle("");
      setDescription("");
      clearTimeout(searchTimer.current);
      setSearch("");
      setDebouncedSearch("");
      setCategoryFilter("");
      setSort("latest");
      setPage(1);
      refresh();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not post your issue.");
    } finally {
      setSubmitting(false);
    }
  };

  const hasActiveFilters = Boolean(debouncedSearch || categoryFilter || sort !== "latest");

  return (
    <div className="space-y-6">
      <Link
        to={dashboardPath}
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent-orange transition-colors"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Community{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8A00] to-[#FF6B00]">
              Forum
            </span>
          </h1>
          <p className="text-text-muted mt-1 text-sm">
            Ask questions, report problems and help the campus community.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canManageCategories && (
            <Link
              to="/forum/categories"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-color text-text-secondary text-sm font-medium hover:bg-bg-secondary transition-colors"
            >
              <FolderOpen size={16} /> Categories
            </Link>
          )}
          <button
            type="button"
            onClick={openCreate}
            disabled={suspended}
            title={suspended ? SUSPENDED_MESSAGE : undefined}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <Plus size={16} /> New Issue
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search issues..."
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(event) => {
            setCategoryFilter(event.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(event) => {
            setSort(event.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border-color text-text-secondary text-sm hover:bg-bg-secondary transition-colors"
          >
            <RotateCcw size={15} /> Reset
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-accent-orange" />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <AlertTriangle size={44} className="mx-auto text-red-500 mb-4" />
          <p className="text-text-muted">{error}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-4 px-4 py-2 rounded-xl bg-accent-orange/10 text-accent-orange text-sm font-medium hover:bg-accent-orange/20 transition-colors"
          >
            Try again
          </button>
        </div>
      ) : issues.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-bg-secondary flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={36} className="text-text-muted" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            {hasActiveFilters ? "No issues found" : "No issues yet"}
          </h3>
          <p className="text-sm text-text-muted mb-5">
            {hasActiveFilters
              ? "Try a different search or clear the filters."
              : "Be the first member of the community to start a discussion."}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl bg-accent-orange/10 text-accent-orange text-sm font-medium hover:bg-accent-orange/20 transition-colors"
            >
              Clear filters
            </button>
          ) : (
            <button
              type="button"
              onClick={openCreate}
              disabled={suspended}
              title={suspended ? SUSPENDED_MESSAGE : undefined}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-orange text-white text-sm font-semibold hover:bg-accent-orange-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} /> Start the first issue
            </button>
          )}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {issues.map((issue) => (
            <motion.article
              key={issue._id}
              variants={item}
              className="glass-card rounded-2xl p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-orange/10 text-accent-orange">
                  <Tag size={12} />
                  {issue.category?.name || "UnCategorised"}
                </span>
                <span className="text-xs text-text-muted shrink-0">
                  {formatTimeAgo(issue.createdAt)}
                </span>
              </div>

              <Link
                to={`/forum/${issue._id}`}
                className="block text-lg font-bold text-text-primary hover:text-accent-orange transition-colors leading-snug"
              >
                {issue.title}
              </Link>
              <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">
                {excerpt(issue.description)}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-3 border-t border-border-color">
                <Link
                  to={`/user/${issue.creator?.username || ""}`}
                  className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity"
                >
                  <Avatar user={issue.creator} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {issue.creator?.name || "Unknown user"}
                    </p>
                    <p className="text-[11px] text-text-muted capitalize">
                      {roleLabel(issue.creator?.role)}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-4 text-xs text-text-muted shrink-0">
                  <span className="inline-flex items-center gap-1.5">
                    <MessageSquare size={14} />
                    {issue.commentCount || 0} comment{(issue.commentCount || 0) === 1 ? "" : "s"}
                  </span>
                  <span className="hidden sm:inline">
                    Active {formatTimeAgo(issue.lastActivityAt)}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}

      {!loading && !error && pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-sm text-text-muted">
            Page {pagination.currentPage} of {pagination.totalPages} ·{" "}
            {pagination.totalCount} issue{pagination.totalCount === 1 ? "" : "s"}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!pagination.hasPrev}
              onClick={() => setPage(pagination.currentPage - 1)}
              className="px-4 py-2 rounded-xl border border-border-color text-sm text-text-secondary hover:bg-bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!pagination.hasNext}
              onClick={() => setPage(pagination.currentPage + 1)}
              className="px-4 py-2 rounded-xl border border-border-color text-sm text-text-secondary hover:bg-bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {createOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={closeCreate}
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
                aria-label="Create issue"
                className="w-full max-w-lg rounded-2xl bg-bg-card border border-border-color shadow-2xl overflow-hidden"
                onClick={(event) => event.stopPropagation()}
              >
                <form onSubmit={handleSubmit}>
                  <div className="flex items-center justify-between p-5 border-b border-border-color">
                    <div>
                      <h2 className="text-lg font-bold text-text-primary">New Issue</h2>
                      <p className="text-xs text-text-muted mt-0.5">
                        Share a question or problem with the community.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeCreate}
                      aria-label="Close"
                      className="p-2 rounded-lg text-text-muted hover:bg-bg-secondary transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="p-5 space-y-4">
                    {formError && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                        {formError}
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="issue-title"
                        className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5"
                      >
                        Title
                      </label>
                      <input
                        id="issue-title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        maxLength={200}
                        placeholder="What is the issue about?"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="issue-category"
                        className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5"
                      >
                        Category
                      </label>
                      <select
                        id="issue-category"
                        value={categoryId}
                        onChange={(event) => setCategoryId(event.target.value)}
                        className={inputClass}
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="issue-description"
                        className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5"
                      >
                        Description
                      </label>
                      <textarea
                        id="issue-description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={5}
                        maxLength={8000}
                        placeholder="Describe the issue in detail..."
                        className={`${inputClass} resize-y`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 p-5 border-t border-border-color bg-bg-secondary/50">
                    <button
                      type="button"
                      onClick={closeCreate}
                      disabled={submitting}
                      className="px-4 py-2.5 rounded-xl border border-border-color text-sm font-medium text-text-secondary hover:bg-bg-secondary transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || suspended}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-orange text-white text-sm font-bold hover:bg-accent-orange-hover disabled:opacity-60 transition-colors"
                    >
                      {submitting && <Loader2 size={14} className="animate-spin" />}
                      {submitting ? "Posting..." : "Post Issue"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
