import { Server as SocketIOServer } from "socket.io";
import { SOCKET_CONSTANTS } from "./constants/socket.constatns";
import { RabbitMQ } from "./brokers/rabbitmq/rabbitmq";

export class SocketServer {
  private _io: SocketIOServer;
  constructor(io: SocketIOServer) {
    this._io = io;
  }

  async init() {
    console.log("This is init");

    try {
      this._io.on("connection", (socket) => {
        console.log("Connected");

        //Join Room
        socket.on(SOCKET_CONSTANTS.JOIN_ROOM, (roomId: number) => {
          console.log("This is room number join on: ", roomId);
          socket.join(String(roomId));
        });

        //For Sending Messages
        socket.on(
          SOCKET_CONSTANTS.SEND_MESSAGES,
          async (data: {
            roomId: number;
            message: string;
            senderId: number;
          }) => {
            console.log("This is data: ", data);
            //Push to rabbit mq
            const rabbitMq = new RabbitMQ();
            await rabbitMq.publish("new_message", "fanout", data);

            this._io
              .to(String(data.roomId))
              .emit(SOCKET_CONSTANTS.NEW_MESSAGE, {
                message: data.message,
                from: { id: data.senderId },
                roomId: data.roomId,
              });
          }
        );

        socket.on("disconnect", () => {
          console.log("Client disconnected: ", socket.id);
        });
      });
    } catch (error) {
      console.log("This is error: ", error);
      throw error;
    }
  }
}
