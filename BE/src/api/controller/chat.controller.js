class ChatController {
  #chatService;

  constructor({ chatService }) {
    this.#chatService = chatService;
  }

  createAnonymousChat = async (req, res, next) => {
    const { guestId, serviceCenterId, email } = req.body;

    const conversation = await this.#chatService.startAnonymousChat({
      guestId,
      serviceCenterId,
      email,
    });

    res.status(201).json({
      status: "success",
      data: {
        conversation,
      },
    });
  };

  resumeByEmail = async (req, res, next) => {
    const { email } = req.body;

    const conversations = await this.#chatService.resumeByEmail({
      email,
    });

    res.status(200).json({
      status: "success",
      data: {
        conversations,
      },
    });
  };

  joinAnonymousChat = async (req, res, next) => {
    const { conversationId } = req.params;

    const { userId } = req.user;

    const conversation = await this.#chatService.joinAnonymousChat({
      userId,
      conversationId,
    });

    res.status(200).json({
      status: "success",
      data: {
        conversation,
      },
    });
  };

  getMessages = async (req, res, next) => {
    const { conversationId } = req.params;

    const messages = await this.#chatService.getMessages({
      conversationId,
    });

    res.status(200).json({
      status: "success",
      data: {
        messages,
      },
    });
  };

  getMyConversations = async (req, res, next) => {
    const { userId } = req.user;
    const { status } = req.query;

    const conversations = await this.#chatService.getMyConversations({
      userId,
      status,
    });

    res.status(200).json({
      status: "success",
      data: {
        conversations,
      },
    });
  };

  closeConversation = async (req, res, next) => {
    const { conversationId } = req.params;
    const { userId } = req.user;

    const conversation = await this.#chatService.closeConversation({
      conversationId,
      userId,
    });

    res.status(200).json({
      status: "success",
      message: "Conversation closed successfully",
      data: {
        conversation,
      },
    });
  };
}

export default ChatController;
