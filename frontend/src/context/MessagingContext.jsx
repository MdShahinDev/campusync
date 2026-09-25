import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { messagingApi } from "../services/messaging";

const MessagingContext = createContext(null);

/** VITE_API_URL looks like http://localhost:5000/api -> http://localhost:5000 */
function apiOrigin() {
  const base = import.meta.env.VITE_API_URL || "";
  if (/^https?:\/\//.test(base)) return base.replace(/\/api\/?$/, "");
  return window.location.origin;
}

/**
 * Owns the single Socket.IO connection and the authenticated user's unread
 * message total, so every dashboard (sidebar badge + messaging page) shares
 * one source of truth instead of opening duplicate sockets or caches.
 *
 * The socket is only created when the backend reports realtime support
 * (`GET /api/messages/config`) and a session token exists; on serverless
 * hosts the REST API stays fully functional without it.
 */
export function MessagingProvider({ children }) {
  const { user, loading } = useAuth();
  const [socket, setSocket] = useState(null);
  const [realTime, setRealTime] = useState(null);
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  const refreshUnread = useCallback(() => {
    return messagingApi
      .unreadCount()
      .then((res) => {
        const total = res.data?.data?.unreadCount;
        if (typeof total === "number") setUnreadCount(total);
        return total;
      })
      .catch(() => null);
  }, []);

  // Capability + initial badge value for the signed in user.
  useEffect(() => {
    if (loading) return undefined;

    if (!user) {
      // Deferred to a microtask so the effect body never mutates state
      // synchronously; cancelled if a user signs in again right away.
      let cancelled = false;
      Promise.resolve().then(() => {
        if (cancelled) return;
        setRealTime(null);
        setUnreadCount(0);
      });
      return () => {
        cancelled = true;
      };
    }

    let cancelled = false;
    messagingApi
      .config()
      .then((res) => {
        if (!cancelled) setRealTime(!!res.data?.data?.realTime);
      })
      .catch(() => {
        if (!cancelled) setRealTime(false);
      });
    refreshUnread();

    return () => {
      cancelled = true;
    };
  }, [user, loading, refreshUnread]);

  // Single socket per session, torn down on logout.
  useEffect(() => {
    if (loading || !user || realTime !== true) return undefined;

    const token = localStorage.getItem("token");
    if (!token) return undefined;

    const nextSocket = io(apiOrigin(), {
      path: "/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 800,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    nextSocket.on("connect", () => {
      setConnected(true);
      setSocket(nextSocket);
    });
    nextSocket.on("disconnect", () => setConnected(false));
    nextSocket.on("unread:update", (payload) => {
      if (payload && typeof payload.total === "number") {
        setUnreadCount(payload.total);
      }
    });

    // After a reconnect the badge is re-synced from the source of truth.
    nextSocket.io.on("reconnect", () => {
      refreshUnread();
    });

    socketRef.current = nextSocket;

    return () => {
      nextSocket.removeAllListeners();
      nextSocket.io.removeAllListeners();
      nextSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    };
  }, [user, loading, realTime, refreshUnread]);

  const emitAck = useCallback(
    (event, payload, timeout = 8000) =>
      new Promise((resolve, reject) => {
        if (!socketRef.current || !socketRef.current.connected) {
          reject(new Error("Realtime connection unavailable"));
          return;
        }
        let settled = false;
        const timer = setTimeout(() => {
          if (!settled) {
            settled = true;
            reject(new Error("Request timed out"));
          }
        }, timeout);
        socketRef.current.emit(event, payload, (response) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve(response);
        });
      }),
    []
  );

  const value = useMemo(
    () => ({
      socket,
      realTime,
      connected,
      unreadCount,
      setUnreadCount,
      refreshUnread,
      emitAck,
    }),
    [socket, realTime, connected, unreadCount, refreshUnread, emitAck]
  );

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMessaging() {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error("useMessaging must be used within a MessagingProvider");
  }
  return context;
}
