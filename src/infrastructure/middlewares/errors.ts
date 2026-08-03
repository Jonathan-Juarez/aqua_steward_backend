import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/CustomError";

// Middleware global para el manejo de errores.
export const errors = (e: Error, req: Request, res: Response, next: NextFunction) => {
    // Se valida que sea un error controlado.
    if (e instanceof CustomError) {
        return res.status(e.statusCode).json({
            errors: e.formatMessage(),
        });
    }

    if (e.name === "TokenExpiredError" || e.name === "JsonWebTokenError") {
        return res.status(401).json({
            errors: [{ message: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente." }],
        });
    }

    // Si el error no es controlado, se muestra uno genérico.
    console.error("Error inesperado:", e);

    return res.status(500).json({
        errors: [{ message: "Error interno del servidor" }],
    });
};
