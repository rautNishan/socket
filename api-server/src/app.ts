import { Express } from "express";

import { IAppOptions } from "./common/interfaces/app.interface";
import { ICustomRouter } from "./common/interfaces/router.interface";
import http from "http";
export class AppInit {
  private app: Express;
  private server: http.Server;
  private port: number;

  private host: string;
  constructor(options: IAppOptions) {
    this.app = options.app;
    this.port = options.port;
    this.host = options.host;

    this.initializeMiddlewares(options.beforeRouteMiddlewares);

    this.initializeRoutes(options.routes);

    this.initializeMiddlewares(options.afterRouteMiddleWares);
    this.server = http.createServer(this.app);
    this.server.listen(this.port, this.host, () => {
      console.log(`Listening to port ${this.port} and host ${this.host}`);
    });
  }

  private initializeMiddlewares(middlewares?: any[]) {
    middlewares?.forEach((middleware) => {
      this.app.use(middleware);
    });
  }

  private initializeRoutes(routes: ICustomRouter[]) {
    routes.forEach((route) => {
      console.log(`Initializing Routes ${route.routeName}`);
      this.app.use(route.routeName, route.router);
    });
  }

  public getServer() {
    return this.server;
  }

  public getApp() {
    return this.app;
  }
  //For Static content
  // private initializeStaticContent() {
  //   this.app.use();
  // }
}
