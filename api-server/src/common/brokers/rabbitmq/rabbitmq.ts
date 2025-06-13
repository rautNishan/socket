import { IBrokerInterface } from "../interfaces/broker.interface";
import amqp, { Channel, Connection, Message } from "amqplib";
export class RabbitMQ implements IBrokerInterface {
  private static _connection: Connection | null = null;
  private static _publishChannel = null;
  private static _consumeChannel = null;

  public static async connection() {
    try {
      this._connection = await amqp.connect(
        "amqp://user:password@localhost:5672"
      );

      console.log("Rabbit mq connection completed");
    } catch (error) {
      console.log("Error while connectig to rabbitmq: ", error);

      throw error;
    }
  }

  private static async getPublishChannel(): Promise<Channel> {
    if (!this._connection) {
      throw Error("Connection not established");
    }

    if (!this._publishChannel) {
      this._publishChannel = await this._connection.createChannel();
    }

    return this._publishChannel;
  }

  private static async getConsumeChannel(): Promise<Channel> {
    if (!this._connection) {
      throw Error("Connection not established");
    }

    if (!this._consumeChannel) {
      this._consumeChannel = await this._connection.createChannel();
    }

    return this._consumeChannel;
  }

  async publish(
    exchange: string,
    exchangeType: "fanout" | "topic" | "direct" | "headers",
    message: any,
    routingKey: string = "",
    options?: any
  ): Promise<boolean> {
    try {
      const channel: Channel = await RabbitMQ.getPublishChannel();
      await channel.assertExchange(exchange, exchangeType, { durable: true });
      const messageBuffer = Buffer.from(JSON.stringify(message));
      return channel.publish(exchange, routingKey, messageBuffer, {
        persistent: true,
        timestamp: Date.now(),
        ...options,
      });
    } catch (error) {
      console.log("Error while publishing message: ", error);
      throw error;
    }
  }

  async consume(
    exchange: string,
    exchangeType: "fanout" | "topic" | "direct" | "headers",
    queueName: string,
    callback: (message: Message | null) => Promise<void>,
    options?: any
  ): Promise<void> {
    try {
      const channel: Channel = await RabbitMQ.getConsumeChannel();
      await channel.assertExchange(exchange, exchangeType, { durable: true });
      await channel.assertQueue(queueName, { durable: true });
      await channel.bindQueue(queueName, exchange);
      await channel.prefetch(1);

      await channel.consume(queueName, callback, {
        noAck: true,
        ...options,
      });
    } catch (error) {
      console.log("Error while consuming: ", error);

      throw error;
    }
  }
}
