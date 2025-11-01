import { Server } from "socket.io";
import { socketAuth, optionalSocketAuth } from "./socketAuth.js";
import { messageSchema } from "../validators/message.validator.js";
import dayjs from "dayjs";
import container from "../../container.js";

export function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const notificationNamespace = io.of("/notifications");
  const chatNamespace = io.of("/chats");

  notificationNamespace.use(socketAuth);

  chatNamespace.use(optionalSocketAuth);
  notificationNamespace.on("connection", (socket) => {
    const { userId, roleName, serviceCenterId, companyId } = socket.user;

    if (roleName === "parts_coordinator_company" && companyId) {
      socket.join(`parts_coordinator_company_${companyId}`);
    }

    if (roleName === "emv_staff" && companyId) {
      socket.join(`emv_staff_${companyId}`);
    }

    if (roleName === "parts_coordinator_service_center" && companyId) {
      socket.join(`parts_coordinator_service_center_${companyId}`);
    }

    if (roleName && serviceCenterId) {
      socket.join(`user_${userId}`);
    }

    if (roleName === "service_center_technician" && serviceCenterId) {
      const roomName = `service_center_technician_${serviceCenterId}`;
      socket.join(roomName);
    }

    if (roleName === "service_center_staff" && serviceCenterId) {
      const roomName = `service_center_staff_${serviceCenterId}`;
      socket.join(roomName);
    }

    if (roleName === "service_center_manager" && serviceCenterId) {
      const roomName = `service_center_manager_${serviceCenterId}`;
      socket.join(roomName);
    }

    socket.on("disconnect", () => {
      console.log("User disconnected: " + roleName + " - " + socket.id);
    });
  });

  chatNamespace.on("connection", (socket) => {
    console.log("Chat socket connected:", socket.id);
    socket.container = container;

    // Store user data for disconnect handling
    socket.userData = null;

    socket.on("joinRoom", ({ conversationId, senderId, senderType }) => {
      const roomName = `conversation_${conversationId}`;
      socket.join(roomName);

      // Store user data for this socket
      socket.userData = { conversationId, senderId, senderType };

      console.log(
        `${senderType} (${senderId}) with socket ${socket.id} joined room: ${roomName}`
      );
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

        console.log(
          `[Backend] ${senderType} (${senderId}) sent message to conversation_${conversationId}. Broadcasting to room...`
        );

        // Format message for frontend
        const formattedMessage = {
          messageId: rawResult.id,
          content: rawResult.content,
          senderId: rawResult.senderId,
          senderType: rawResult.senderType.toLowerCase(),
          senderName: rawResult.senderType === "GUEST" ? "Guest" : "Staff",
          sentAt: rawResult.createdAt,
          isRead: rawResult.isRead,
        };

        socket.to(`conversation_${conversationId}`).emit("newMessage", {
          sendAt: dayjs(),
          newMessage: formattedMessage,
        });

        if (acknowledgment && typeof acknowledgment === "function") {
          acknowledgment({
            success: true,
            data: formattedMessage,
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

      // If this was a guest user, notify the room
      if (socket.userData && socket.userData.senderType === "guest") {
        const { conversationId, senderId } = socket.userData;
        const roomName = `conversation_${conversationId}`;

        console.log(
          `[Backend] Guest (${senderId}) left conversation_${conversationId}`
        );

        socket.to(roomName).emit("guestLeft", {
          conversationId,
          guestId: senderId,
          timestamp: dayjs(),
        });
      }
    });
  });

  return { io, notificationNamespace, chatNamespace };
}
