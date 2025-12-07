"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, X, Check } from "lucide-react";
import { Button } from "components/Button/Button";
import { useWebSocket } from "lib/websocket/useWebSocket";

export function CommunicationTab({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);
  const [messages, setMessages] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<"messages" | "announcements">("messages");
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementPriority, setAnnouncementPriority] = useState("NORMAL");

  // Use WebSocket for real-time updates
  const { socket, connected, messages: wsMessages, announcements: wsAnnouncements, sendMessage: wsSendMessage, sendAnnouncement: wsSendAnnouncement } = useWebSocket(projectId);

  useEffect(() => {
    loadMessages();
    loadAnnouncements();
  }, [projectId, apiBase]);

  // Update messages from WebSocket
  useEffect(() => {
    if (wsMessages.length > 0) {
      setMessages(wsMessages);
    }
  }, [wsMessages]);

  // Update announcements from WebSocket
  useEffect(() => {
    if (wsAnnouncements.length > 0) {
      setAnnouncements(wsAnnouncements);
    }
  }, [wsAnnouncements]);

  async function loadMessages() {
    try {
      const res = await fetch(`${apiBase}/projects/${projectId}/communication/messages`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  }

  async function loadAnnouncements() {
    try {
      const res = await fetch(`${apiBase}/projects/${projectId}/communication/announcements`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error("Failed to load announcements:", error);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    // Use WebSocket if connected, otherwise fallback to HTTP
    if (connected && socket) {
      wsSendMessage(messageText);
      setMessageText("");
    } else {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/projects/${projectId}/communication/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: messageText }),
        });
        if (res.ok) {
          setMessageText("");
          loadMessages();
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      } finally {
        setLoading(false);
      }
    }
  }

  async function createAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    
    // Use WebSocket if connected, otherwise fallback to HTTP
    if (connected && socket) {
      wsSendAnnouncement(announcementTitle, announcementContent, announcementPriority);
      setAnnouncementDialogOpen(false);
      setAnnouncementTitle("");
      setAnnouncementContent("");
      setAnnouncementPriority("NORMAL");
    } else {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/projects/${projectId}/communication/announcements`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: announcementTitle,
            content: announcementContent,
            priority: announcementPriority,
          }),
        });
        if (res.ok) {
          setAnnouncementDialogOpen(false);
          setAnnouncementTitle("");
          setAnnouncementContent("");
          setAnnouncementPriority("NORMAL");
          loadAnnouncements();
        }
      } catch (error) {
        console.error("Failed to create announcement:", error);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b dark:border-gray-700">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveView("messages")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeView === "messages"
                ? "border-brand text-brand"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Messages {connected && <span className="ml-1 text-xs text-emerald-500">●</span>}
          </button>
          <button
            onClick={() => setActiveView("announcements")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeView === "announcements"
                ? "border-brand text-brand"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Announcements
          </button>
        </div>
        {canEdit && activeView === "announcements" && (
          <Button onClick={() => setAnnouncementDialogOpen(true)} className="inline-flex items-center gap-2">
            <Plus size={16} /> New Announcement
          </Button>
        )}
      </div>

      {activeView === "messages" && (
        <div className="space-y-4">
          <div className="border rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto dark:border-gray-700">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No messages yet</div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="border-b pb-3 last:border-0 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-1">
                    <div className="font-medium text-sm">{msg.user?.fullName || "Unknown"}</div>
                    <div className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{msg.content}</div>
                </div>
              ))
            )}
          </div>
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 dark:border-gray-700 dark:bg-gray-800"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !messageText.trim()}>
              Send
            </Button>
          </form>
        </div>
      )}

      {activeView === "announcements" && (
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No announcements yet</div>
          ) : (
            announcements.map((ann) => (
              <div key={ann.id} className="border rounded-lg p-4 dark:border-gray-700">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold">{ann.title}</div>
                    <div className="text-xs text-gray-500">
                      {ann.user?.fullName || "Unknown"} • {new Date(ann.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    ann.priority === "URGENT" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
                    ann.priority === "HIGH" ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" :
                    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                  }`}>
                    {ann.priority}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{ann.content}</div>
              </div>
            ))
          )}
        </div>
      )}

      {announcementDialogOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setAnnouncementDialogOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-white p-5 shadow-lg dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-base font-semibold">New Announcement</div>
              <button
                onClick={() => setAnnouncementDialogOpen(false)}
                className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={createAnnouncement} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Title *</label>
                <input
                  type="text"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Content *</label>
                <textarea
                  value={announcementContent}
                  onChange={(e) => setAnnouncementContent(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Priority</label>
                <select
                  value={announcementPriority}
                  onChange={(e) => setAnnouncementPriority(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAnnouncementDialogOpen(false)}
                  className="rounded border px-3 py-1.5 text-sm dark:border-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1 rounded bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  <Check size={16} /> Create
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

