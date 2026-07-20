import { Response } from "express";
import CreateDepositUseCase from "../../app/usecases/deposits/create-deposit.usecase";
import GetDepositsUseCase from "../../app/usecases/deposits/get-deposits.usecase";
import DeleteDepositUseCase from "../../app/usecases/deposits/delete-deposit.usecase";
import UpdateDepositUseCase from "../../app/usecases/deposits/update-deposit.usecase";
import MongoDepositRepository from "../database/repositories/deposit-repository.mongo";
import MongoAuthRepository from "../database/repositories/auth-repository.mongo";
import { TeamRepositoryMongo } from "../database/repositories/team-repository.mongo";
import { AuthRequest } from "../middlewares/auth";

// Se instancia el repositorio y se inyecta a los casos de uso.
const depositRepository = new MongoDepositRepository();
const authRepository = new MongoAuthRepository();
const teamRepository = new TeamRepositoryMongo();
const createDepositUseCase = new CreateDepositUseCase(depositRepository, authRepository);
const getDepositsUseCase = new GetDepositsUseCase(depositRepository, authRepository);
const deleteDepositUseCase = new DeleteDepositUseCase(depositRepository, teamRepository);
const updateDepositUseCase = new UpdateDepositUseCase(depositRepository);

// Se crea un nuevo depósito con los datos del body.
export const createDeposit = async (req: AuthRequest, res: Response): Promise<Response | void> => {
    const savedDeposit = await createDepositUseCase.execute(req.body);
    return res.status(201).json(savedDeposit);
}

// Se obtienen los depósitos del usuario autenticado.
export const getDeposits = async (req: AuthRequest, res: Response): Promise<Response | void> => {
    const ownerId = String(req.user.id);
    const deposits = await getDepositsUseCase.execute(ownerId);
    return res.status(200).json(deposits);
}

// Se elimina un depósito por su ID de parámetro.
export const deleteDeposit = async (req: AuthRequest, res: Response): Promise<Response | void> => {
    const depositId = String(req.params.id);
    const deletedDeposit = await deleteDepositUseCase.execute(depositId);
    return res.status(200).json(deletedDeposit);
}

// Se actualiza un depósito por su ID con los datos parciales del body.
export const updateDeposit = async (req: AuthRequest, res: Response): Promise<Response | void> => {
    const depositId = String(req.params.id);
    const updatedDeposit = await updateDepositUseCase.execute(depositId, req.body);
    return res.status(200).json(updatedDeposit);
}