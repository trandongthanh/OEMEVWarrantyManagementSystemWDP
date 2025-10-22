"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Check, Clock, User } from "lucide-react";
import {
  getMyConversations,
  acceptConversation,
  getConversationMessages,
  closeConversation,
  Conversation,
  Message,
} from "@/services/chatService";
import {
  initializeChatSocket,
  joinChatRoom,
  sendSocketMessage,
  getChatSocket,
  initializeNotificationSocket,
} from "@/lib/socket";

interface StaffChatDashboardProps {
  serviceCenterId?: string; // Can be used for filtering in the future
  onClose?: () => void;
}

export default function StaffChatDashboard({
  onClose,
}: StaffChatDashboardProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "waiting" | "active" | "closed"
  >("waiting");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Get auth token and userId from localStorage or context
  const authToken =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  const currentUserId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    if (authToken) {
      initializeSockets();
      loadConversations();
    }

    return () => {
      // Cleanup on unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.conversationId);
      setupChatListeners();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSockets = () => {
    // Initialize chat socket
    initializeChatSocket();

    // Initialize notification socket for new chat alerts
    if (authToken) {
      const notifSocket = initializeNotificationSocket(authToken);

      // Listen for new conversation requests
      notifSocket.on("newConversation", (data: { conversationId: string }) => {
        console.log("New conversation request:", data);
        // Reload waiting conversations
        if (selectedTab === "waiting") {
          loadConversations();
        }
        // Show notification
        playNotificationSound();
      });
    }
  };

  const setupChatListeners = () => {
    const socket = getChatSocket();
    if (!socket || !activeConversation) return;

    // Join the conversation room
    joinChatRoom(activeConversation.conversationId);

    // Listen for new messages
    socket.on("newMessage", (data: { newMessage: Message }) => {
      setMessages((prev) => [...prev, data.newMessage]);
      setIsTyping(false);
    });

    // Listen for typing indicator
    socket.on("userTyping", () => {
      setIsTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    });
  };

  const loadConversations = async () => {
    setLoading(true);
    try {
      const convs = await getMyConversations(
        selectedTab === "waiting" ? "waiting" : selectedTab
      );
      setConversations(convs);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const msgs = await getConversationMessages(conversationId);
      setMessages(msgs);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const handleAcceptChat = async (conversation: Conversation) => {
    try {
      await acceptConversation(conversation.conversationId);
      setActiveConversation({ ...conversation, status: "active" });
      setSelectedTab("active");
      loadConversations();
    } catch (err) {
      console.error("Failed to accept chat:", err);
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !activeConversation || !currentUserId) return;

    const messageData = {
      conversationId: activeConversation.conversationId,
      senderId: currentUserId,
      senderType: "staff" as const,
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      sendSocketMessage(messageData);

      const newMessage: Message = {
        messageId: `temp-${Date.now()}`,
        content: inputText.trim(),
        senderId: currentUserId,
        senderType: "staff",
        senderName: "You",
        sentAt: new Date().toISOString(),
        isRead: false,
      };

      setMessages((prev) => [...prev, newMessage]);
      setInputText("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleCloseConversation = async () => {
    if (!activeConversation) return;

    try {
      await closeConversation(activeConversation.conversationId);
      setActiveConversation(null);
      setMessages([]);
      loadConversations();
    } catch (err) {
      console.error("Failed to close conversation:", err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const playNotificationSound = () => {
    // Play notification sound
    if (typeof window !== "undefined" && "Audio" in window) {
      const audio = new Audio("/notification.mp3");
      audio.play().catch((err) => console.log("Failed to play sound:", err));
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return formatTime(dateString);
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getWaitingCount = () => {
    return conversations.filter((c) => c.status === "waiting").length;
  };

  return (
    <div className="flex h-full bg-white rounded-2xl overflow-hidden shadow-xl">
      {/* Sidebar - Conversations List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Chat Support</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab("waiting")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors relative ${
                selectedTab === "waiting"
                  ? "bg-white text-blue-600"
                  : "bg-blue-800 text-white hover:bg-blue-900"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Waiting</span>
                {getWaitingCount() > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getWaitingCount()}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setSelectedTab("active")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                selectedTab === "active"
                  ? "bg-white text-blue-600"
                  : "bg-blue-800 text-white hover:bg-blue-900"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setSelectedTab("closed")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                selectedTab === "closed"
                  ? "bg-white text-blue-600"
                  : "bg-blue-800 text-white hover:bg-blue-900"
              }`}
            >
              Closed
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No conversations</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.conversationId}
                onClick={() => setActiveConversation(conversation)}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                  activeConversation?.conversationId ===
                  conversation.conversationId
                    ? "bg-blue-50"
                    : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {conversation.guest?.name || "Guest User"}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {formatDate(conversation.createdAt)}
                      </span>
                    </div>
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage.content}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          conversation.status === "waiting"
                            ? "bg-amber-100 text-amber-700"
                            : conversation.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {conversation.status}
                      </span>
                      {conversation.unreadCount &&
                        conversation.unreadCount > 0 && (
                          <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                    </div>
                  </div>
                </div>

                {/* Accept Button for Waiting Chats */}
                {conversation.status === "waiting" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAcceptChat(conversation);
                    }}
                    className="w-full mt-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept Chat</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {activeConversation.guest?.name || "Guest User"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {activeConversation.status}
                    </p>
                  </div>
                </div>
                {activeConversation.status === "active" && (
                  <button
                    onClick={handleCloseConversation}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    Close Chat
                  </button>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.messageId}
                  className={`flex ${
                    message.senderType === "staff"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div className="max-w-[70%]">
                    {message.senderType === "guest" && (
                      <p className="text-xs text-gray-500 mb-1 ml-1">
                        {message.senderName}
                      </p>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.senderType === "staff"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-900 border border-gray-200"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          message.senderType === "staff"
                            ? "text-blue-200"
                            : "text-gray-400"
                        }`}
                      >
                        {formatTime(message.sentAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.6,
                            delay: 0,
                          }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.6,
                            delay: 0.2,
                          }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.6,
                            delay: 0.4,
                          }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4">
              {activeConversation.status === "active" ? (
                <div className="flex items-end gap-2">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ minHeight: "48px", maxHeight: "120px" }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim()}
                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-500 text-sm">
                  {activeConversation.status === "waiting"
                    ? "Accept this chat to start messaging"
                    : "This conversation is closed"}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4" />
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
