import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  History,
  Inbox,
  Loader2,
  Lock,
  Send,
  ShieldCheck,
  User2,
} from "lucide-react";
import api from "../../services/axios";
import { useAuth } from "../../context/AuthContext";
import { isSuspended, SUSPENDED_MESSAGE } from "../../services/suspension";
import Avatar from "../../components/common/Avatar/Avatar";
import {
  REPORT_STATUSES,
  canReply,
  categoryLabel,
  formatFullDate,
  formatTimeAgo,
  isStaff,
  roleLabel,
  statusMeta,
} from "./reportUtils";

const selectClass =
  "px-3 py-2 rounded-lg bg-bg-secondary border border-border-color text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-orange/30 disabled:cursor-not-allowed";

function ProfileLink({ person }) {
  if (!person) return null;
  if (!person.username) return <span>{person.name || "Unknown"}</span>;
  return (
    <Link
      to={`/user/${person.username}`}
      className="hover:text-accent-orange transition-colors"
    >
      {person.name || "Unknown"}
    </Link>
  );
}

export default function ReportDetailsPage() {
  const { reportId } = useParams();
  const { user } = useAuth();
  const staff = isStaff(user?.role);
  const suspended = isSuspended(user);

  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState(null);
  const [loadedKey, setLoadedKey] = useState(null);
  const [loadTick, setLoadTick] = useState(0);

  const [messages, setMessages] = useState([]);
  const [msgPagination, setMsgPagination] = useState(null);
  const [msgError, setMsgError] = useState(null);
  const [msgLoadedKey, setMsgLoadedKey] = useState(null);
  const [msgTick, setMsgTick] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [composerError, setComposerError] = useState(null);

  const [statusValue, setStatusValue] = useState("");
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusNotice, setStatusNotice] = useState(null);

  const requestKey = `${reportId}|${loadTick}`;
  const loading = !error && loadedKey !== requestKey;
  const msgRequestKey = `${reportId}|${msgTick}`;
  const messagesLoading = loadedKey === requestKey && msgLoadedKey !== msgRequestKey;

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/tickets/${reportId}`)
      .then((res) => {
        if (cancelled) return;
        const record = res.data?.data?.ticket || null;
        setTicket(record);
        setStatusValue(record ? record.status : "");
        setError(null);
        setLoadedKey(`${reportId}|${loadTick}`);
      })
      .catch((err) => {
        if (cancelled) return;
        setTicket(null);
        setError(
          err.response?.data?.message || "This report could not be loaded."
        );
        setLoadedKey(`${reportId}|${loadTick}`);
      });

    return () => {
      cancelled = true;
    };
  }, [reportId, loadTick]);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/tickets/${reportId}/messages?page=1&limit=20`)
      .then((res) => {
        if (cancelled) return;
        setMessages(res.data?.data?.messages || []);
        setMsgPagination(res.data?.data?.pagination || null);
        setMsgError(null);
        setMsgLoadedKey(`${reportId}|${msgTick}`);
      })
      .catch((err) => {
        if (cancelled) return;
        setMessages([]);
        setMsgError(
          err.response?.data?.message || "Could not load the conversation."
        );
        setMsgLoadedKey(`${reportId}|${msgTick}`);
      });

    return () => {
      cancelled = true;
    };
  }, [reportId, msgTick]);

  const refresh = () => {
    setError(null);
    setMsgError(null);
    setLoadTick((tick) => tick + 1);
    setMsgTick((tick) => tick + 1);
  };

  const handleLoadMore = () => {
    if (!msgPagination?.hasNext || loadingMore) return;
    setLoadingMore(true);
    api
      .get(`/tickets/${reportId}/messages?page=${msgPagination.currentPage + 1}&limit=20`)
      .then((res) => {
        const next = res.data?.data?.messages || [];
        setMessages((previous) => [...previous, ...next]);
        setMsgPagination(res.data?.data?.pagination || null);
        setMsgError(null);
      })
      .catch((err) => {
        setMsgError(err.response?.data?.message || "Could not load more messages.");
      })
      .finally(() => {
        setLoadingMore(false);
      });
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (suspended) {
      setComposerError(SUSPENDED_MESSAGE);
      return;
    }
    const content = text.trim();
    if (!content || sending) return;

    setComposerError(null);
    setSending(true);
    try {
      const res = await api.post(`/tickets/${reportId}/messages`, {
        message: content,
      });
      const created = res.data?.data?.message;
      setMessages((previous) => [...previous, created]);
      setText("");
      setMsgError(null);
      setTicket((previous) =>
        previous
          ? {
              ...previous,
              messageCount: (previous.messageCount || 0) + 1,
              lastActivityAt: created?.createdAt || new Date().toISOString(),
              lastMessagePreview: content.slice(0, 160),
              lastMessageBy: created?.sender || previous.lastMessageBy,
              handledBy:
                staff && created?.sender ? created.sender : previous.handledBy,
              handledAt: staff && created?.sender ? created?.createdAt : previous.handledAt,
            }
          : previous
      );
      if (msgPagination) {
        setMsgPagination((previous) =>
          previous
            ? { ...previous, totalCount: (previous.totalCount || 0) + 1 }
            : previous
        );
      }
    } catch (err) {
      setComposerError(
        err.response?.data?.message || "Could not send your message."
      );
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async () => {
    if (!ticket || !statusValue || statusValue === ticket.status || statusBusy) {
      return;
    }
    setStatusBusy(true);
    setStatusNotice(null);
    try {
      const res = await api.patch(`/tickets/${reportId}/status`, {
        status: statusValue,
      });
      const updated = res.data?.data?.ticket;
      if (updated) {
        setTicket(updated);
        setStatusValue(updated.status);
      }
      setStatusNotice({ type: "success", text: "Report status updated." });
    } catch (err) {
      setStatusNotice({
        type: "error",
        text: err.response?.data?.message || "Could not update the status.",
      });
      setStatusValue(ticket.status);
    } finally {
      setStatusBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 size={30} className="animate-spin text-accent-orange" />
        <p className="text-xs text-text-muted">Loading report…</p>
      </div>
    );
  }

  if (error || !ticket) {
    const denied = error && error.toLowerCase().includes("not authorized");
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <Inbox size={30} className="text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-text-primary mb-2">
          {denied ? "Access Denied" : "Report Not Found"}
        </h1>
        <p className="text-sm text-text-muted mb-6">
          {denied
            ? "You are not authorized to view this report."
            : error || "This report may have been removed."}
        </p>
        <div className="flex items-center justify-center gap-3">
          {!denied && (
            <button
              type="button"
              onClick={refresh}
              className="px-4 py-2 rounded-xl bg-bg-secondary border border-border-color text-sm font-medium text-text-primary hover:bg-bg-tertiary transition-colors"
            >
              Try again
            </button>
          )}
          <Link
            to="/reports"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-orange/10 text-accent-orange text-sm font-semibold hover:bg-accent-orange/20 transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  const meta = statusMeta(ticket.status);
  const reporter = ticket.reporter;
  const handler = ticket.handledBy;
  const isReporterOwner =
    reporter && String(reporter._id || reporter) === String(user?._id);
  const replyAllowed = canReply(ticket, user);
  const history = ticket.statusHistory || [];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
      <Link
        to="/reports"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-accent-orange transition-colors mb-4"
      >
        <ArrowLeft size={13} />
        Back to Reports
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-border-color bg-bg-card p-5 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${meta.chip}`}
              >
                {meta.label}
              </span>
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-bg-secondary border border-border-color text-text-muted">
                {categoryLabel(ticket.category)}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-text-primary">
              {ticket.subject}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-text-muted">
              <span>Created {formatFullDate(ticket.createdAt)}</span>
              <span>Updated {formatTimeAgo(ticket.updatedAt || ticket.lastActivityAt)}</span>
              <span>
                {ticket.messageCount || 0}{" "}
                {(ticket.messageCount || 0) === 1 ? "reply" : "replies"}
              </span>
            </div>
          </div>

          {staff && (
            <div className="shrink-0 w-full lg:w-auto">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Change Status
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={statusValue}
                  onChange={(event) => {
                    setStatusValue(event.target.value);
                    setStatusNotice(null);
                  }}
                  disabled={statusBusy}
                  className={selectClass}
                  aria-label="Report status"
                >
                  {REPORT_STATUSES.map((entry) => (
                    <option key={entry.value} value={entry.value}>
                      {entry.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleStatusChange}
                  disabled={statusBusy || statusValue === ticket.status}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-orange hover:bg-accent-orange-hover text-white text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {statusBusy && <Loader2 size={13} className="animate-spin" />}
                  Update
                </button>
              </div>
              {statusNotice && (
                <p
                  className={`text-[11px] mt-1.5 ${
                    statusNotice.type === "error" ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {statusNotice.text}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Description */}
          <div className="rounded-2xl border border-border-color bg-bg-card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-2">
              Report Description
            </p>
            <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          {/* Conversation */}
          <div className="rounded-2xl border border-border-color bg-bg-card p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Conversation
              </p>
              <span className="text-[11px] text-text-muted">
                {msgPagination ? msgPagination.totalCount : messages.length} messages
              </span>
            </div>

            {messagesLoading ? (
              <div className="flex items-center justify-center py-10 gap-2 text-xs text-text-muted">
                <Loader2 size={16} className="animate-spin text-accent-orange" />
                Loading conversation…
              </div>
            ) : msgError ? (
              <div className="text-center py-8">
                <p className="text-sm text-red-500 mb-3">{msgError}</p>
                <button
                  type="button"
                  onClick={() => {
                    setMsgError(null);
                    setMsgTick((tick) => tick + 1);
                  }}
                  className="text-sm text-accent-orange hover:underline font-medium"
                >
                  Try again
                </button>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-10">
                <Inbox size={26} className="text-text-muted/40 mx-auto mb-2" />
                <p className="text-sm text-text-muted">
                  No replies yet. The conversation starts here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((entry) => {
                    const sender = entry.sender || {};
                    return (
                      <motion.div
                        key={entry._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                      >
                        <Avatar user={sender} size="w-9 h-9 text-sm" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="text-sm font-semibold text-text-primary">
                              <ProfileLink person={sender} />
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-bg-secondary border border-border-color text-text-muted">
                              {roleLabel(sender.role)}
                            </span>
                            <span className="text-[11px] text-text-muted">
                              {formatTimeAgo(entry.createdAt)}
                            </span>
                          </div>
                          <div className="mt-1.5 rounded-xl rounded-tl-sm bg-bg-secondary border border-border-color px-3.5 py-2.5">
                            <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap break-words">
                              {entry.message}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {msgPagination?.hasNext && (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="w-full py-2 rounded-xl bg-bg-secondary border border-border-color text-xs font-medium text-text-secondary hover:bg-bg-tertiary transition-colors disabled:opacity-60"
                  >
                    {loadingMore ? "Loading…" : "Load more replies"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="rounded-2xl border border-border-color bg-bg-card p-5">
            {replyAllowed ? (
              <form onSubmit={handleSend}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                    Reply as {roleLabel(user?.role)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Avatar user={user} size="w-6 h-6 text-[10px]" />
                    <span className="text-xs text-text-muted">{user?.name}</span>
                  </div>
                </div>
                {composerError && (
                  <p className="text-xs text-red-500 mb-2">{composerError}</p>
                )}
                <textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Write a message…"
                  rows={4}
                  maxLength={4000}
                  disabled={sending}
                  className="w-full px-4 py-3 rounded-xl bg-bg-secondary border border-border-color text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent-orange/30 resize-y leading-relaxed"
                />
                <div className="flex items-center justify-between gap-3 mt-3">
                  <p className="text-[11px] text-text-muted">
                    {text.trim().length}/4000
                  </p>
                  <button
                    type="submit"
                    disabled={sending || !text.trim() || suspended}
                    title={suspended ? SUSPENDED_MESSAGE : undefined}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-orange hover:bg-accent-orange-hover text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Send size={15} />
                    )}
                    {sending ? "Sending…" : "Send"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <Lock size={17} className="text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-600">
                    This report has been solved. Further replies are disabled.
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    You can still review the full conversation any time.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-4">
          {/* Reporter */}
          <div className="rounded-2xl border border-border-color bg-bg-card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-3">
              Reporter
            </p>
            <div className="flex items-center gap-3">
              <Avatar user={reporter} size="w-11 h-11 text-base" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">
                  <ProfileLink person={reporter} />
                </p>
                <p className="text-xs text-text-muted">
                  {roleLabel(reporter?.role)}
                  {reporter?.username ? ` · @${reporter.username}` : ""}
                </p>
              </div>
            </div>
            {isReporterOwner && (
              <p className="text-[11px] text-text-muted mt-2">This is your report.</p>
            )}
          </div>

          {/* Handler */}
          <div className="rounded-2xl border border-border-color bg-bg-card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-3">
              Last Handled By
            </p>
            {handler ? (
              <>
                <div className="flex items-center gap-3">
                  <Avatar user={handler} size="w-11 h-11 text-base" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      <ProfileLink person={handler} />
                    </p>
                    <p className="text-xs text-text-muted">{roleLabel(handler.role)}</p>
                  </div>
                </div>
                {ticket.handledAt && (
                  <p className="text-[11px] text-text-muted mt-2">
                    {formatFullDate(ticket.handledAt)}
                  </p>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-bg-secondary border border-border-color flex items-center justify-center">
                  <User2 size={18} className="text-text-muted/60" />
                </div>
                <p className="text-sm text-text-muted">Not assigned</p>
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-3 text-[11px] text-text-muted">
              <ShieldCheck size={13} className="text-accent-orange" />
              {staff
                ? "Replies and status updates are shared with your whole team."
                : "Our team replies right here in this thread."}
            </div>
          </div>

          {/* Status history */}
          <div className="rounded-2xl border border-border-color bg-bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <History size={14} className="text-text-muted" />
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Status History
              </p>
            </div>
            {history.length === 0 ? (
              <p className="text-xs text-text-muted">
                No status changes yet — the report is still {meta.label}.
              </p>
            ) : (
              <ol className="space-y-3">
                {[...history].reverse().map((entry) => {
                  const entryMeta = statusMeta(entry.status);
                  const previousMeta = entry.previous
                    ? statusMeta(entry.previous)
                    : null;
                  return (
                    <li key={`${entry._id || entry.status}-${entry.changedAt}`}>
                      <div className="flex items-center gap-1.5 text-xs">
                        {previousMeta && (
                          <>
                            <span className="text-text-muted line-through">
                              {previousMeta.label}
                            </span>
                            <span className="text-text-muted">→</span>
                          </>
                        )}
                        <span className={`text-xs font-semibold ${entryMeta.text}`}>
                          {entryMeta.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {entry.changedBy?.name || "System"} ·{" "}
                        {formatTimeAgo(entry.changedAt)}
                      </p>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
