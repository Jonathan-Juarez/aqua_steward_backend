import { Router, Request, Response, NextFunction } from "express";
import auth, { AuthRequest } from "../../infrastructure/middlewares/auth";
import SignupUseCase from "../../app/usecases/auth/signup.usecase";
import SigninUseCase from "../../app/usecases/auth/signin.usecase";
import ResetPasswordUseCase from "../../app/usecases/auth/reset-password.usecase";
import UpdateUserUseCase from "../../app/usecases/auth/update-user.usecase";
import DeleteUserUseCase from "../../app/usecases/auth/delete-user.usecase";
import SendOtpUseCase from "../../app/usecases/auth/send-otp.usecase";
import VerifyOtpUseCase from "../../app/usecases/auth/verify-otp.usecase";

export interface AuthDependencies {
    sendOtpUseCase: SendOtpUseCase;
    verifyOtpUseCase: VerifyOtpUseCase;
    signupUseCase: SignupUseCase;
    signinUseCase: SigninUseCase;
    resetPasswordUseCase: ResetPasswordUseCase;
    updateUserUseCase: UpdateUserUseCase;
    deleteUserUseCase: DeleteUserUseCase;
}

export function AuthRouter(deps: AuthDependencies): Router {
    const router = Router();

    router.post("/send-otp", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await deps.sendOtpUseCase.execute(req.body.email);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    });

    router.post("/verify-otp", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await deps.verifyOtpUseCase.execute(req.body.email, req.body.otp);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    });

    router.post("/signup", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await deps.signupUseCase.execute(req.body);
            return res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    });

    router.post("/signin", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await deps.signinUseCase.execute(req.body);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    });

    router.put("/restore-password", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await deps.resetPasswordUseCase.execute(req.body);
            return res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    });

    router.put("/update-user", auth, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await deps.updateUserUseCase.execute(req.body);
            return res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    });

    router.delete("/delete-user", auth, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await deps.deleteUserUseCase.execute(req.body.email);
            return res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    });

    return router;
}

export default AuthRouter;


