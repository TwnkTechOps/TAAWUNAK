"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseCardContent } from "components/Card";
import { Button } from "components/Button/Button";
import { MessageCircle, Users, Send, Search, Plus } from "lucide-react";
import { motion } from "framer-motion";

function MessagingPage() {
  const { user, loading } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageContent, setMessageContent] = useState("");
  const [groupChats, setGroupChats] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"direct" | "groups">("direct");
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (!user) return;
    loadConversations();
    loadGroupChats();
  }, [user, apiBase]);

  const loadConversations = async () => {
    try {
      const res = await fetch(`${apiBase}/messaging/direct/conversations`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        const conversationsData = Array.isArray(data) 
          ? data 
          : (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data))
            ? data.data
            : [];
        setConversations(conversationsData);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
      setConversations([]);
    }
  };

  const loadGroupChats = async () => {
    try {
      const res = await fetch(`${apiBase}/messaging/groups`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        const groupChatsData = Array.isArray(data) 
          ? data 
          : (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data))
            ? data.data
            : [];
        setGroupChats(groupChatsData);
      } else {
        setGroupChats([]);
      }
    } catch (error) {
      console.error("Failed to load group chats:", error);
      setGroupChats([]);
    }
  };

  const loadMessages = async (userId: string) => {
    try {
      const res = await fetch(`${apiBase}/messaging/direct/${userId}?limit=50`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        const messagesData = Array.isArray(data) 
          ? data 
          : (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data))
            ? data.data
            : [];
        setMessages(messagesData);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!messageContent.trim() || !selectedConversation) return;

    try {
      const res = await fetch(`${apiBase}/messaging/direct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          receiverId: selectedConversation,
          content: messageContent,
          encrypted: true
        })
      });

      if (res.ok) {
        setMessageContent("");
        loadMessages(selectedConversation);
        loadConversations();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Messages</h1>
        <p className="text-gray-600 dark:text-gray-400">Communicate with your team and collaborators</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Sidebar - Conversations/Group Chats */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="flex gap-2 mb-4">
            <Button
              intent={activeTab === "direct" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setActiveTab("direct")}
              className="flex-1"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Direct
            </Button>
            <Button
              intent={activeTab === "groups" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setActiveTab("groups")}
              className="flex-1"
            >
              <Users className="h-4 w-4 mr-2" />
              Groups
            </Button>
          </div>

          <EnterpriseCard variant="default" className="flex-1 overflow-hidden flex flex-col">
            <EnterpriseCardHeader>
              <div className="flex items-center justify-between">
                <EnterpriseCardTitle className="text-lg">Conversations</EnterpriseCardTitle>
                {activeTab === "groups" && (
                  <Button size="sm" intent="secondary">
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </EnterpriseCardHeader>
            <EnterpriseCardContent className="flex-1 overflow-y-auto">
              {activeTab === "direct" ? (
                <div className="space-y-2">
                  {conversations.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">No conversations yet</p>
                  ) : (
                    conversations.map((conv) => (
                      <motion.div
                        key={conv.userId}
                        onClick={() => {
                          setSelectedConversation(conv.userId);
                          loadMessages(conv.userId);
                        }}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedConversation === conv.userId
                            ? "bg-brand-50 dark:bg-brand-900/20"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-semibold">
                            {conv.user?.fullName?.charAt(0) || "U"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {conv.user?.fullName || conv.user?.email}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                          </div>
                          {conv.unreadCount > 0 && (
                            <span className="bg-brand-500 text-white text-xs rounded-full px-2 py-1">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {groupChats.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">No group chats yet</p>
                  ) : (
                    groupChats.map((chat) => (
                      <div
                        key={chat.id}
                        className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-emerald-500 text-white flex items-center justify-center font-semibold">
                            {chat.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{chat.name}</p>
                            <p className="text-xs text-gray-500">
                              {chat._count?.messages || 0} messages
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </EnterpriseCardContent>
          </EnterpriseCard>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-2 flex flex-col">
          <EnterpriseCard variant="default" className="flex-1 flex flex-col overflow-hidden">
            {selectedConversation ? (
              <>
                <EnterpriseCardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-semibold">
                      {conversations.find(c => c.userId === selectedConversation)?.user?.fullName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <EnterpriseCardTitle>
                        {conversations.find(c => c.userId === selectedConversation)?.user?.fullName || "User"}
                      </EnterpriseCardTitle>
                      <p className="text-xs text-gray-500">Online</p>
                    </div>
                  </div>
                </EnterpriseCardHeader>
                <EnterpriseCardContent className="flex-1 overflow-y-auto flex flex-col">
                  <div className="flex-1 space-y-4 mb-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.senderId === user?.id
                              ? "bg-brand-500 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                    <Button onClick={sendMessage} size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </EnterpriseCardContent>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </EnterpriseCard>
        </div>
      </div>
    </main>
  );
}

export default function Messaging() {
  return (
    <ProtectedRoute>
      <MessagingPage />
    </ProtectedRoute>
  );
}

