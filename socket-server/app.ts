import { Express } from "express";
import http from "http";
export class AppInit {
  private app: Express;
  private server: http.Server;
  private port: number;
  private host: string;

  constructor(options: { app: Express; port: number; host: string }) {
    this.app = options.app;
    this.port = options.port;
    this.host = options.host;
    this.server = http.createServer(this.app);
    this.server.listen(this.port, this.host, () => {
      console.log(`Listening to port ${this.port} and host ${this.host}`);
    });
  }

  public getServer() {
    return this.server;
  }

  public getApp() {
    return this.app;
  }
}
