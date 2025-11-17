"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Paperclip,
  X,
  User,
  Clock,
  CheckCheck,
  Check,
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: {
    id: string;
    name: string;
    role: string;
  };
  timestamp: Date;
  isCurrentUser: boolean;
  status?: "sent" | "delivered" | "read";
}

interface ChatPanelProps {
  recordId?: string;
  customerName?: string;
  vin?: string;
  onClose?: () => void;
}

export default function ChatPanel({
  customerName = "Customer",
  vin,
  onClose,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello, I'd like to know the status of my vehicle repair.",
      sender: { id: "customer-1", name: customerName, role: "Customer" },
      timestamp: new Date(Date.now() - 3600000),
      isCurrentUser: false,
      status: "read",
    },
    {
      id: "2",
      text: "Hi! Your vehicle is currently in diagnosis. We'll update you shortly with the findings.",
      sender: { id: "staff-1", name: "Service Staff", role: "Staff" },
      timestamp: new Date(Date.now() - 3000000),
      isCurrentUser: true,
      status: "read",
    },
    {
      id: "3",
      text: "Thank you. How long will it take?",
      sender: { id: "customer-1", name: customerName, role: "Customer" },
      timestamp: new Date(Date.now() - 2400000),
      isCurrentUser: false,
      status: "read",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: { id: "current-user", name: "You", role: "Staff" },
      timestamp: new Date(),
      isCurrentUser: true,
      status: "sent",
    };

    setMessages([...messages, newMessage]);
    setInputText("");

    // Simulate delivery status update
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
        )
      );
    }, 1000);

    // Simulate typing indicator
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        // Mock customer response
        const response: Message = {
          id: (Date.now() + 1).toString(),
          text: "Got it, thank you for the update!",
          sender: { id: "customer-1", name: customerName, role: "Customer" },
          timestamp: new Date(),
          isCurrentUser: false,
          status: "read",
        };
        setMessages((prev) => [...prev, response]);
      }, 2000);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "sent":
        return <Check className="w-3 h-3 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{customerName}</h3>
              <p className="text-sm text-gray-500">
                {vin ? `VIN: ${vin}` : "Active"}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`flex ${
                message.isCurrentUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] ${
                  message.isCurrentUser ? "order-2" : "order-1"
                }`}
              >
                {!message.isCurrentUser && (
                  <p className="text-xs text-gray-500 mb-1 ml-1">
                    {message.sender.name}
                  </p>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.isCurrentUser
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-900 border border-gray-200"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.text}
                  </p>
                  <div
                    className={`flex items-center gap-1 mt-1 ${
                      message.isCurrentUser
                        ? "justify-end text-blue-100"
                        : "justify-start text-gray-400"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.isCurrentUser && getStatusIcon(message.status)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-start"
            >
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
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
        <div className="flex items-end gap-3">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-2 ml-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
