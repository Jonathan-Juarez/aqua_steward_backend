import { Router, Response, NextFunction } from "express";
import auth, { AuthRequest } from "../../infrastructure/middlewares/auth";
import { requireTechnician } from "../../infrastructure/middlewares/authorize";
import GetSystemStatsUseCase from "../../app/usecases/tech/get-system-stats.usecase";
import GetAllUsersTechUseCase from "../../app/usecases/tech/get-all-users-tech.usecase";

export interface TechDependencies {
    getSystemStatsUseCase: GetSystemStatsUseCase;
    getAllUsersTechUseCase: GetAllUsersTechUseCase;
}

export function TechRouter(deps: TechDependencies): Router {
    const router = Router();

    // Todas las rutas requieren token y rol de técnico
    router.use(auth, requireTechnician);

    router.get("/stats", async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const stats = await deps.getSystemStatsUseCase.execute();
            return res.status(200).json(stats);
        } catch (error) {
            next(error);
        }
    });

    router.get("/users", async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const users = await deps.getAllUsersTechUseCase.execute();
            return res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    });

    return router;
}

export default TechRouter;


