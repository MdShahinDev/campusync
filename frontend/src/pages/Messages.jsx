import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Send,
  ArrowLeft,
  MessageCircle,
  Paperclip,
  Image,
  FileText,
  X,
  Loader2,
} from "lucide-react";
import api from "../services/axios";
import { useAuth } from "../context/AuthContext";

function formatTime(date) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getRoleBadgeStyle(role) {
  switch (role) {
    case "admin":
      return "bg-red-500/10 text-red-500";
    case "moderator":
      return "bg-blue-500/10 text-blue-500";
    default:
      return "bg-green-500/10 text-green-500";
  }
}

function getFileIcon(type) {
  if (type?.startsWith("image/"))
    return <Image size={16} className="text-blue-500" />;
  if (type?.includes("pdf"))
    return <FileText size={16} className="text-red-500" />;
  return <FileText size={16} className="text-orange-500" />;
}

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [pagination, setPagination] = useState({ hasMore: false, page: 1 });
  const [loadingMore, setLoadingMore] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!mountedRef.current) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await api.get("/messages/conversations");
      if (mountedRef.current) {
        setConversations(res.data.data.conversations);
      }
    } catch (error) {
      if (error.response?.status === 401) return;
      console.error("Failed to fetch conversations:", error);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (!token || !mountedRef.current) return;

      fetchConversations();
      if (selectedConversation) {
        fetchMessages(selectedConversation._id, 1, false);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [selectedConversation, fetchConversations]);

  const fetchMessages = async (conversationId, page = 1, prepend = false) => {
    try {
      if (!prepend) setMessagesLoading(true);
      else setLoadingMore(true);

      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await api.get(
        `/messages/conversations/${conversationId}?page=${page}&limit=50`
      );

      if (!mountedRef.current) return;

      const newMessages = res.data.data.messages;
      const paginationData = res.data.data.pagination;

      if (prepend) {
        setMessages((prev) => [...newMessages, ...prev]);
      } else {
        setMessages(newMessages);
      }
      setPagination(paginationData);

      if (!prepend) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        }, 50);
      }
    } catch (error) {
      if (error.response?.status === 401) return;
      console.error("Failed to fetch messages:", error);
    } finally {
      if (mountedRef.current) {
        setMessagesLoading(false);
        setLoadingMore(false);
      }
    }
  };

  const loadMoreMessages = async () => {
    if (!selectedConversation || !pagination.hasMore || loadingMore) return;
    await fetchMessages(selectedConversation._id, pagination.page + 1, true);
  };

  const handleSelectConversation = async (conv) => {
    setSelectedConversation(conv);
    setShowMobileChat(true);
    await fetchMessages(conv._id, 1);

    try {
      await api.put(`/messages/conversations/${conv._id}/read`);
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conv._id ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && attachments.length === 0) || sending) return;

    const content = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      const payload = { content, attachments };
      const res = await api.post(
        `/messages/conversations/${selectedConversation._id}/messages`,
        payload
      );

      setMessages((prev) => [...prev, res.data.data.message]);
      setAttachments([]);

      await api.put(`/messages/conversations/${selectedConversation._id}/read`);

      setConversations((prev) =>
        prev.map((c) =>
          c._id === selectedConversation._id
            ? {
                ...c,
                lastMessage: content || "[Attachment]",
                lastMessageAt: new Date().toISOString(),
              }
            : c
        )
      );

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } catch (error) {
      console.error("Failed to send message:", error);
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert("File size must be less than 25MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/messages/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAttachments((prev) => [...prev, res.data.data.attachment]);
    } catch (error) {
      console.error("Failed to upload file:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      conv.otherUser?.name?.toLowerCase().includes(term) ||
      conv.otherUser?.username?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={32} className="animate-spin text-accent-orange" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div
        className="bg-bg-primary border border-border-color rounded-2xl overflow-hidden flex"
        style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}
      >
        {/* Conversation List Panel */}
        <div
          className={`${
            showMobileChat ? "hidden md:flex" : "flex"
          } flex-col w-full md:w-80 lg:w-96 border-r border-border-color`}
        >
          {/* Header */}
          <div className="px-4 py-4 border-b border-border-color shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold text-text-primary">Messages</h1>
              {conversations.reduce((sum, c) => sum + c.unreadCount, 0) > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-accent-orange text-white text-xs font-bold">
                  {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
                </span>
              )}
            </div>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                <MessageCircle size={48} className="text-text-muted mb-4" />
                <p className="text-text-muted text-sm">
                  {searchTerm
                    ? "No conversations found"
                    : "No conversations yet."}
                </p>
                {!searchTerm && (
                  <p className="text-text-muted text-xs mt-1">
                    Visit a user's profile and click Message to start a
                    conversation.
                  </p>
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-bg-secondary transition-colors border-b border-border-color text-left ${
                    selectedConversation?._id === conv._id
                      ? "bg-bg-secondary"
                      : ""
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent-orange to-accent-orange-hover flex items-center justify-center text-white font-bold text-sm">
                      {conv.otherUser?.avatar ? (
                        <img
                          src={conv.otherUser.avatar}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        conv.otherUser?.name?.charAt(0)?.toUpperCase() || "U"
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-orange text-white text-[10px] font-bold flex items-center justify-center">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold truncate text-text-primary">
                        {conv.otherUser?.name || "Unknown"}
                      </span>
                      <span className="text-[10px] text-text-muted shrink-0 ml-2">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize ${getRoleBadgeStyle(
                          conv.otherUser?.role
                        )}`}
                      >
                        {conv.otherUser?.role || "student"}
                      </span>
                    </div>
                    <p
                      className={`text-xs mt-0.5 truncate ${
                        conv.unreadCount > 0
                          ? "text-text-primary font-medium"
                          : "text-text-muted"
                      }`}
                    >
                      {conv.lastMessage || "Start a conversation"}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div
          className={`${
            showMobileChat ? "flex" : "hidden md:flex"
          } flex-col flex-1 min-w-0`}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header - Fixed */}
              <div className="px-4 py-3 border-b border-border-color flex items-center gap-3 bg-bg-primary shrink-0">
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden p-1 rounded-lg hover:bg-bg-secondary text-text-muted"
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  onClick={() =>
                    navigate(
                      `/user/${selectedConversation.otherUser?.username}`
                    )
                  }
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-orange to-accent-orange-hover flex items-center justify-center text-white font-bold text-sm">
                    {selectedConversation.otherUser?.avatar ? (
                      <img
                        src={selectedConversation.otherUser.avatar}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      selectedConversation.otherUser?.name
                        ?.charAt(0)
                        ?.toUpperCase() || "U"
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-text-primary leading-tight">
                      {selectedConversation.otherUser?.name || "Unknown"}
                    </p>
                    <p className="text-[10px] text-text-muted capitalize">
                      {selectedConversation.otherUser?.role || "student"}
                    </p>
                  </div>
                </button>
              </div>

              {/* Messages - Scrollable */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0"
              >
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2
                      size={24}
                      className="animate-spin text-accent-orange"
                    />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageCircle
                      size={48}
                      className="text-text-muted mb-4"
                    />
                    <p className="text-text-muted text-sm">
                      Start the conversation
                    </p>
                    <p className="text-text-muted text-xs mt-1">
                      Send a message to{" "}
                      {selectedConversation.otherUser?.name}.
                    </p>
                  </div>
                ) : (
                  <>
                    {pagination.hasMore && (
                      <div className="text-center">
                        <button
                          onClick={loadMoreMessages}
                          disabled={loadingMore}
                          className="text-xs text-accent-orange hover:underline disabled:opacity-50"
                        >
                          {loadingMore
                            ? "Loading..."
                            : "Load older messages"}
                        </button>
                      </div>
                    )}
                    {messages.map((msg, idx) => {
                      const isOwn =
                        msg.senderId?._id === user?._id ||
                        msg.senderId === user?._id;
                      const showAvatar =
                        idx === 0 ||
                        messages[idx - 1]?.senderId?._id !==
                          msg.senderId?._id;

                      return (
                        <div
                          key={msg._id}
                          className={`flex ${
                            isOwn ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div className="max-w-[75%]">
                            {!isOwn && showAvatar && (
                              <p className="text-[10px] text-text-muted mb-1 ml-1">
                                {msg.senderId?.name || "Unknown"}
                              </p>
                            )}
                            <div
                              className={`rounded-2xl px-4 py-2.5 ${
                                isOwn
                                  ? "bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white"
                                  : "bg-bg-secondary text-text-primary border border-border-color"
                              }`}
                            >
                              {msg.content && (
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {msg.content}
                                </p>
                              )}
                              {msg.attachments?.length > 0 && (
                                <div className="mt-2 space-y-2">
                                  {msg.attachments.map((att) => (
                                    <div key={att._id || att.url}>
                                      {att.fileType?.startsWith("image/") ? (
                                        <a
                                          href={att.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <img
                                            src={att.url}
                                            alt={att.fileName}
                                            className="rounded-lg max-w-full max-h-60 object-cover"
                                          />
                                        </a>
                                      ) : (
                                        <a
                                          href={att.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`flex items-center gap-2 p-2 rounded-lg ${
                                            isOwn
                                              ? "bg-white/20"
                                              : "bg-bg-primary"
                                          }`}
                                        >
                                          {getFileIcon(att.fileType)}
                                          <span className="text-xs truncate">
                                            {att.fileName}
                                          </span>
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <p
                              className={`text-[10px] text-text-muted mt-1 ${
                                isOwn ? "text-right mr-1" : "ml-1"
                              }`}
                            >
                              {formatMessageTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Attachment Preview */}
              {attachments.length > 0 && (
                <div className="px-4 py-2 border-t border-border-color flex gap-2 flex-wrap shrink-0">
                  {attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-secondary border border-border-color text-sm"
                    >
                      {getFileIcon(att.fileType)}
                      <span className="text-text-primary text-xs truncate max-w-[120px]">
                        {att.fileName}
                      </span>
                      <button
                        onClick={() => removeAttachment(idx)}
                        className="text-text-muted hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Message Input - Fixed */}
              <div className="px-4 py-3 border-t border-border-color bg-bg-primary shrink-0">
                <div className="flex items-end gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.pptx,.docx,.doc,.txt"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="p-2.5 rounded-xl text-text-muted hover:text-accent-orange hover:bg-bg-secondary transition-colors shrink-0 disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Paperclip size={18} />
                    )}
                  </button>
                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      rows={1}
                      className="w-full px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/30 resize-none max-h-32"
                      style={{
                        height: "auto",
                        minHeight: "42px",
                      }}
                      onInput={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height =
                          Math.min(e.target.scrollHeight, 128) + "px";
                      }}
                    />
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={
                      (!newMessage.trim() && attachments.length === 0) ||
                      sending
                    }
                    className="p-2.5 rounded-xl bg-gradient-to-r from-[#FF8A00] via-[#FF7B00] to-[#FF6B00] text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 disabled:opacity-50 disabled:shadow-none transition-all shrink-0"
                  >
                    {sending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 rounded-2xl bg-accent-orange/10 flex items-center justify-center mb-6">
                <MessageCircle size={40} className="text-accent-orange" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">
                Welcome to Messages
              </h2>
              <p className="text-text-muted text-sm max-w-sm">
                Select a conversation from the left to start chatting, or visit
                a user's profile and click the Message button.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
