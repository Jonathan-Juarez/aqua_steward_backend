import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Interfaz para inyectar el usuario decodificado en el objeto Request
export interface AuthRequest extends Request {
    user?: any;
}

// Middleware de autenticación para verificar el token.
const auth = (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
    try {
        const token = req.header("x-auth-token");
        if (!token) {
            return res.status(401).json({ msg: "No se proporcionó un token, autorización denegada." });
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET!);
        if (!verified) {
            return res.status(401).json({ msg: "La verificación del token falló, autorización denegada." });
        }

        req.user = verified;

        next(); // Se continúa al controlador (next middleware)
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
};

export default auth;
