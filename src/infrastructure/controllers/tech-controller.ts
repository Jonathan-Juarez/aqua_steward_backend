import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import GetSystemStatsUseCase from "../../app/usecases/tech/get-system-stats.usecase";
import GetAllUsersTechUseCase from "../../app/usecases/tech/get-all-users-tech.usecase";
import TechRepositoryMongo from "../database/repositories/tech-repository.mongo";

const techRepository = new TechRepositoryMongo();
const getSystemStatsUseCase = new GetSystemStatsUseCase(techRepository);
const getAllUsersTechUseCase = new GetAllUsersTechUseCase(techRepository);

export class TechController {
    static async getStats(req: AuthRequest, res: Response) {
        const stats = await getSystemStatsUseCase.execute();
        return res.status(200).json(stats);
    }

    static async getUsers(req: AuthRequest, res: Response) {
        const users = await getAllUsersTechUseCase.execute();
        return res.status(200).json(users);
    }
}
