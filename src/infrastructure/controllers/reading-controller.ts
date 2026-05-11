import { Response } from "express";
import GetReadingsUseCase from "../../app/usecases/readings/get-readings.usecase";
import DepositRepositoryMongo from "../database/repositories/deposit-repository.mongo";
import ReadingRepositoryMongo from "../database/repositories/reading-repository.mongo";
import { AuthRequest } from "../middlewares/auth";

// Se instancian los repositorios y se inyectan al caso de uso.
const depositRepository = new DepositRepositoryMongo();
const readingRepository = new ReadingRepositoryMongo();
const getReadingsUseCase = new GetReadingsUseCase(depositRepository, readingRepository);

// Se obtienen las lecturas diarias, semanales o mensuales de un sensor específico.
export const getReadings = async (req: AuthRequest, res: Response): Promise<Response | void> => {
    const depositId = String(req.params.depositId);
    const sensorType = String(req.params.sensorType);
    const filter = String(req.query.filter || "Dia");

    const readings = await getReadingsUseCase.execute({ depositId, sensorType, filter });

    return res.status(200).json(readings);
}
