"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  MessageCircle,
  X,
  Send,
  Check,
  Clock,
  User,
  Paperclip,
} from "lucide-react";
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
  sendTypingIndicator,
} from "@/lib/socket";
import { uploadToCloudinary, getFileType } from "@/lib/cloudinary";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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

    // Cleanup on unmount
    return () => {
      const socket = getChatSocket();
      if (socket) {
        socket.off("newMessage");
        socket.off("userTyping");
      }
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

    // Cleanup function to remove listeners when conversation changes
    return () => {
      const socket = getChatSocket();
      if (socket) {
        socket.off("newMessage");
        socket.off("userTyping");
      }
    };
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
    if (!socket || !activeConversation || !currentUserId) return;

    // Ensure socket is connected before setting up listeners
    if (!socket.connected) {
      console.log("Socket not connected, initializing...");
      initializeChatSocket();
      // Retry after a short delay
      setTimeout(() => setupChatListeners(), 1000);
      return;
    }

    // Clean up previous listeners to avoid duplicates
    socket.off("newMessage");
    socket.off("userTyping");

    // Join the conversation room
    joinChatRoom(activeConversation.conversationId, currentUserId, "staff");

    // Listen for new messages
    socket.on("newMessage", (data: { newMessage: Message }) => {
      // Normalize senderType to lowercase for frontend consistency
      const normalizedMessage = {
        ...data.newMessage,
        senderType: data.newMessage.senderType.toLowerCase() as
          | "guest"
          | "staff",
      };
      setMessages((prev) => [...prev, normalizedMessage]);
      setIsTyping(false);
    });

    // Listen for typing indicator
    socket.on("userTyping", (data: { conversationId: string }) => {
      // Only process typing for the current active conversation
      if (data.conversationId === activeConversation.conversationId) {
        setIsTyping(true);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    });
  };

  const loadConversations = async () => {
    setLoading(true);
    try {
      const convs = await getMyConversations(selectedTab);
      // Filter conversations based on selected tab
      const filteredConvs = convs.filter((conv) => {
        if (selectedTab === "waiting") {
          return conv.status === "waiting" || conv.status === "UNASSIGNED";
        } else if (selectedTab === "active") {
          return conv.status === "active" || conv.status === "ACTIVE";
        } else if (selectedTab === "closed") {
          return conv.status === "closed" || conv.status === "CLOSED";
        }
        return false;
      });
      setConversations(filteredConvs);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const msgs = await getConversationMessages(conversationId);
      // Normalize senderType to lowercase for frontend consistency
      const normalizedMsgs = msgs.map((msg) => ({
        ...msg,
        senderType: msg.senderType.toLowerCase() as "guest" | "staff",
      }));
      setMessages(normalizedMsgs);
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

  const handleSendMessage = async () => {
    if (
      (!inputText.trim() && !selectedFile) ||
      !activeConversation ||
      !currentUserId
    )
      return;

    setIsUploading(true);
    let fileUrl: string | undefined;
    let fileType: "image" | "file" | undefined;

    try {
      // Upload file to Cloudinary if selected
      if (selectedFile) {
        fileUrl = await uploadToCloudinary(selectedFile);
        fileType = getFileType(fileUrl);
      }

      const messageData = {
        conversationId: activeConversation.conversationId,
        senderId: currentUserId,
        senderType: "staff" as const,
        content:
          inputText.trim() || (selectedFile ? `📎 ${selectedFile.name}` : ""),
        timestamp: new Date().toISOString(),
        fileUrl,
        fileType,
      };

      // Send through socket
      sendSocketMessage(messageData);

      const newMessage: Message = {
        messageId: `temp-${Date.now()}`,
        content:
          inputText.trim() || (selectedFile ? `📎 ${selectedFile.name}` : ""),
        senderId: currentUserId,
        senderType: "staff",
        senderName: "You",
        sentAt: new Date().toISOString(),
        isRead: false,
        fileUrl,
        fileType,
      };

      setMessages((prev) => [...prev, newMessage]);
      setInputText("");
      setSelectedFile(null);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsUploading(false);
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
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
    <div className="flex h-full bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
      {/* Sidebar - Conversations List */}
      <div className="w-96 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Tabs Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Tabs */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setSelectedTab("waiting")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 relative ${
                selectedTab === "waiting"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Waiting</span>
              </div>
              <AnimatePresence mode="wait">
                {getWaitingCount() > 0 && (
                  <motion.span
                    key={getWaitingCount()}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                    className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md"
                  >
                    {getWaitingCount()}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              onClick={() => setSelectedTab("active")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                selectedTab === "active"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>Active</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedTab("closed")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                selectedTab === "closed"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>Closed</span>
              </div>
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm font-medium">Loading conversations...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <MessageCircle className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-base font-semibold text-gray-700 mb-1">
                No {selectedTab} conversations
              </p>
              <p className="text-sm text-gray-500">
                {selectedTab === "waiting" && "Waiting for customer inquiries"}
                {selectedTab === "active" && "No active chats at the moment"}
                {selectedTab === "closed" && "No closed conversations yet"}
              </p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {conversations.map((conversation) => (
                <motion.div
                  key={conversation.conversationId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setActiveConversation(conversation)}
                  className={`p-4 bg-white rounded-xl cursor-pointer transition-all duration-200 border ${
                    activeConversation?.conversationId ===
                    conversation.conversationId
                      ? "border-blue-500 shadow-md ring-2 ring-blue-100"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                          conversation.status === "waiting" ||
                          conversation.status === "UNASSIGNED"
                            ? "bg-amber-400"
                            : conversation.status === "active" ||
                              conversation.status === "ACTIVE"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      ></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {conversation.guest?.name || "Anonymous Guest"}
                        </h4>
                        <span className="text-xs text-gray-500 font-medium">
                          {formatDate(conversation.createdAt)}
                        </span>
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-600 truncate mb-2">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            conversation.status === "waiting" ||
                            conversation.status === "UNASSIGNED"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : conversation.status === "active" ||
                                conversation.status === "ACTIVE"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {conversation.status === "UNASSIGNED"
                            ? "waiting"
                            : conversation.status}
                        </span>
                        <AnimatePresence mode="wait">
                          {conversation.unreadCount &&
                            conversation.unreadCount > 0 && (
                              <motion.span
                                key={conversation.unreadCount}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 30,
                                }}
                                className="bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                              >
                                {conversation.unreadCount}
                              </motion.span>
                            )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* Accept Button for Waiting Chats */}
                  {(conversation.status === "waiting" ||
                    conversation.status === "UNASSIGNED") && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcceptChat(conversation);
                      }}
                      className="w-full mt-3 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept Chat</span>
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white px-6 py-5 border-b border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {activeConversation.guest?.name || "Anonymous Guest"}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activeConversation.status === "active" ||
                          activeConversation.status === "ACTIVE"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      ></div>
                      <p className="text-sm text-gray-600 font-medium capitalize">
                        {activeConversation.status === "UNASSIGNED"
                          ? "waiting"
                          : activeConversation.status}
                      </p>
                    </div>
                  </div>
                </div>
                {(activeConversation.status === "active" ||
                  activeConversation.status === "ACTIVE") && (
                  <button
                    onClick={handleCloseConversation}
                    className="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
                  >
                    Close Chat
                  </button>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <motion.div
                  key={message.messageId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    message.senderType === "staff"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div className="max-w-[70%]">
                    {message.senderType === "guest" && (
                      <p className="text-xs text-gray-500 mb-1.5 ml-2 font-medium">
                        {message.senderName}
                      </p>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm ${
                        message.senderType === "staff"
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-900 border border-gray-200"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>

                      {/* File/Image Display */}
                      {message.fileUrl && (
                        <div className="mt-3">
                          {message.fileType === "image" ? (
                            <div className="relative">
                              <Image
                                src={message.fileUrl!}
                                alt="Shared image"
                                width={300}
                                height={200}
                                className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity object-cover"
                                onClick={() =>
                                  window.open(message.fileUrl, "_blank")
                                }
                              />
                              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                📷 Image
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
                              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <span className="text-blue-300">📎</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-white font-medium">
                                  {message.fileUrl.split("/").pop()}
                                </p>
                                <p className="text-xs text-gray-400">
                                  File attachment
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  window.open(message.fileUrl, "_blank")
                                }
                                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                              >
                                Download
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <p
                        className={`text-xs mt-2 ${
                          message.senderType === "staff"
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {formatTime(message.sentAt)}
                      </p>
                    </div>
                  </div>
                </motion.div>
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
                    <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm">
                      <div className="flex gap-1.5">
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
            <div className="bg-white border-t border-gray-200 p-5 shadow-sm">
              {activeConversation.status === "active" ||
              activeConversation.status === "ACTIVE" ? (
                <>
                  {/* File Preview */}
                  {selectedFile && (
                    <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 text-sm">📎</span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-900 font-medium truncate max-w-[200px]">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveFile}
                          className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-end gap-3">
                    {/* File Input */}
                    <label className="p-3 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-all duration-200 cursor-pointer group">
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        className="hidden"
                      />
                      <Paperclip className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
                    </label>

                    <textarea
                      value={inputText}
                      onChange={(e) => {
                        setInputText(e.target.value);
                        if (activeConversation && e.target.value.trim()) {
                          sendTypingIndicator(
                            activeConversation.conversationId
                          );
                        }
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      rows={1}
                      className="flex-1 resize-none rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      style={{ minHeight: "48px", maxHeight: "120px" }}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={
                        (!inputText.trim() && !selectedFile) || isUploading
                      }
                      className="p-3.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      {isUploading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="inline-block px-6 py-3 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl">
                    {activeConversation.status === "waiting" ||
                    activeConversation.status === "UNASSIGNED"
                      ? "Accept this chat to start messaging"
                      : "This conversation is closed"}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <MessageCircle className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-700 mb-2">
                No conversation selected
              </p>
              <p className="text-sm text-gray-500">
                Choose a conversation from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
