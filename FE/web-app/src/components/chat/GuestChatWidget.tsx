"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Paperclip,
  Download,
} from "lucide-react";
import {
  startAnonymousChat,
  getConversationMessages,
  getOrCreateGuestId,
  saveGuestConversationId,
  clearGuestChatSession,
  Message,
} from "@/services/chatService";
import {
  initializeChatSocket,
  joinChatRoom,
  sendSocketMessage,
  getChatSocket,
  disconnectChatSocket,
  sendTypingIndicator,
} from "@/lib/socket";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { decodeFileFromContent } from "@/lib/fileMessageUtils";

interface GuestChatWidgetProps {
  serviceCenterId?: string; // Default service center to connect to
}

export default function GuestChatWidget({
  serviceCenterId = "default-sc-1",
}: GuestChatWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "waiting" | "active" | "closed"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const guestId = getOrCreateGuestId();

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && !isConnected) {
      // Socket initialization moved to handleStartChat
    }

    return () => {
      if (getChatSocket()) {
        // Don't disconnect if conversation is active
        if (connectionStatus !== "active") {
          disconnectChatSocket();
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (conversationId && isConnected) {
      loadMessages();
      // Socket listeners are now set up in handleStartChat BEFORE joining room
      // to avoid race conditions with chatAccepted event
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, isConnected]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSocket = () => {
    try {
      initializeChatSocket();
      setIsConnected(true);
    } catch (err) {
      console.error("Failed to initialize socket:", err);
      setError("Failed to connect. Please try again.");
    }
  };

  const loadMessages = async () => {
    if (!conversationId) return;

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

  const handleStartChat = async () => {
    if (!guestName.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsConnecting(true);
    setError(null);

    // Always start with a fresh guestId to avoid backend issues
    const freshGuestId = `guest_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    try {
      // Start anonymous chat with fresh guestId
      const session = await startAnonymousChat(freshGuestId, serviceCenterId);

      // Save the working guestId to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("guestChatId", freshGuestId);
      }

      setConversationId(session.conversationId);
      saveGuestConversationId(session.conversationId);
      setConnectionStatus("waiting");

      // Initialize socket connection only after chat is started
      initializeSocket();

      // Set up socket listeners IMMEDIATELY after socket initialization
      // and BEFORE joining the room to avoid missing events
      const socket = getChatSocket();
      if (socket) {
        console.log("[Guest] Setting up socket listeners before joining room");

        // Clean up any existing listeners
        socket.off("newMessage");
        socket.off("userTyping");
        socket.off("chatAccepted");
        socket.off("conversationClosed");

        // Listen for new messages
        socket.on("newMessage", (data: { newMessage: Message }) => {
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
        socket.on("userTyping", () => {
          setIsTyping(true);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 3000);
        });

        // Listen for chat accepted by staff
        socket.on(
          "chatAccepted",
          (data: { conversationId: string; staffId: string }) => {
            console.log("[Guest] Received chatAccepted event:", data);
            if (data.conversationId === session.conversationId) {
              setConnectionStatus("active");
              setMessages((prev) => [
                ...prev,
                {
                  messageId: `system-${Date.now()}`,
                  content: "A staff member has joined the chat.",
                  senderId: "system",
                  senderType: "staff",
                  senderName: "System",
                  sentAt: new Date().toISOString(),
                  isRead: true,
                },
              ]);
            }
          }
        );

        // Listen for conversation closed
        socket.on(
          "conversationClosed",
          (data: { conversationId: string; closedBy: string }) => {
            if (data.conversationId === session.conversationId) {
              setConnectionStatus("closed");
              setMessages((prev) => [
                ...prev,
                {
                  messageId: `system-closed-${Date.now()}`,
                  content: "This conversation has been closed by staff.",
                  senderId: "system",
                  senderType: "staff",
                  senderName: "System",
                  sentAt: new Date().toISOString(),
                  isRead: true,
                },
              ]);
            }
          }
        );
      }

      // Join the chat room AFTER listeners are set up
      joinChatRoom(session.conversationId, freshGuestId, "guest");

      // Add welcome message
      setMessages([
        {
          messageId: "welcome",
          content: `Hello ${guestName}! Please wait while we connect you with a staff member.`,
          senderId: "system",
          senderType: "staff",
          senderName: "System",
          sentAt: new Date().toISOString(),
          isRead: true,
        },
      ]);

      setIsConnecting(false);
    } catch (err: unknown) {
      console.error("Failed to start chat:", err);
      setError("Failed to start chat. Please try again.");
      setIsConnecting(false);
    }
  };

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !selectedFile) || !conversationId) return;

    setIsUploading(true);

    try {
      let messageContent = inputText.trim();

      // Upload file to Cloudinary if selected - just include the URL in message
      if (selectedFile) {
        const fileUrl = await uploadToCloudinary(selectedFile);
        // Simply add the URL to the message - frontend will auto-detect and display it
        messageContent = fileUrl + (messageContent ? ` ${messageContent}` : "");
      }

      const messageData = {
        conversationId,
        senderId: guestId,
        senderType: "guest" as const,
        content: messageContent || `📎 ${selectedFile?.name || "attachment"}`,
        timestamp: new Date().toISOString(),
      };

      // Send through socket
      sendSocketMessage(messageData);

      // Add to local state for immediate display
      const newMessage: Message = {
        messageId: `temp-${Date.now()}`,
        content: messageContent || `📎 ${selectedFile?.name || "attachment"}`,
        senderId: guestId,
        senderType: "guest",
        senderName: guestName || "You",
        sentAt: new Date().toISOString(),
        isRead: false,
      };

      setMessages((prev) => [...prev, newMessage]);
      setInputText("");
      setSelectedFile(null);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (connectionStatus === "idle") {
        handleStartChat();
      } else {
        handleSendMessage();
      }
    }
  };

  const handleCloseWidget = () => {
    setIsOpen(false);
  };

  const handleNewChat = () => {
    clearGuestChatSession();
    setConversationId(null);
    setMessages([]);
    setConnectionStatus("idle");
    setGuestName("");
    setInputText("");
    setError(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case "waiting":
        return (
          <div className="flex items-center gap-2 text-amber-300 text-xs bg-amber-500/20 px-3 py-1.5 rounded-full backdrop-blur-sm border border-amber-400/30">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="font-medium">Waiting for staff...</span>
          </div>
        );
      case "active":
        return (
          <div className="flex items-center gap-2 text-emerald-300 text-xs bg-emerald-500/20 px-3 py-1.5 rounded-full backdrop-blur-sm border border-emerald-400/30">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="font-medium">Connected</span>
          </div>
        );
      case "closed":
        return (
          <div className="flex items-center gap-2 text-gray-300 text-xs bg-gray-500/20 px-3 py-1.5 rounded-full backdrop-blur-sm border border-gray-400/30">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="font-medium">Chat closed</span>
          </div>
        );
      default:
        return null;
    }
  };

  const widgetJSX = (
    <>
      {/* Floating Chat Button - Dark Theme */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-emerald-500 text-white rounded-full shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_40px_rgba(59,130,246,0.7)] transition-all duration-300 flex items-center justify-center z-50 group overflow-hidden"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-emerald-400/20 blur-xl group-hover:blur-2xl transition-all duration-300"></div>

            {/* Icon */}
            <MessageCircle className="w-7 h-7 relative z-10 group-hover:rotate-12 transition-transform duration-300" />

            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping"></span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Widget - Dark Theme with Glass Morphism */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-8 right-8 w-[420px] h-[650px] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden z-50 flex flex-col backdrop-blur-xl border border-white/10"
            style={{
              background:
                "linear-gradient(135deg, rgba(17,24,39,0.95) 0%, rgba(31,41,55,0.95) 100%)",
            }}
          >
            {/* Animated background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 via-transparent to-emerald-500/5"></div>
              <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div
                className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
            </div>

            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600/90 via-blue-500/90 to-emerald-500/90 px-6 py-5 backdrop-blur-sm border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-white tracking-wide">
                      Customer Support
                    </h3>
                  </div>
                  <div className="ml-13">{getStatusBadge()}</div>
                </div>
                <button
                  onClick={handleCloseWidget}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 group"
                >
                  <X className="w-5 h-5 text-white/80 group-hover:text-white group-hover:rotate-90 transition-all duration-200" />
                </button>
              </div>
            </div>

            {/* Content */}
            {connectionStatus === "idle" ? (
              /* Initial Form */
              <div className="relative flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-sm space-y-6 relative z-10">
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring" }}
                      className="w-20 h-20 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30"
                    >
                      <MessageCircle className="w-10 h-10 text-white" />
                    </motion.div>
                    <motion.h4
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl font-bold text-white mb-2"
                    >
                      Start a Conversation
                    </motion.h4>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-gray-400 text-sm"
                    >
                      Connect with our support team instantly
                    </motion.p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter your name"
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
                    />
                  </motion.div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm"
                    >
                      <p className="text-red-300 text-sm">{error}</p>
                    </motion.div>
                  )}

                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    onClick={handleStartChat}
                    disabled={isConnecting || !guestName.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-emerald-500 text-white py-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 font-semibold text-base relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                        <span className="relative z-10">Connecting...</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">Start Chat</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            ) : (
              /* Chat Interface */
              <>
                {/* Messages Area */}
                <div className="relative flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.messageId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex ${
                        message.senderType === "guest"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] ${
                          message.senderId === "system" ? "w-full" : ""
                        }`}
                      >
                        {message.senderId === "system" ? (
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 text-center backdrop-blur-sm">
                            <p className="text-sm text-blue-300">
                              {message.content}
                            </p>
                          </div>
                        ) : (
                          <>
                            {message.senderType === "staff" && (
                              <p className="text-xs text-gray-400 mb-2 ml-3">
                                {message.senderName}
                              </p>
                            )}
                            {(() => {
                              const { file, text } = decodeFileFromContent(
                                message.content
                              );
                              return (
                                <div
                                  className={`rounded-2xl px-5 py-3 ${
                                    message.senderType === "guest"
                                      ? "bg-gradient-to-br from-blue-500 to-emerald-500 text-white shadow-lg shadow-blue-500/20"
                                      : "bg-white/5 text-gray-200 border border-white/10 backdrop-blur-sm"
                                  }`}
                                >
                                  {/* File/Image Display */}
                                  {file && (
                                    <div className="mb-3">
                                      {file.type === "image" ? (
                                        <div className="relative">
                                          <Image
                                            src={file.url}
                                            alt="Shared image"
                                            width={300}
                                            height={200}
                                            className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity object-cover"
                                            onClick={() =>
                                              window.open(file.url, "_blank")
                                            }
                                          />
                                          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                            📷 Image
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-3 p-3 bg-blue-50/60 rounded-lg">
                                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                            <span className="text-blue-300">
                                              📎
                                            </span>
                                          </div>
                                          <div className="flex-1">
                                            <p className="text-sm font-medium">
                                              {file.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              File attachment
                                            </p>
                                          </div>
                                          {/* Only show download button for messages not from current user */}
                                          {message.senderId !== guestId && (
                                            <button
                                              onClick={() =>
                                                window.open(file.url, "_blank")
                                              }
                                              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                              title="Download file"
                                            >
                                              <Download size={16} />
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Message Text */}
                                  {text && (
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                      {text}
                                    </p>
                                  )}

                                  <p
                                    className={`text-xs mt-2 ${
                                      message.senderType === "guest"
                                        ? "text-white/60"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {formatTime(message.sentAt)}
                                  </p>
                                </div>
                              );
                            })()}
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex justify-start"
                      >
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-sm">
                          <div className="flex gap-1.5">
                            <motion.div
                              animate={{ y: [0, -6, 0] }}
                              transition={{
                                repeat: Infinity,
                                duration: 0.6,
                                delay: 0,
                              }}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                            <motion.div
                              animate={{ y: [0, -6, 0] }}
                              transition={{
                                repeat: Infinity,
                                duration: 0.6,
                                delay: 0.2,
                              }}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                            <motion.div
                              animate={{ y: [0, -6, 0] }}
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
                <div className="relative bg-gray-900/50 border-t border-white/10 p-5 backdrop-blur-sm">
                  {connectionStatus === "closed" ? (
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-4">
                        This conversation has been closed.
                      </p>
                      <button
                        onClick={handleNewChat}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 text-sm font-medium"
                      >
                        Start New Chat
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* File Preview */}
                      {selectedFile && (
                        <div className="mb-3 p-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <span className="text-blue-300 text-sm">
                                  📎
                                </span>
                              </div>
                              <div>
                                <p className="text-white text-sm font-medium truncate max-w-[200px]">
                                  {selectedFile.name}
                                </p>
                                <p className="text-gray-400 text-xs">
                                  {(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                                  MB
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={handleRemoveFile}
                              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4 text-gray-400 hover:text-white" />
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-end gap-3">
                        {/* File Input */}
                        <label className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-200 cursor-pointer group">
                          <input
                            type="file"
                            onChange={handleFileSelect}
                            accept="image/*,.pdf,.doc,.docx,.txt"
                            className="hidden"
                          />
                          <Paperclip className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                        </label>

                        <textarea
                          value={inputText}
                          onChange={(e) => {
                            setInputText(e.target.value);
                            if (conversationId && e.target.value.trim()) {
                              sendTypingIndicator(conversationId);
                            }
                          }}
                          onKeyPress={handleKeyPress}
                          placeholder={
                            connectionStatus === "waiting"
                              ? "Waiting for staff to join..."
                              : "Type your message..."
                          }
                          disabled={connectionStatus === "waiting"}
                          rows={1}
                          className="flex-1 resize-none rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm"
                          style={{ minHeight: "48px", maxHeight: "120px" }}
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSendMessage}
                          disabled={
                            (!inputText.trim() && !selectedFile) ||
                            connectionStatus === "waiting" ||
                            isUploading
                          }
                          className="p-3.5 bg-gradient-to-br from-blue-500 to-emerald-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 relative overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                          {isUploading ? (
                            <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                          ) : (
                            <Send className="w-5 h-5 relative z-10" />
                          )}
                        </motion.button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  // Render into portal to ensure fixed positioning works correctly
  if (!mounted) return null;
  return createPortal(widgetJSX, document.body);
}
