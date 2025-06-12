import { RoomService } from "../../rooms/services/room.service";
import { ChatService } from "../services/chat.service";

export class ChatController {
  private _chatService: ChatService;

  constructor() {
    this._chatService = ChatService.getInstance();
  }

  async startConversation(data: { senderId: number; receverId: number }) {
    console.log("This is data: ", data);

    return this._chatService.startConversation(data);
  }

  async sendMessage(data: {
    message: string;
    roomId: number;
    senderId: number;
  }) {
    console.log("This is data: ", data);

    return await this._chatService.sendMessage(data);
  }

  async getMessages(data: { userId: number }) {
    console.log("This is data: ", data);
    return await this._chatService.getAllMessages(data);
  }
}
