import { Request, Response } from "express";
import SignupUseCase from "../../app/usecases/auth/signup.usecase";
import SigninUseCase from "../../app/usecases/auth/signin.usecase";
import ResetPasswordUseCase from "../../app/usecases/auth/reset-password.usecase";
import UserRepositoryMongo from "../database/repositories/auth-repository.mongo";
import UpdateUserUseCase from "../../app/usecases/auth/update-user.usecase";

// Se instancia el repositorio de MongoDB una sola vez
const userRepository = new UserRepositoryMongo();

// Se inyecta la dependencia real a los Casos de Uso del Dominio
const signupUseCase = new SignupUseCase(userRepository);
const signinUseCase = new SigninUseCase(userRepository);
const resetPasswordUseCase = new ResetPasswordUseCase(userRepository);
const updateUserUseCase = new UpdateUserUseCase(userRepository);

export const signup = async (req: Request, res: Response): Promise<Response | void> => {
    const user = await signupUseCase.execute(req.body);
    return res.status(201).json(user);
}

export const signin = async (req: Request, res: Response): Promise<Response | void> => {
    const result = await signinUseCase.execute(req.body);
    return res.status(200).json(result);
}

export const resetPassword = async (req: Request, res: Response): Promise<Response | void> => {
    const user = await resetPasswordUseCase.execute(req.body);
    return res.status(200).json(user);
}

export const updateUser = async (req: Request, res: Response): Promise<Response | void> => {
    const user = await updateUserUseCase.execute(req.body);
    return res.status(200).json(user);
}