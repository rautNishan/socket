import express, { Express } from "express";
import { AppInit } from "./app";

import { Server as SocketIOServer } from "socket.io";
import { SocketServer } from "./socket";
import { RabbitMQ } from "./brokers/rabbitmq/rabbitmq";
export async function main() {
  try {
    const app: Express = express();
    const port: number = Number(3002);
    const host: string | undefined = "localhost";

    const appInit = new AppInit({
      app: app,
      port: port,
      host: host,
    });

    const io: SocketIOServer = new SocketIOServer(appInit.getServer(), {
      cors: {
        origin: "*", // Or restrict to your frontend URL
        methods: ["GET", "POST"],
      },
    });
    const socket = new SocketServer(io);
    socket.init();
    await RabbitMQ.connection();
  } catch (err) {
    console.log("This is Error in Server: ", err);
    throw err;
  }
}

main();
