"use client";

import { useState, useEffect, useMemo } from "react";
import { Bell, X, Check, CheckCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "components/Card/Card";
import { Button } from "components/Button/Button";
import { useAuth } from "lib/auth/useAuth";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
};

export function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user) {
      // Load initial data
      loadNotifications().catch(() => {}); // Suppress errors
      loadUnreadCount().catch(() => {}); // Suppress errors
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        loadUnreadCount().catch(() => {}); // Suppress errors
        if (open) {
          loadNotifications().catch(() => {}); // Suppress errors
        }
      }, 30000);
      return () => clearInterval(interval);
    } else {
      // Reset when user logs out
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, open, apiBase]);

  async function loadNotifications() {
    try {
      const res = await fetch(`${apiBase}/notifications`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } else {
        // Silently handle non-ok responses
        setNotifications([]);
      }
    } catch (error) {
      // Silently handle network errors - don't break the UI
      setNotifications([]);
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.debug("Failed to load notifications:", error);
      }
    }
  }

  async function loadUnreadCount() {
    try {
      const res = await fetch(`${apiBase}/notifications/unread-count`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count || 0);
      } else {
        // Silently handle non-ok responses
        setUnreadCount(0);
      }
    } catch (error) {
      // Silently handle network errors - don't break the UI
      setUnreadCount(0);
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.debug("Failed to load unread count:", error);
      }
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      const res = await fetch(`${apiBase}/notifications/${notificationId}/read`, {
        method: "PATCH",
        credentials: "include"
      });
      if (res.ok) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? {...n, read: true} : n
        ));
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  }

  async function markAllAsRead() {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/notifications/mark-all-read`, {
        method: "POST",
        credentials: "include"
      });
      if (res.ok) {
        setNotifications(notifications.map(n => ({...n, read: true})));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteNotification(notificationId: string) {
    try {
      const res = await fetch(`${apiBase}/notifications/${notificationId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        setNotifications(notifications.filter(n => n.id !== notificationId));
        if (!notifications.find(n => n.id === notificationId)?.read) {
          setUnreadCount(Math.max(0, unreadCount - 1));
        }
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  }

  const typeColors: Record<string, string> = {
    PROJECT: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    PROPOSAL: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    TASK: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    DEADLINE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    SYSTEM: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    MESSAGE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-96 rounded-xl border bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
            <CardHeader className="flex items-center justify-between border-b">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    onClick={markAllAsRead}
                    disabled={loading}
                    className="text-xs"
                    intent="secondary"
                  >
                    <CheckCheck size={14} className="mr-1" />
                    Mark all read
                  </Button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={16} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                <div className="divide-y dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        !notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 text-xs rounded ${
                              typeColors[notification.type] || typeColors.SYSTEM
                            }`}>
                              {notification.type}
                            </span>
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-blue-500" />
                            )}
                          </div>
                          <div className="font-medium text-sm">{notification.title}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {notification.message}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                              title="Mark as read"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                            title="Delete"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                      {notification.link && (
                        <a
                          href={notification.link}
                          className="text-xs text-brand hover:underline mt-2 inline-block"
                        >
                          View →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </div>
        </>
      )}
    </div>
  );
}

