import { Request, Response } from "express";
import SignupUseCase from "../../app/usecases/auth/signup";
import SigninUseCase from "../../app/usecases/auth/signin";
import RestorePasswordUseCase from "../../app/usecases/auth/restore-password";
import UserRepositoryMongo from "../database/repositories/user-repository.mongo";

// Se instancia el repositorio de MongoDB una sola vez
const userRepository = new UserRepositoryMongo();

// Se inyecta la dependencia real a los Casos de Uso del Dominio
const signupUseCase = new SignupUseCase(userRepository);
const signinUseCase = new SigninUseCase(userRepository);
const restorePasswordUseCase = new RestorePasswordUseCase(userRepository);

export const signup = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const user = await signupUseCase.execute(req.body);
        return res.status(201).json(user);
    } catch (e: any) {
        if (e.message.includes("ya existe")) {
            // Se utiliza 409 Conflict cuando ya existe un recurso.
            return res.status(409).json({ message: e.message, error: e.message });
        }

        // Se utiliza 500 Internal server error cuando ocurre un error algorítmico en el servidor.
        return res.status(500).json({ message: e.message, error: e.message });
    }
}

export const signin = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const result = await signinUseCase.execute(req.body);
        return res.json(result);
    } catch (e: any) {
        if (e.message.includes("incorrecto")) {
            // Se utiliza 400 Bad request cuando el usuario manda datos incorrectos.
            return res.status(400).json({ message: e.message, error: e.message });
        }

        return res.status(500).json({ message: e.message, error: e.message });
    }
}

export const restorePassword = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const user = await restorePasswordUseCase.execute(req.body);
        return res.status(200).json(user);
    } catch (e: any) {
        if (e.message.includes("no existe")) {
            // Se utiliza 404 Not Found cuando el recurso no existe.
            return res.status(404).json({ message: e.message, error: e.message });
        }
        if (e.message.includes("misma")) {
            return res.status(409).json({ message: e.message, error: e.message });
        }

        return res.status(500).json({ message: e.message, error: e.message });
    }
}
