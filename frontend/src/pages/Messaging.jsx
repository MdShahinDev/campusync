import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, MessagesSquare, WifiOff, X } from "lucide-react";
import ConversationList from "../components/messaging/ConversationList";
import ChatPanel from "../components/messaging/ChatPanel";
import { useAuth } from "../context/AuthContext";
import { useMessaging } from "../context/MessagingContext";
import {
  messagingApi,
  newClientMessageId,
  otherParticipantOf,
} from "../services/messaging";

const MESSAGE_PAGE_SIZE = 30;
const TYPING_IDLE_MS = 1500;
const PEER_TYPING_TIMEOUT_MS = 4000;

const byActivity = (a, b) =>
  new Date(b.lastMessageAt || b.createdAt || 0).getTime() -
  new Date(a.lastMessageAt || a.createdAt || 0).getTime();

export default function Messaging() {
  const { user } = useAuth();
  const { socket, realTime, connected, setUnreadCount, emitAck } = useMessaging();
  const [searchParams, setSearchParams] = useSearchParams();

  // conversation list -------------------------------------------------------
  const [conversations, setConversations] = useState(null);
  const [listError, setListError] = useState("");
  const [notice, setNotice] = useState("");

  // search ------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const searchSeqRef = useRef(0);
  const searchTimerRef = useRef(null);

  // active conversation -----------------------------------------------------
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState(null);
  const [messagesError, setMessagesError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  // composer ----------------------------------------------------------------
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [peerTyping, setPeerTyping] = useState(false);

  const activeIdRef = useRef(null);
  const sendingRef = useRef(false);
  const sendTimerRef = useRef(null);
  const isTypingRef = useRef(false);
  const peerTypingTimerRef = useRef(null);
  const markReadRef = useRef(() => {});
  const loadMessagesRef = useRef(() => {});

  // --------------------------------------------------------------- data load
  const loadConversations = useCallback(() => {
    return messagingApi
      .conversations()
      .then((res) => {
        const items = res.data?.data?.conversations || [];
        setConversations(items);
        setListError("");
        return items;
      })
      .catch((error) => {
        setListError(
          error.response?.data?.message || "Unable to load conversations."
        );
        return null;
      });
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const loadMessages = useCallback(
    (conversationId, { before } = {}) => {
      return messagingApi
        .messages(conversationId, {
          before,
          limit: MESSAGE_PAGE_SIZE,
        })
        .then((res) => {
          if (activeIdRef.current !== String(conversationId)) return null;
          const data = res.data?.data || {};
          const page = data.messages || [];

          if (before) {
            setMessages((prev) => {
              const existing = prev || [];
              const seen = new Set(existing.map((m) => m._id));
              return [...page.filter((m) => !seen.has(m._id)), ...existing];
            });
          } else {
            setMessages(page);
            setMessagesError("");
          }
          setHasMore(!!data.hasMore);
          setNextCursor(data.nextCursor || null);
          return page;
        })
        .catch((error) => {
          if (activeIdRef.current !== String(conversationId)) return null;
          setMessagesError(
            error.response?.data?.message || "Unable to load messages."
          );
          return null;
        });
    },
    []
  );

  const loadOlder = useCallback(() => {
    if (!active || !hasMore || !nextCursor || loadingOlder) return Promise.resolve();
    setLoadingOlder(true);
    return loadMessages(active._id, { before: nextCursor }).finally(() =>
      setLoadingOlder(false)
    );
  }, [active, hasMore, nextCursor, loadingOlder, loadMessages]);

  loadMessagesRef.current = (conversationId, options) =>
    loadMessages(conversationId, options);

  // ------------------------------------------------------------- read receipts
  const markRead = useCallback(
    (conversation) => {
      if (!conversation?._id) return Promise.resolve();
      const unread = conversation.unreadCount || 0;
      if (unread <= 0) return Promise.resolve();

      const applyLocally = () => {
        setConversations((prev) =>
          prev
            ? prev.map((item) =>
                String(item._id) === String(conversation._id)
                  ? { ...item, unreadCount: 0 }
                  : item
              )
            : prev
        );
        setActive((prev) =>
          prev && String(prev._id) === String(conversation._id)
            ? { ...prev, unreadCount: 0 }
            : prev
        );
        if (!connected || !realTime) {
          setUnreadCount((prev) => Math.max(0, prev - unread));
        }
      };

      const request =
        connected && realTime
          ? emitAck("message:read", { conversationId: conversation._id }, 6000)
              .then((res) => {
                if (!res?.ok) throw new Error(res?.error || "Failed to mark read");
              })
              .catch(() => messagingApi.markRead(conversation._id))
          : messagingApi.markRead(conversation._id).then(() => {});

      return request.then(applyLocally).catch(() => {});
    },
    [connected, realTime, emitAck, setUnreadCount]
  );

  markReadRef.current = markRead;

  // -------------------------------------------------------------- selection
  const openConversation = useCallback(
    (conversation) => {
      if (!conversation?._id) return;
      const id = String(conversation._id);
      activeIdRef.current = id;
      if (sendTimerRef.current) {
        clearTimeout(sendTimerRef.current);
        sendTimerRef.current = null;
      }
      isTypingRef.current = false;
      setNotice("");
      setSendError("");
      setDraft("");
      setPeerTyping(false);
      setMessages(null);
      setMessagesError("");
      setHasMore(false);
      setNextCursor(null);
      setActive(conversation);
      setMobileChatOpen(true);

      setConversations((prev) => {
        if (!prev) return prev;
        const exists = prev.some((item) => String(item._id) === id);
        return exists
          ? prev.map((item) =>
              String(item._id) === id ? { ...item, ...conversation } : item
            )
          : [conversation, ...prev];
      });

      loadMessages(id);
      markRead(conversation);

      if (connected && realTime) {
        emitAck("conversation:join", { conversationId: id }, 6000).catch(
          () => {}
        );
      }
    },
    [loadMessages, markRead, connected, realTime, emitAck]
  );

  // Deep link: /x/messaging?user=<id> from the "Message" button.
  const targetUserId = searchParams.get("user");
  const targetConversationId = searchParams.get("conversation");

  useEffect(() => {
    if (!targetUserId || !user) return undefined;
    let cancelled = false;

    messagingApi
      .createConversation(targetUserId)
      .then((res) => {
        const conversation = res.data?.data?.conversation;
        if (cancelled || !conversation) return;
        setSearchParams({}, { replace: true });
        openConversation(conversation);
      })
      .catch((error) => {
        if (cancelled) return;
        setSearchParams({}, { replace: true });
        setNotice(
          error.response?.data?.message || "Unable to open that conversation."
        );
      });

    return () => {
      cancelled = true;
    };
  }, [targetUserId, user, openConversation, setSearchParams]);

  useEffect(() => {
    if (!targetConversationId || !user) return undefined;
    setSearchParams({}, { replace: true });
    messagingApi
      .conversations()
      .then((res) => {
        const found = (res.data?.data?.conversations || []).find(
          (item) => String(item._id) === String(targetConversationId)
        );
        if (found) openConversation(found);
        else setNotice("Conversation not found.");
      })
      .catch(() => setNotice("Unable to open that conversation."));
  }, [targetConversationId, user, openConversation, setSearchParams]);

  // ------------------------------------------------------------------ search
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (!value.trim()) {
      searchSeqRef.current += 1;
      setSearchResults(null);
      setSearching(false);
      return;
    }

    setSearching(true);
    const seq = ++searchSeqRef.current;
    searchTimerRef.current = setTimeout(() => {
      messagingApi
        .searchUsers(value.trim())
        .then((res) => {
          if (seq !== searchSeqRef.current) return;
          setSearchResults(res.data?.data?.users || []);
        })
        .catch(() => {
          if (seq !== searchSeqRef.current) return;
          setSearchResults([]);
        })
        .finally(() => {
          if (seq === searchSeqRef.current) setSearching(false);
        });
    }, 300);
  }, []);

  const handleSelect = useCallback(
    (item) => {
      if (!item) return;
      if (item.user) {
        setSearching(true);
        messagingApi
          .createConversation(item.user._id)
          .then((res) => {
            const conversation = res.data?.data?.conversation;
            if (conversation) {
              setSearchQuery("");
              setSearchResults(null);
              openConversation(conversation);
            }
          })
          .catch((error) => {
            setNotice(
              error.response?.data?.message || "Unable to start that conversation."
            );
          })
          .finally(() => setSearching(false));
        return;
      }
      openConversation(item);
    },
    [openConversation]
  );

  // ------------------------------------------------------------------- send
  const stopTyping = useCallback(() => {
    if (sendTimerRef.current) {
      clearTimeout(sendTimerRef.current);
      sendTimerRef.current = null;
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      if (socket && activeIdRef.current) {
        socket.emit("typing:stop", { conversationId: activeIdRef.current });
      }
    }
  }, [socket]);

  const handleDraftChange = useCallback(
    (value) => {
      setDraft(value);
      if (!socket || !connected || !activeIdRef.current) return;

      if (!isTypingRef.current) {
        isTypingRef.current = true;
        socket.emit("typing:start", { conversationId: activeIdRef.current });
      }

      if (sendTimerRef.current) clearTimeout(sendTimerRef.current);
      sendTimerRef.current = setTimeout(() => {
        sendTimerRef.current = null;
        isTypingRef.current = false;
        if (socket && activeIdRef.current) {
          socket.emit("typing:stop", { conversationId: activeIdRef.current });
        }
      }, TYPING_IDLE_MS);
    },
    [socket, connected]
  );

  /**
   * Core send path used by the composer and by Retry. Reusing the original
   * `clientMessageId` on retry keeps the operation idempotent: if the first
   * attempt actually reached the server, the API returns the stored message.
   */
  const sendMessageContent = useCallback(
    async (rawContent, existingClientMessageId) => {
      const content = String(rawContent || "").trim();
      if (!content || sending || !active) return;

      const conversationId = active._id;
      const receiver = otherParticipantOf(active, user?._id);
      const clientMessageId = existingClientMessageId || newClientMessageId();
      const optimistic = {
        _id: `local-${clientMessageId}`,
        clientMessageId,
        conversationId,
        senderId: user?._id,
        receiverId: receiver?._id,
        content,
        messageType: "text",
        createdAt: new Date().toISOString(),
        isRead: false,
        pending: true,
      };

      setMessages((prev) => [...(prev || []), optimistic]);
      setSendError("");
      setSending(true);
      sendingRef.current = true;
      stopTyping();

      const commit = (serverMessage) => {
        setMessages((prev) => {
          const list = prev || [];
          const withoutLocal = list.filter(
            (m) =>
              m._id !== optimistic._id &&
              !(m.clientMessageId === clientMessageId && m.pending)
          );
          if (
            serverMessage &&
            withoutLocal.some((m) => m._id === serverMessage._id)
          ) {
            return withoutLocal;
          }
          return serverMessage ? [...withoutLocal, serverMessage] : withoutLocal;
        });
        const lastMessage = {
          content,
          sender: user?._id,
          createdAt: serverMessage?.createdAt || optimistic.createdAt,
        };
        setActive((prev) =>
          prev && String(prev._id) === String(conversationId)
            ? {
                ...prev,
                lastMessage,
                lastMessageAt: lastMessage.createdAt,
              }
            : prev
        );
        setConversations((prev) =>
          prev
            ? prev
                .map((item) =>
                  String(item._id) === String(conversationId)
                    ? { ...item, lastMessage, lastMessageAt: lastMessage.createdAt }
                    : item
                )
                .sort(byActivity)
            : prev
        );
      };

      try {
        let serverMessage = null;
        if (connected && realTime) {
          const response = await emitAck(
            "message:send",
            { conversationId, content, clientMessageId },
            10000
          );
          if (!response?.ok) {
            throw new Error(response?.error || "Message was not sent.");
          }
          serverMessage = response.message;
        } else {
          const response = await messagingApi.send(
            conversationId,
            content,
            clientMessageId
          );
          serverMessage = response.data?.data?.message;
        }
        commit(serverMessage);
      } catch (error) {
        setMessages((prev) =>
          (prev || []).map((m) =>
            m._id === optimistic._id
              ? { ...m, pending: false, failed: true, error: error.message }
              : m
          )
        );
        setSendError(
          error.response?.data?.message ||
            error.message ||
            "Message failed to send."
        );
      } finally {
        setSending(false);
        sendingRef.current = false;
      }
    },
    [sending, active, user, connected, realTime, emitAck, stopTyping]
  );

  const handleMessageSend = useCallback(() => {
    const content = draft;
    if (!content.trim()) return;
    setDraft("");
    return sendMessageContent(content);
  }, [draft, sendMessageContent]);

  const handleRetryMessage = useCallback(
    (message) => {
      if (!message?.content) return;
      setMessages((prev) => (prev || []).filter((m) => m._id !== message._id));
      setSendError("");
      return sendMessageContent(message.content, message.clientMessageId);
    },
    [sendMessageContent]
  );

  // ------------------------------------------------------- realtime listeners
  useEffect(() => {
    if (!socket) return undefined;

    const onMessageNew = ({ message, conversation }) => {
      if (!message) return;
      const conversationId = String(message.conversationId);
      const isActive = activeIdRef.current === conversationId;

      if (conversation) {
        setConversations((prev) => {
          if (!prev) return [conversation];
          const index = prev.findIndex(
            (item) => String(item._id) === conversationId
          );
          if (index === -1) return [conversation, ...prev];
          const next = [...prev];
          next[index] = { ...next[index], ...conversation };
          return next.sort(byActivity);
        });
        setActive((prev) =>
          prev && String(prev._id) === conversationId
            ? { ...prev, ...conversation }
            : prev
        );
      }

      if (isActive) {
        setMessages((prev) => {
          if (!prev) return prev;
          if (prev.some((m) => m._id === message._id)) return prev;
          if (message.clientMessageId) {
            const optimisticIndex = prev.findIndex(
              (m) =>
                m.clientMessageId === message.clientMessageId &&
                (m.pending || m.failed)
            );
            if (optimisticIndex >= 0) {
              const next = [...prev];
              next[optimisticIndex] = message;
              return next;
            }
          }
          return [...prev, message];
        });

        const isMine = String(message.senderId) === String(user?._id);
        if (!isMine) {
          // `conversation` always ships with `message:new`; the fallback only
          // carries the id/unread hint needed to fire the read request.
          markReadRef.current(conversation || { _id: conversationId, unreadCount: 1 });
        }
      }
    };

    const onConversationNew = ({ conversation }) => {
      if (!conversation) return;
      setConversations((prev) => {
        if (!prev) return [conversation];
        if (prev.some((item) => String(item._id) === String(conversation._id))) {
          return prev;
        }
        return [conversation, ...prev].sort(byActivity);
      });
    };

    const onMessageRead = (payload) => {
      if (!payload) return;
      if (
        String(payload.conversationId) !== activeIdRef.current ||
        String(payload.readerId) === String(user?._id)
      ) {
        return;
      }
      setMessages((prev) =>
        prev
          ? prev.map((m) =>
              String(m.senderId) === String(user?._id)
                ? { ...m, isRead: true, readAt: payload.readAt }
                : m
            )
          : prev
      );
    };

    const onTypingStart = (payload) => {
      if (!payload) return;
      if (
        String(payload.conversationId) !== activeIdRef.current ||
        String(payload.user?._id) === String(user?._id)
      ) {
        return;
      }
      setPeerTyping(true);
      if (peerTypingTimerRef.current) clearTimeout(peerTypingTimerRef.current);
      peerTypingTimerRef.current = setTimeout(
        () => setPeerTyping(false),
        PEER_TYPING_TIMEOUT_MS
      );
    };

    const onTypingStop = (payload) => {
      if (!payload) return;
      if (
        String(payload.conversationId) !== activeIdRef.current ||
        (payload.user && String(payload.user._id) === String(user?._id))
      ) {
        return;
      }
      if (peerTypingTimerRef.current) clearTimeout(peerTypingTimerRef.current);
      setPeerTyping(false);
    };

    const onPresenceUpdate = (payload) => {
      if (!payload?.userId) return;
      const patch = (conversation) => {
        const other = otherParticipantOf(conversation, user?._id);
        return other && String(other._id) === String(payload.userId)
          ? { ...conversation, online: payload.online }
          : conversation;
      };
      setConversations((prev) =>
        prev ? prev.map(patch).sort(byActivity) : prev
      );
      setActive((prev) => (prev ? patch(prev) : prev));
    };

    const onConnect = () => {
      if (activeIdRef.current) {
        socket.emit(
          "conversation:join",
          { conversationId: activeIdRef.current },
          () => {}
        );
        loadMessagesRef.current(activeIdRef.current);
      }
      loadConversations();
    };

    socket.on("message:new", onMessageNew);
    socket.on("conversation:new", onConversationNew);
    socket.on("message:read", onMessageRead);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);
    socket.on("presence:update", onPresenceUpdate);
    socket.on("connect", onConnect);

    return () => {
      socket.off("message:new", onMessageNew);
      socket.off("conversation:new", onConversationNew);
      socket.off("message:read", onMessageRead);
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
      socket.off("presence:update", onPresenceUpdate);
      socket.off("connect", onConnect);
      if (peerTypingTimerRef.current) clearTimeout(peerTypingTimerRef.current);
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [socket, user?._id, loadConversations]);

  // Leave the conversation room when the selection changes or the page unmounts.
  useEffect(() => {
    const joinedId = activeIdRef.current;
    return () => {
      if (socket && joinedId) {
        socket.emit("conversation:leave", { conversationId: joinedId });
      }
    };
  }, [socket, active?._id]);

  const handleBack = () => {
    setMobileChatOpen(false);
    stopTyping();
    if (socket && activeIdRef.current) {
      socket.emit("conversation:leave", {
        conversationId: activeIdRef.current,
      });
    }
  };

  // ------------------------------------------------------------------- render
  return (
    <div className="flex flex-col h-[calc(100dvh-9.75rem)] md:h-[calc(100dvh-10.75rem)] lg:h-[calc(100dvh-11.75rem)] min-h-[440px]">
      <div className="flex items-start justify-between gap-4 mb-4 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Messaging</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Direct messages with students, moderators and admins.
          </p>
        </div>
        {realTime === false && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-text-muted px-2.5 py-1.5 rounded-full border border-border-color bg-bg-secondary">
            <WifiOff size={13} aria-hidden="true" />
            Realtime unavailable
          </span>
        )}
      </div>

      {notice && (
        <div
          role="status"
          className="mb-3 flex items-start gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2.5 text-sm text-text-primary"
        >
          <AlertCircle size={16} className="text-yellow-600 mt-0.5 shrink-0" />
          <span className="flex-1">{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss"
            className="p-1 rounded-md text-text-muted hover:text-text-primary"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="glass-card rounded-2xl overflow-hidden border border-border-color flex flex-1 min-h-0 shadow-sm">
        <div
          className={`${
            mobileChatOpen ? "hidden md:flex" : "flex"
          } w-full md:w-[300px] lg:w-[330px] flex-shrink-0 flex-col min-h-0 md:border-r border-border-color`}
        >
          <ConversationList
            conversations={conversations}
            listError={listError}
            activeId={active?._id}
            currentUserId={user?._id}
            onSelect={handleSelect}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            searchResults={searchResults}
            searching={searching}
            onRetry={() => {
              setListError("");
              setConversations(null);
              loadConversations();
            }}
          />
        </div>

        <div
          className={`${
            mobileChatOpen ? "flex" : "hidden md:flex"
          } flex-1 min-w-0 flex-col min-h-0`}
        >
          <ChatPanel
            conversation={active}
            currentUserId={user?._id}
            messages={messages}
            error={messagesError}
            hasMore={hasMore}
            loadingOlder={loadingOlder}
            onLoadOlder={loadOlder}
            onLoadFirstPage={() => active && loadMessages(active._id)}
            draft={draft}
            onDraftChange={handleDraftChange}
            onSend={handleMessageSend}
            sending={sending}
            sendError={sendError}
            onRetryMessage={handleRetryMessage}
            peerTyping={peerTyping}
            online={!!active?.online}
            onBack={handleBack}
            realTime={realTime}
            connected={connected}
          />
        </div>
      </div>

      {!mobileChatOpen && conversations && conversations.length === 0 && (
        <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
          <MessagesSquare size={14} aria-hidden="true" />
          Start a conversation from any user&apos;s profile with the Message
          button, or search above.
        </div>
      )}
    </div>
  );
}
