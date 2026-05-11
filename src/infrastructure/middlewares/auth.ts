import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/UnauthorizedError";

// Interfaz para inyectar el usuario decodificado en el objeto Request
export interface AuthRequest extends Request {
    user?: any;
}

// Middleware de autenticación para verificar el token.
const auth = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        const token = req.header("x-auth-token");
        if (!token) {
            throw new UnauthorizedError("No se proporcionó un token.");
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET!);
        if (!verified) {
            throw new UnauthorizedError("La verificación del token falló.");
        }

        req.user = verified;

        next(); // Se continúa al controlador (next middleware)
    } catch (e: any) {
        next(e); // Se delega al middleware global de errores.
    }
};

export default auth;
