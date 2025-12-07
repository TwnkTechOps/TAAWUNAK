"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "lib/auth/useAuth";

export function useWebSocket(projectId?: string) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const apiBase = typeof window !== "undefined" 
    ? (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312").replace("http://", "ws://").replace("https://", "wss://")
    : "";

  useEffect(() => {
    if (!user) return;

    // Get auth token from cookies or localStorage
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1] || localStorage.getItem("token");

    if (!token) return;

    // Initialize socket connection
    const socketInstance = io(apiBase, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      setConnected(true);
      setSocket(socketInstance);

      // Join project room if projectId provided
      if (projectId) {
        socketInstance.emit("join-project", { projectId });
      }
    });

    socketInstance.on("disconnect", () => {
      setConnected(false);
    });

    socketInstance.on("new-message", (message: any) => {
      setMessages((prev) => [...prev, message]);
    });

    socketInstance.on("new-announcement", (announcement: any) => {
      setAnnouncements((prev) => [announcement, ...prev]);
    });

    socketInstance.on("notification", (notification: any) => {
      // Handle real-time notifications
      if (notification.userId === user.id) {
        // Trigger notification update
        window.dispatchEvent(new CustomEvent("new-notification", { detail: notification }));
      }
    });

    return () => {
      if (projectId) {
        socketInstance.emit("leave-project", { projectId });
      }
      socketInstance.disconnect();
    };
  }, [user, projectId, apiBase]);

  const sendMessage = (content: string, parentId?: string) => {
    if (socket && projectId && connected) {
      socket.emit("send-message", { projectId, content, parentId });
    }
  };

  const sendAnnouncement = (title: string, content: string, priority?: string) => {
    if (socket && projectId && connected) {
      socket.emit("send-announcement", { projectId, title, content, priority });
    }
  };

  return {
    socket,
    connected,
    messages,
    announcements,
    sendMessage,
    sendAnnouncement,
  };
}

