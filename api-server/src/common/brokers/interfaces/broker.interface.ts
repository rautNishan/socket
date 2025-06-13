import { Message } from "amqplib";

export interface IBrokerInterface {
  publish(
    exchange: string,
    exchangeType: string,
    message: any,
    routingKey: string,
    options?: any
  ): Promise<any>;
  consume(
    exchange: string,
    exchangeType: string,
    queueName: string,
    callback: (message: Message | null) => Promise<void>,
    options?: any
  ): Promise<any>;
}
