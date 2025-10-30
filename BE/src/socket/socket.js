import { Server } from "socket.io";
import { socketAuth, optionalSocketAuth } from "./socketAuth.js";
import { messageSchema } from "../validators/message.validator.js";
import dayjs from "dayjs";
import container from "../../container.js";

// Global reference to notification namespace for use in other modules
let notificationNamespaceInstance = null;

/**
 * Get the notification namespace instance
 * @returns {import('socket.io').Namespace | null}
 */
export function getNotificationNamespace() {
  return notificationNamespaceInstance;
}

export function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const notificationNamespace = io.of("/notifications");
  const chatNamespace = io.of("/chats");

  // Store reference for external use
  notificationNamespaceInstance = notificationNamespace;

  notificationNamespace.use(socketAuth);

  chatNamespace.use(optionalSocketAuth);
  notificationNamespace.on("connection", (socket) => {
    const { userId, roleName, serviceCenterId, companyId } = socket.user;

    console.log(
      `🔔 User connected to notifications: ${roleName} (userId: ${userId})`
    );

    // ALWAYS join personal user room for direct notifications
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`✅ Joined personal room: user_${userId}`);
    }

    // Role-based rooms
    if (roleName === "parts_coordinator_company" && companyId) {
      socket.join(`parts_coordinator_company_${companyId}`);
      console.log(`✅ Joined room: parts_coordinator_company_${companyId}`);
    }

    if (roleName === "emv_staff" && companyId) {
      socket.join(`emv_staff_${companyId}`);
      console.log(`✅ Joined room: emv_staff_${companyId}`);
    }

    if (roleName === "parts_coordinator_service_center" && companyId) {
      socket.join(`parts_coordinator_service_center_${companyId}`);
      console.log(
        `✅ Joined room: parts_coordinator_service_center_${companyId}`
      );
    }

    if (roleName === "service_center_technician" && serviceCenterId) {
      const roomName = `service_center_technician_${serviceCenterId}`;
      socket.join(roomName);
      console.log(`✅ Joined room: ${roomName}`);
    }

    if (roleName === "service_center_staff" && serviceCenterId) {
      const roomName = `service_center_staff_${serviceCenterId}`;
      socket.join(roomName);
      console.log(`✅ Joined room: ${roomName}`);
    }

    if (roleName === "service_center_manager" && serviceCenterId) {
      const roomName = `service_center_manager_${serviceCenterId}`;
      socket.join(roomName);
      console.log(`✅ Joined room: ${roomName}`);
    }

    socket.on("disconnect", () => {
      console.log("🔌 User disconnected: " + roleName + " - " + socket.id);
    });
  });

  chatNamespace.on("connection", (socket) => {
    socket.container = container;

    socket.on("joinRoom", ({ conversationId }) => {
      socket.join(`conversation_${conversationId}`);
    });

    socket.on("typing", ({ conversationId }) => {
      socket.broadcast.to(`conversation_${conversationId}`).emit("userTyping", {
        userId: socket.id,
        message: "typing....",
      });
    });

    socket.on("sendMessage", async (dataMessage, acknowledgment) => {
      try {
        const { conversationId, senderId, senderType, content } = dataMessage;

        const { error } = messageSchema.validate({
          conversationId,
          senderId,
          senderType,
          content,
        });

        if (error) {
          const errorMessage = error.details[0].message;

          if (acknowledgment && typeof acknowledgment === "function") {
            acknowledgment({
              success: false,
              error: errorMessage,
            });
          }

          return;
        }

        const chatService = socket.container.resolve("chatService");

        const rawResult = await chatService.sendMessage({
          conversationId,
          senderId,
          senderType,
          content,
        });

        socket.to(`conversation_${conversationId}`).emit("newMessage", {
          sendAt: dayjs(),
          newMessage: rawResult,
        });

        if (acknowledgment && typeof acknowledgment === "function") {
          acknowledgment({
            success: true,
            data: rawResult,
          });
        }
      } catch (error) {
        if (acknowledgment && typeof acknowledgment === "function") {
          acknowledgment({
            success: false,
            error: error.message || "Failed to send message",
          });
        }

        socket.emit("messageError", {
          error: error.message || "Failed to send message",
          timestamp: dayjs(),
        });
      }
    });
    socket.on("disconnect", () => {
      console.log("User disconnected from chat: " + socket.id);
    });
  });

  return { io, notificationNamespace, chatNamespace };
}
