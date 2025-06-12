import express, { Express } from "express";
import { AppInit } from "./app";

import cors from "cors";
import appConfig from "./common/configs/app.config";
import { DBConnection } from "./common/database/connection/database.connection";
import { GlobalExceptionFilter } from "./common/response/errors/global.filter.error";
import { ResponseInterCeptor } from "./common/response/interceptors/response.interceptor";
import { UserSelfRoute } from "./routes/user/router/user.route";
import { UserAuthRoute } from "./routes/user/router/user.auth.route";
import { ChatRoute } from "./routes/chat/router/chat.route";
import { Server as SocketIOServer } from "socket.io";
export async function main() {
  try {
    const app: Express = express();
    const port: number = Number(appConfig.app_port);
    const host: string | undefined = appConfig.app_host ?? "localhost";

    await DBConnection.connection();

    const appInit = new AppInit({
      app: app,
      port: port,
      host: host,
      beforeRouteMiddlewares: [cors(), express.json(), ResponseInterCeptor],
      routes: [
        { routeName: "/user", router: UserSelfRoute.getUserSelfRouter() },
        { routeName: "/user/auth", router: UserAuthRoute.getUserAuthRouter() },
        { routeName: "/chat", router: ChatRoute.getChatRoute() },
      ],
      afterRouteMiddleWares: [GlobalExceptionFilter],
    });

    const io: SocketIOServer = new SocketIOServer(appInit.getServer(), {
      cors: {
        origin: "*", // Or restrict to your frontend URL
        methods: ["GET", "POST"],
      },
    });

    // // Handle socket connection
    // io.on("connection", (socket) => {
    //   console.log("New client connected: ", socket.id);
    //   // Listen for joining a room
    //   socket.on("joinRoom", (roomId: number) => {
    //     console.log(`Socket ${socket.id} joining room ${roomId}`);
    //     socket.join(String(roomId));
    //   });

    //   // Listen for sending messages
    //   socket.on(
    //     "sendMessage",
    //     async (data: { roomId: number; message: string; senderId: number }) => {
    //       console.log("Received message: ", data);

    //       // TODO: Save message to DB here, with your ORM or query builder

    //       // For now, just broadcast to the room
    //       io.to(String(data.roomId)).emit("newMessage", {
    //         id: Date.now(),
    //         message: data.message,
    //         from: { id: data.senderId, name: "User" }, // Replace with real user data
    //         createdAt: new Date(),
    //         roomId: data.roomId,
    //       });
    //     }
    //   );

    //   socket.on("disconnect", () => {
    //     console.log("Client disconnected: ", socket.id);
    //   });
    // });
  } catch (err) {
    console.log("This is Error in Server: ", err);
    throw err;
  }
}

main();
