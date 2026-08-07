import { Request, Response } from "express";
import SignupUseCase from "../../app/usecases/auth/signup.usecase";
import SigninUseCase from "../../app/usecases/auth/signin.usecase";
import ResetPasswordUseCase from "../../app/usecases/auth/reset-password.usecase";
import UserRepositoryMongo from "../database/repositories/auth-repository.mongo";
import UpdateUserUseCase from "../../app/usecases/auth/update-user.usecase";
import DeleteUserUseCase from "../../app/usecases/auth/delete-user.usecase";
import SendOtpUseCase from "../../app/usecases/auth/send-otp.usecase";
import VerifyOtpUseCase from "../../app/usecases/auth/verify-otp.usecase";

// Se instancia el repositorio de MongoDB una sola vez
const userRepository = new UserRepositoryMongo();

// Se inyecta la dependencia real a los Casos de Uso del Dominio
const signupUseCase = new SignupUseCase(userRepository);
const signinUseCase = new SigninUseCase(userRepository);
const resetPasswordUseCase = new ResetPasswordUseCase(userRepository);
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const deleteUserUseCase = new DeleteUserUseCase(userRepository);
// OTP
const sendOtpUseCase = new SendOtpUseCase();
const verifyOtpUseCase = new VerifyOtpUseCase();

export class AuthController {
    static async sendOtp(req: Request, res: Response) {
        const result = await sendOtpUseCase.execute(req.body.email);
        return res.status(200).json(result);
    }

    static async verifyOtp(req: Request, res: Response) {
        const result = await verifyOtpUseCase.execute(req.body.email, req.body.otp);
        return res.status(200).json(result);
    }

    static async signup(req: Request, res: Response) {
        const user = await signupUseCase.execute(req.body);
        return res.status(201).json(user);
    }

    static async signin(req: Request, res: Response) {
        const result = await signinUseCase.execute(req.body);
        return res.status(200).json(result);
    }

    static async resetPassword(req: Request, res: Response) {
        const user = await resetPasswordUseCase.execute(req.body);
        return res.status(200).json(user);
    }

    static async updateUser(req: Request, res: Response) {
        const user = await updateUserUseCase.execute(req.body);
        return res.status(200).json(user);
    }

    static async deleteUser(req: Request, res: Response) {
        const user = await deleteUserUseCase.execute(req.body.email);
        return res.status(200).json(user);
    }
}