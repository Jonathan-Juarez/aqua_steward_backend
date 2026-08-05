import rateLimit from "express-rate-limit";

// Función para crear limitadores de tasa con cálculo de tiempo restante.
export const createLimiter = (windowMs: number, max: number) =>
    rateLimit({
        windowMs,
        max,
        // Custom handler para formato limpio y tiempo restante estimado.
        handler: (req, res) => {
            const resetTime = (req as any).rateLimit?.resetTime as Date | undefined;
            let timeStr = "unos minutos";
            if (resetTime) {
                const diffMs = resetTime.getTime() - Date.now();
                const totalSeconds = Math.max(0, Math.ceil(diffMs / 1000));
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                timeStr = minutes > 0 ? `${minutes} min y ${seconds} s` : `${seconds} s`;
            }
            res.status(429).json({
                errors: [{ message: `Demasiadas peticiones. Intenta de nuevo en ${timeStr}.` }]
            });
        }
    });