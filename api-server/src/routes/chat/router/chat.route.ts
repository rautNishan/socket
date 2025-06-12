import express, { Router, Request, Response } from "express";
import { RoomController } from "../../../modules/rooms/controllers/room.controller";
import { RequestBodyValidation } from "../../../common/request/validator/request.body.validator";
import { RoomCreateDto } from "../../../modules/rooms/dtos/room.create.dto";
import { asyncHandler } from "../../../utils/async.handler";
import { UserProtectedGuard } from "../../../common/request/guards/authenticated.user";
import { REQUEST_META } from "../../../common/request/constants/request.constant";
import { ChatController } from "../../../modules/chat/controllers/chat.controller";

export class ChatRoute {
  constructor() {}
  static chatRouter: Router = express.Router();
  public static getChatRoute(): Router {
    ChatRoute.startConversatation("/start-conversation");
    ChatRoute.sendMessage("/send-message");
    ChatRoute.getMessages("/get-message");
    return ChatRoute.chatRouter;
  }

  public static startConversatation(path: string): Router {
    const chatController: ChatController = new ChatController();
    return this.chatRouter.post(
      path,
      UserProtectedGuard,
      asyncHandler(async (req: Request, res: Response) => {
        const incomingData = {
          senderId: Number(req[REQUEST_META.PROTECTED_USER]),
          receverId: req.body.receverId,
        };
        const createdData = await chatController.startConversation(
          incomingData
        );
        res.json(createdData);
      })
    );
  }

  public static sendMessage(path: string): Router {
    const chatController: ChatController = new ChatController();
    return this.chatRouter.post(
      path,
      UserProtectedGuard,
      asyncHandler(async (req: Request, res: Response) => {
        const incomingData = {
          senderId: Number(req[REQUEST_META.PROTECTED_USER]),
          message: req.body.message,
          roomId: req.body.roomId,
        };
        const createdData = await chatController.sendMessage(incomingData);
        res.json(createdData);
      })
    );
  }

  public static getMessages(path: string): Router {
    const chatController: ChatController = new ChatController();
    return this.chatRouter.get(
      path,
      UserProtectedGuard,
      asyncHandler(async (req: Request, res: Response) => {
        const incomingData = {
          userId: Number(req[REQUEST_META.PROTECTED_USER]),
        };
        const createdData = await chatController.getMessages(incomingData);
        res.json(createdData);
      })
    );
  }
}
