import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  MessageSquare,
  Tag,
} from "lucide-react";
import api from "../../services/axios";
import { useAuth } from "../../context/AuthContext";
import { isSuspended, SUSPENDED_MESSAGE } from "../../services/suspension";
import Avatar from "../../components/common/Avatar/Avatar";
import {
  MAX_VISUAL_DEPTH,
  formatFullDate,
  formatTimeAgo,
  roleLabel,
} from "./forumUtils";

const inputClass =
  "w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent-orange/30";

function AuthorLink({ user, size = "sm" }) {
  if (!user?.username) {
    return (
      <div className="flex items-center gap-2.5 min-w-0">
        <Avatar user={user} size={size} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">
            {user?.name || "Unknown user"}
          </p>
          <p className="text-[11px] text-text-muted capitalize">{roleLabel(user?.role)}</p>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={`/user/${user.username}`}
      className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity"
    >
      <Avatar user={user} size={size} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">
          {user.name || user.username}
        </p>
        <p className="text-[11px] text-text-muted capitalize">{roleLabel(user.role)}</p>
      </div>
    </Link>
  );
}

function CommentNode({ comment, onReply }) {
  const visualDepth = Math.min(comment.depth || 0, MAX_VISUAL_DEPTH);
  const replies = comment.replies || [];

  return (
    <div
      className={
        visualDepth > 0
          ? "ml-3 sm:ml-5 pl-3 sm:pl-4 border-l border-border-color"
          : ""
      }
    >
      <div className="py-3.5">
        <div className="flex items-start justify-between gap-3">
          <AuthorLink user={comment.author} />
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-text-muted" title={formatFullDate(comment.createdAt)}>
              {formatTimeAgo(comment.createdAt)}
            </span>
            <button
              type="button"
              onClick={() => onReply(comment)}
              className="text-xs font-semibold text-text-muted hover:text-accent-orange transition-colors"
            >
              Reply
            </button>
          </div>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap break-words mt-2">
          {comment.content}
        </p>
      </div>

      {replies.length > 0 && (
        <div>
          {replies.map((reply) => (
            <CommentNode key={reply._id} comment={reply} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ForumIssueDetails() {
  const { issueId } = useParams();
  const { user } = useAuth();
  const suspended = isSuspended(user);

  const [issue, setIssue] = useState(null);
  const [issueError, setIssueError] = useState(null);
  const [loadedIssueKey, setLoadedIssueKey] = useState(null);

  const [comments, setComments] = useState([]);
  const [commentsPagination, setCommentsPagination] = useState(null);
  const [commentsError, setCommentsError] = useState(null);
  const [loadedCommentsKey, setLoadedCommentsKey] = useState(null);
  const [commentsPage, setCommentsPage] = useState(1);

  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [composerError, setComposerError] = useState(null);

  const composerRef = useRef(null);
  const [issueTick, setIssueTick] = useState(0);
  const [commentsTick, setCommentsTick] = useState(0);

  // Derived loading states: the effects below only call setState in async
  // callbacks, so the spinner is driven by these key comparisons.
  const issueRequestKey = `${issueId}|${issueTick}`;
  const issueLoading = loadedIssueKey !== issueRequestKey;
  const commentsRequestKey = `${issueId}|${commentsPage}|${commentsTick}`;
  const commentsLoading = loadedCommentsKey !== commentsRequestKey;

  const refreshIssue = () => setIssueTick((tick) => tick + 1);
  const refreshComments = () => setCommentsTick((tick) => tick + 1);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/forum/issues/${issueId}`)
      .then((res) => {
        if (cancelled) return;
        setIssue(res.data.data.issue);
        setIssueError(null);
        setLoadedIssueKey(`${issueId}|${issueTick}`);
      })
      .catch((err) => {
        if (cancelled) return;
        setIssue(null);
        setIssueError(err.response?.data?.message || "Issue not found.");
        setLoadedIssueKey(`${issueId}|${issueTick}`);
      });

    return () => {
      cancelled = true;
    };
  }, [issueId, issueTick]);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/forum/issues/${issueId}/comments?page=${commentsPage}&limit=10`)
      .then((res) => {
        if (cancelled) return;
        setComments(res.data.data.comments || []);
        setCommentsPagination(res.data.data.pagination);
        setCommentsError(null);
        setLoadedCommentsKey(`${issueId}|${commentsPage}|${commentsTick}`);
      })
      .catch((err) => {
        if (cancelled) return;
        setComments([]);
        setCommentsError(err.response?.data?.message || "Could not load comments.");
        setLoadedCommentsKey(`${issueId}|${commentsPage}|${commentsTick}`);
      });

    return () => {
      cancelled = true;
    };
  }, [issueId, commentsPage, commentsTick]);

  const handleReply = (comment) => {
    setReplyTo({ id: comment._id, name: comment.author?.name || "this user" });
    setComposerError(null);
    composerRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyTo(null);
    setComposerError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (suspended) {
      setComposerError(SUSPENDED_MESSAGE);
      return;
    }
    const content = commentText.trim();
    if (!content) {
      setComposerError(replyTo ? "Reply cannot be empty." : "Comment cannot be empty.");
      return;
    }

    setComposerError(null);
    setSubmitting(true);
    try {
      const body = replyTo
        ? { content, parentComment: replyTo.id }
        : { content };
      await api.post(`/forum/issues/${issueId}/comments`, body);

      setCommentText("");
      setReplyTo(null);
      setIssue((previous) =>
        previous
          ? {
              ...previous,
              commentCount: (previous.commentCount || 0) + 1,
              lastActivityAt: new Date().toISOString(),
            }
          : previous
      );
      refreshComments();
    } catch (err) {
      setComposerError(err.response?.data?.message || "Could not post your comment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (issueLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-accent-orange" />
      </div>
    );
  }

  if (issueError || !issue) {
    return (
      <div className="text-center py-16">
        <AlertTriangle size={44} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-text-primary mb-1">Issue not found</h2>
        <p className="text-sm text-text-muted mb-5">
          {issueError || "This issue may have been removed."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setIssueError(null);
              refreshIssue();
            }}
            className="px-4 py-2 rounded-xl bg-accent-orange/10 text-accent-orange text-sm font-medium hover:bg-accent-orange/20 transition-colors"
          >
            Try again
          </button>
          <Link
            to="/forum"
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent-orange transition-colors"
          >
            <ArrowLeft size={16} /> Back to Forum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/forum"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent-orange transition-colors"
      >
        <ArrowLeft size={16} /> Back to Forum
      </Link>

      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-5 md:p-6"
      >
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-orange/10 text-accent-orange">
            <Tag size={12} />
            {issue.category?.name || "UnCategorised"}
          </span>
          <span className="text-xs text-text-muted">
            Created {formatFullDate(issue.createdAt)}
          </span>
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-text-primary leading-snug">
          {issue.title}
        </h1>

        <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-border-color">
          <AuthorLink user={issue.creator} size="md" />
          <span className="inline-flex items-center gap-1.5 text-xs text-text-muted shrink-0">
            <MessageSquare size={14} />
            {issue.commentCount || 0} comment{(issue.commentCount || 0) === 1 ? "" : "s"}
          </span>
        </div>

        <p className="text-sm md:text-[15px] text-text-secondary leading-relaxed whitespace-pre-wrap break-words mt-5">
          {issue.description}
        </p>
      </motion.article>

      <section className="glass-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border-color flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary">
            Comments ({issue.commentCount || 0})
          </h2>
        </div>

        <div className="px-4 md:px-5 divide-y divide-border-color">
          {commentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={26} className="animate-spin text-accent-orange" />
            </div>
          ) : commentsError ? (
            <div className="text-center py-10">
              <AlertTriangle size={32} className="mx-auto text-red-500 mb-3" />
              <p className="text-sm text-text-muted mb-3">{commentsError}</p>
              <button
                type="button"
                onClick={() => {
                  setCommentsError(null);
                  refreshComments();
                }}
                className="px-4 py-2 rounded-xl bg-accent-orange/10 text-accent-orange text-sm font-medium hover:bg-accent-orange/20 transition-colors"
              >
                Try again
              </button>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquare size={32} className="mx-auto text-text-muted/40 mb-3" />
              <p className="text-sm text-text-muted">
                No comments yet. Start the discussion.
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentNode key={comment._id} comment={comment} onReply={handleReply} />
            ))
          )}
        </div>

        {!commentsLoading && !commentsError && commentsPagination && commentsPagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border-color">
            <p className="text-xs text-text-muted">
              Page {commentsPagination.currentPage} of {commentsPagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!commentsPagination.hasPrev}
                onClick={() => setCommentsPage(commentsPagination.currentPage - 1)}
                className="px-3 py-1.5 rounded-lg border border-border-color text-xs text-text-secondary hover:bg-bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={!commentsPagination.hasNext}
                onClick={() => setCommentsPage(commentsPagination.currentPage + 1)}
                className="px-3 py-1.5 rounded-lg border border-border-color text-xs text-text-secondary hover:bg-bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        <div className="px-4 md:px-5 py-4 border-t border-border-color bg-bg-secondary/40">
          <form onSubmit={handleSubmit}>
            <AnimatePresence>
              {replyTo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-3 pb-2">
                    <p className="text-sm text-text-secondary">
                      Replying to{" "}
                      <span className="font-semibold text-accent-orange">
                        {replyTo.name}
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={cancelReply}
                      className="text-xs font-semibold text-text-muted hover:text-accent-orange transition-colors"
                    >
                      Cancel reply
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {composerError && (
              <div className="mb-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                {composerError}
              </div>
            )}

            <textarea
              ref={composerRef}
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              rows={3}
              maxLength={4000}
              placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
              className={`${inputClass} resize-y`}
            />

            <div className="flex justify-end gap-3 mt-3">
              {replyTo && (
                <button
                  type="button"
                  onClick={cancelReply}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl border border-border-color text-sm font-medium text-text-secondary hover:bg-bg-secondary transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting || suspended}
                title={suspended ? SUSPENDED_MESSAGE : undefined}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-accent-orange text-white text-sm font-bold hover:bg-accent-orange-hover disabled:opacity-60 transition-colors"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {submitting ? "Posting..." : replyTo ? "Reply" : "Comment"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
