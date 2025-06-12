import express, { Request, Response, Router } from "express";
import { UserLoginDoc } from "../../../modules/auth/docs/auth.user.doc";
import { RequestBodyValidation } from "../../../common/request/validator/request.body.validator";
import { asyncHandler } from "../../../utils/async.handler";
import { AuthUserController } from "../../../modules/auth/controllers/auth.user.controller";
import { UserLoginDto } from "../../../modules/auth/dtos/user.login.dto";
import { ValidationException } from "../../../common/exceptions/validation.exception";
import { HttpStatusCode } from "../../../common/constants/http.status.code.constant";
import { UserProtectedGuard } from "../../../common/request/guards/authenticated.user";
import { REQUEST_META } from "../../../common/request/constants/request.constant";

export class UserAuthRoute {
  static userAuthRouter: Router = express.Router();

  public static getUserAuthRouter(): Router {
    UserAuthRoute.login("/login");
    UserAuthRoute.authMe("/auth-me");
    return UserAuthRoute.userAuthRouter;
  }

  @UserLoginDoc()
  public static login(path: string): Router {
    const authUserController: AuthUserController = new AuthUserController();
    return this.userAuthRouter.post(
      path,
      RequestBodyValidation(UserLoginDto),
      asyncHandler(async (req: Request, res: Response) => {
        const { email, userName } = req.body;
        if (!email && !userName) {
          throw new ValidationException(
            HttpStatusCode.UNPROCESSABLE_ENTITY,
            "At least one email or username is required."
          );
        }
        const data = await authUserController.login(req.body);
        res.json(data);
      })
    );
  }

  public static authMe(path: string): Router {
    const authUserController: AuthUserController = new AuthUserController();
    return this.userAuthRouter.get(
      path,
      UserProtectedGuard,
      asyncHandler(async (req: Request, res: Response) => {
        const id = Number(req[REQUEST_META.PROTECTED_USER]);
        const incomingData = await authUserController.authMe(id);
        const data = {
          id: incomingData.id,
          name: incomingData.userName,
          email: incomingData.email,
        };
        res.json(data);
      })
    );
  }
}
