import { Loader2, MessageSquare, Search, UserX, X, AlertCircle } from "lucide-react";
import {
  displayRole,
  formatListTime,
  initials,
  otherParticipantOf,
} from "../../services/messaging";

function OnlineDot({ online, className = "" }) {
  if (!online) return null;
  return (
    <span
      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-bg-primary ${className}`}
      title="Online"
    >
      <span className="sr-only">Online</span>
    </span>
  );
}

function Avatar({ participant, online }) {
  return (
    <div className="relative shrink-0">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-orange to-accent-orange-hover flex items-center justify-center text-white text-xs font-bold">
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
      <OnlineDot online={online} />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-3 py-3 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-bg-tertiary" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/2 rounded bg-bg-tertiary" />
        <div className="h-3 w-3/4 rounded bg-bg-tertiary" />
      </div>
    </div>
  );
}

export default function ConversationList({
  conversations,
  listError,
  activeId,
  currentUserId,
  onSelect,
  searchQuery,
  onSearchChange,
  searchResults,
  searching,
  onRetry,
}) {
  const searchingMode = searchQuery.trim().length > 0;

  const renderConversation = (conversation) => {
    const participant = otherParticipantOf(conversation, currentUserId);
    const isActive = String(conversation._id) === String(activeId);
    const unread = conversation.unreadCount || 0;
    const preview = conversation.lastMessage?.content;

    return (
      <button
        key={conversation._id}
        type="button"
        onClick={() => onSelect(conversation)}
        aria-current={isActive ? "true" : undefined}
        className={`w-full text-left flex items-start gap-3 px-3 py-3 rounded-xl border transition-colors focus-visible:outline-2 focus-visible:outline-accent-orange ${
          isActive
            ? "bg-accent-orange/10 border-accent-orange/30"
            : "bg-transparent border-transparent hover:bg-bg-secondary"
        }`}
      >
        <Avatar participant={participant} online={conversation.online} />

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-text-primary truncate">
              {participant?.name || "Unknown user"}
            </span>
            <span className="text-[10px] text-text-muted shrink-0">
              {formatListTime(
                conversation.lastMessage?.createdAt || conversation.lastMessageAt
              )}
            </span>
          </div>

          <p className="text-[11px] text-text-muted capitalize">
            {displayRole(participant?.role)}
          </p>

          <div className="flex items-center justify-between gap-2 mt-1">
            <p
              className={`text-xs truncate ${
                unread > 0 ? "text-text-primary font-medium" : "text-text-muted"
              }`}
            >
              {preview ? preview : <span className="italic">No messages yet</span>}
            </p>
            {unread > 0 && (
              <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-accent-orange text-white text-[9px] font-bold flex items-center justify-center">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </div>
        </div>
      </button>
    );
  };

  const renderSearchResult = (result) => (
    <button
      key={result._id}
      type="button"
      onClick={() => onSelect({ user: result })}
      className="w-full text-left flex items-start gap-3 px-3 py-3 rounded-xl border border-transparent transition-colors hover:bg-bg-secondary focus-visible:outline-2 focus-visible:outline-accent-orange"
    >
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-xl bg-bg-tertiary border border-border-color flex items-center justify-center text-text-secondary text-xs font-bold">
          {result.avatar ? (
            <img
              src={result.avatar}
              alt=""
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            initials(result.name)
          )}
        </div>
        <OnlineDot online={result.online} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold text-text-primary truncate">
            {result.name}
          </span>
          <span className="text-[10px] text-accent-orange shrink-0">Message</span>
        </div>
        <p className="text-[11px] text-text-muted capitalize">
          {displayRole(result.role)}
        </p>
        <p className="text-xs text-text-muted truncate mt-1">
          @{result.username || "user"}
        </p>
      </div>
    </button>
  );

  let body;

  if (searchingMode) {
    if (searching) {
      body = (
        <div className="px-3 py-3 space-y-3">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      );
    } else if (searchResults && searchResults.length === 0) {
      body = (
        <div className="px-4 py-10 text-center">
          <UserX size={26} className="mx-auto text-text-muted mb-2" />
          <p className="text-sm font-medium text-text-primary">No users found</p>
          <p className="text-xs text-text-muted mt-1">
            Try a different name or username.
          </p>
        </div>
      );
    } else {
      body = (
        <div className="px-1 py-1 space-y-0.5">
          {(searchResults || []).map(renderSearchResult)}
        </div>
      );
    }
  } else if (listError) {
    body = (
      <div className="px-4 py-10 text-center">
        <AlertCircle size={26} className="mx-auto text-red-500 mb-2" />
        <p className="text-sm font-medium text-text-primary">
          Couldn&apos;t load conversations
        </p>
        <p className="text-xs text-text-muted mt-1">{listError}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 text-xs font-semibold text-accent-orange hover:underline"
        >
          Try again
        </button>
      </div>
    );
  } else if (conversations === null) {
    body = (
      <div className="px-3 py-3 space-y-3">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  } else if (conversations.length === 0) {
    body = (
      <div className="px-4 py-10 text-center">
        <MessageSquare size={26} className="mx-auto text-text-muted mb-2" />
        <p className="text-sm font-medium text-text-primary">
          No conversations yet
        </p>
        <p className="text-xs text-text-muted mt-1">
          Search for a user above to start messaging.
        </p>
      </div>
    );
  } else {
    body = (
      <div className="px-1 py-1 space-y-0.5">
        {conversations.map(renderConversation)}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-bg-primary">
      <div className="p-3 border-b border-border-color">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search users..."
            aria-label="Search users by name, username or email"
            className="w-full pl-9 pr-8 py-2 rounded-lg bg-bg-secondary border border-border-color text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-orange/50"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-tertiary"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {!searchingMode && conversations && conversations.length > 0 && (
          <p className="mt-2 text-[10px] text-text-muted uppercase tracking-wider">
            {conversations.length} conversation
            {conversations.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">{body}</div>

      {searching && searchingMode && (
        <div className="px-3 py-2 border-t border-border-color flex items-center gap-2 text-[10px] text-text-muted">
          <Loader2 size={12} className="animate-spin" />
          Searching...
        </div>
      )}
    </div>
  );
}
