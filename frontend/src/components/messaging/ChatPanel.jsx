import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  CheckCheck,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
} from "lucide-react";
import {
  displayRole,
  formatDaySeparator,
  formatMessageTime,
  initials,
} from "../../services/messaging";

const NEAR_BOTTOM_PX = 100;

/** Day separators: a separator belongs to the first message of each day. */
function computeDayFlags(messages) {
  const flags = [];
  let previousDay = null;
  for (const message of messages) {
    const day = formatDaySeparator(message.createdAt);
    flags.push(!!day && day !== previousDay);
    if (day) previousDay = day;
  }
  return flags;
}

function ChatHeader({ participant, online, onBack, realTime, connected }) {
  return (
    <header className="flex items-center gap-3 px-3 md:px-4 py-3 border-b border-border-color bg-bg-primary flex-shrink-0">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back to conversations"
        className="md:hidden p-2 -ml-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
      >
        <ArrowLeft size={18} />
      </button>

      <div className="relative shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-orange to-accent-orange-hover flex items-center justify-center text-white text-xs font-bold">
          {participant?.avatar ? (
            <img
              src={participant.avatar}
              alt=""
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            initials(participant?.name)
          )}
        </div>
        {online && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-bg-primary" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text-primary truncate">
          {participant?.name || "Conversation"}
        </p>
        <p className="text-[11px] text-text-muted flex items-center gap-1.5">
          <span className="capitalize">{displayRole(participant?.role)}</span>
          <span aria-hidden="true">·</span>
          <span className={online ? "text-green-500" : ""}>
            {online ? "Online" : "Offline"}
          </span>
        </p>
      </div>

      {realTime !== null && (
        <span
          className={`hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full border ${
            realTime && connected
              ? "text-green-500 border-green-500/30 bg-green-500/10"
              : "text-text-muted border-border-color bg-bg-secondary"
          }`}
          title={
            realTime && connected
              ? "Realtime messages enabled"
              : "Realtime unavailable - messages still sync over the API"
          }
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              realTime && connected ? "bg-green-500" : "bg-slate-400"
            }`}
          />
          {realTime && connected ? "Live" : "Offline"}
        </span>
      )}
    </header>
  );
}

function DaySeparator({ label }) {
  return (
    <div className="flex items-center gap-3 my-4" aria-hidden="true">
      <span className="flex-1 h-px bg-border-color" />
      <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
        {label}
      </span>
      <span className="flex-1 h-px bg-border-color" />
    </div>
  );
}

export default function ChatPanel({
  conversation,
  currentUserId,
  messages,
  error,
  hasMore,
  loadingOlder,
  onLoadOlder,
  onLoadFirstPage,
  draft,
  onDraftChange,
  onSend,
  sending,
  sendError,
  onRetryMessage,
  peerTyping,
  online,
  onBack,
  realTime,
  connected,
}) {
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const stickToBottomRef = useRef(true);
  const loadingOlderRef = useRef(false);
  const [awayFromBottom, setAwayFromBottom] = useState(false);

  const participant = conversation?.participants?.find(
    (item) => String(item._id) !== String(currentUserId)
  );

  const scrollToBottom = (behavior = "smooth") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
    stickToBottomRef.current = true;
    setAwayFromBottom(false);
  };

  const conversationId = conversation?._id;
  const loaded = messages !== null;
  const lastMessageId = messages?.length
    ? messages[messages.length - 1]._id
    : "";

  // Conversation switch / first page: start pinned to the newest message.
  useEffect(() => {
    if (!loaded) return;
    stickToBottomRef.current = true;
    requestAnimationFrame(() => scrollToBottom("auto"));
  }, [conversationId, loaded]);

  // A new message arrived: follow it only when the reader is near the bottom,
  // otherwise leave them where they are (the "new messages" affordance is
  // derived from `awayFromBottom` during render).
  useEffect(() => {
    if (!loaded || !stickToBottomRef.current) return;
    requestAnimationFrame(() => scrollToBottom("smooth"));
  }, [lastMessageId, loaded]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distanceFromBottom < NEAR_BOTTOM_PX;
    stickToBottomRef.current = nearBottom;
    setAwayFromBottom(!nearBottom);

    if (
      el.scrollTop < 60 &&
      hasMore &&
      !loadingOlder &&
      !loadingOlderRef.current &&
      messages?.length
    ) {
      loadingOlderRef.current = true;
      const previousHeight = el.scrollHeight;
      Promise.resolve(onLoadOlder())
        .then(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTop =
                  scrollRef.current.scrollHeight - previousHeight;
              }
              loadingOlderRef.current = false;
            });
          });
        })
        .catch(() => {
          loadingOlderRef.current = false;
        });
    }
  };

  // Auto-grow composer (Enter sends, Shift+Enter inserts a newline).
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [draft]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (draft.trim() && !sending) onSend();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (draft.trim() && !sending) onSend();
  };

  // ------------------------------------------------------------------ empty
  if (!conversation) {
    return (
      <div className="flex flex-col h-full min-h-0">
        <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center px-8">
          <div className="w-14 h-14 rounded-2xl bg-bg-secondary border border-border-color flex items-center justify-center mb-4">
            <MessageSquare size={24} className="text-accent-orange" />
          </div>
          <h2 className="text-base font-semibold text-text-primary">
            Select a conversation to start messaging
          </h2>
          <p className="text-sm text-text-muted mt-1 max-w-xs">
            Pick someone from the list or search for a user to open a chat.
          </p>
        </div>

        {/* Mobile empty state keeps a visible back affordance */}
        <div className="md:hidden flex items-center gap-2 px-3 py-3 border-b border-border-color">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to conversations"
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary"
          >
            <ArrowLeft size={18} />
          </button>
          <p className="text-sm font-semibold text-text-primary">Messaging</p>
        </div>
        <div className="md:hidden flex-1 flex flex-col items-center justify-center text-center px-8">
          <MessageSquare size={24} className="text-accent-orange mb-3" />
          <p className="text-sm font-medium text-text-primary">
            Select a conversation to start messaging
          </p>
        </div>
      </div>
    );
  }

  const lastOwnMessageId = [...(messages || [])]
    .reverse()
    .find((m) => String(m.senderId) === String(currentUserId))?._id;

  const dayFlags = computeDayFlags(messages || []);

  return (
    <div className="flex flex-col h-full min-h-0">
      <ChatHeader
        participant={participant}
        online={online}
        onBack={onBack}
        realTime={realTime}
        connected={connected}
      />

      {/* Message stream */}
      <div className="relative flex-1 min-h-0">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto px-3 md:px-4 py-4"
          role="log"
          aria-label="Message history"
        >
          {messages === null ? (
            <div className="h-full flex flex-col items-center justify-center text-text-muted">
              <Loader2 size={24} className="animate-spin mb-2" />
              <p className="text-xs">Loading conversation...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <AlertCircle size={24} className="text-red-500 mb-2" />
              <p className="text-sm font-medium text-text-primary">
                Couldn&apos;t load messages
              </p>
              <p className="text-xs text-text-muted mt-1">{error}</p>
              <button
                type="button"
                onClick={onLoadFirstPage}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-orange hover:underline"
              >
                <RefreshCw size={12} />
                Retry
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-bg-secondary border border-border-color flex items-center justify-center mb-3">
                <MessageSquare size={20} className="text-accent-orange" />
              </div>
              <p className="text-sm font-semibold text-text-primary">
                No messages yet
              </p>
              <p className="text-xs text-text-muted mt-1">
                Send the first message to {participant?.name || "this user"}.
              </p>
            </div>
          ) : (
            <>
              {hasMore && (
                <div className="flex justify-center pb-2">
                  <button
                    type="button"
                    onClick={onLoadOlder}
                    disabled={loadingOlder}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-text-muted hover:text-accent-orange px-3 py-1.5 rounded-full border border-border-color bg-bg-secondary disabled:opacity-60"
                  >
                    {loadingOlder ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : null}
                    Load earlier messages
                  </button>
                </div>
              )}

              {messages.map((message, index) => {
                const isMine =
                  String(message.senderId) === String(currentUserId);
                const showDay = dayFlags[index];

                return (
                  <div key={message._id}>
                    {showDay && <DaySeparator label={formatDaySeparator(message.createdAt)} />}
                    <div
                      className={`flex ${
                        isMine ? "justify-end" : "justify-start"
                      } mt-1`}
                    >
                      <div className="max-w-[85%] sm:max-w-[70%]">
                        <div
                          className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                            isMine
                              ? message.failed
                                ? "bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-300"
                                : "bg-accent-orange text-white rounded-br-md"
                              : "bg-bg-secondary border border-border-color text-text-primary rounded-bl-md"
                          } ${message.pending ? "opacity-70" : ""}`}
                        >
                          {message.content}
                        </div>

                        <div
                          className={`flex items-center gap-1.5 mt-1 text-[10px] text-text-muted ${
                            isMine ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span>{formatMessageTime(message.createdAt)}</span>
                          {isMine && message._id === lastOwnMessageId && (
                            <>
                              {message.pending ? (
                                <span>Sending...</span>
                              ) : message.failed ? (
                                <span className="text-red-500 font-semibold">
                                  Not sent
                                </span>
                              ) : message.isRead ? (
                                <span className="inline-flex items-center gap-1 text-accent-orange font-semibold">
                                  <CheckCheck size={12} aria-hidden="true" />
                                  Read
                                </span>
                              ) : (
                                <span>Delivered</span>
                              )}
                            </>
                          )}
                          {message.failed && (
                            <button
                              type="button"
                              onClick={() => onRetryMessage(message)}
                              className="inline-flex items-center gap-1 text-red-500 font-semibold hover:underline"
                            >
                              <RefreshCw size={11} aria-hidden="true" />
                              Retry
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {awayFromBottom && !!messages?.length && (
          <button
            type="button"
            onClick={() => scrollToBottom("smooth")}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-primary border border-border-color shadow-md text-[11px] font-semibold text-text-primary hover:border-accent-orange/40 transition-colors"
          >
            <ArrowDown size={13} aria-hidden="true" />
            New messages
          </button>
        )}
      </div>

      {/* Typing indicator (reserved row keeps the layout stable) */}
      <div className="h-6 px-4 flex items-center text-[11px] text-accent-orange flex-shrink-0">
        {peerTyping && (
          <span aria-live="polite">
            {participant?.name || "Someone"} is typing
            <span className="inline-flex ml-0.5">
              <span className="animate-bounce" style={{ animationDelay: "0ms" }}>
                .
              </span>
              <span className="animate-bounce" style={{ animationDelay: "150ms" }}>
                .
              </span>
              <span className="animate-bounce" style={{ animationDelay: "300ms" }}>
                .
              </span>
            </span>
          </span>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="px-3 md:px-4 pb-3 md:pb-4 pt-1 border-t border-border-color flex-shrink-0"
      >
        <div className="flex items-end gap-2">
          <label htmlFor="message-composer" className="sr-only">
            Message
          </label>
          <textarea
            id="message-composer"
            ref={textareaRef}
            rows={1}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 resize-none rounded-xl bg-bg-secondary border border-border-color px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-orange/50 max-h-32 overflow-y-auto"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            aria-label="Send message"
            className="shrink-0 w-10 h-10 rounded-xl bg-accent-orange hover:bg-accent-orange-hover disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
          >
            {sending ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Send size={17} />
            )}
          </button>
        </div>

        {sendError && (
          <p role="alert" className="text-xs text-red-500 mt-2">
            {sendError}
          </p>
        )}
        <p className="text-[10px] text-text-muted mt-2 hidden sm:block">
          Press Enter to send · Shift + Enter for a new line
        </p>
      </form>
    </div>
  );
}
