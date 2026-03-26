import { Request, Response } from "express";
import CreateDepositUseCase from "../../app/usecases/deposits/create-deposit";
import GetDepositsUseCase from "../../app/usecases/deposits/get-deposits";
import DeleteDepositUseCase from "../../app/usecases/deposits/delete-deposit";
import MongoDepositRepository from "../database/repositories/deposit-repository.mongo";

// Se genera la instancia del repositorio para MongoDB.
const depositRepository = new MongoDepositRepository();

// Se provee la infraestructura real a los casos de uso.
const createDepositUseCase = new CreateDepositUseCase(depositRepository);
const getDepositsUseCase = new GetDepositsUseCase(depositRepository);
const deleteDepositUseCase = new DeleteDepositUseCase(depositRepository);

export const createDeposit = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const depositData = req.body;
        if (!depositData) {
            return res.status(400).json({ error: "El cuerpo de la petición está vacío. Asegúrate de enviar el Content-Type: application/json" });
        }

        const savedDeposit = await createDepositUseCase.execute(depositData);
        return res.status(201).json(savedDeposit);
    } catch (e: any) {
        if (e.message.includes("ya existe")) {
            // Se utiliza 409 Conflict cuando ya existe un recurso.
            return res.status(409).json({ message: e.message, error: e.message });
        }

        if (e.message.includes("inválida") || e.message.includes("positivo") || e.message.includes("requeríd")) {
            // Se utiliza 400 Bad request cuando el usuario manda datos incorrectos o falla la validación.
            return res.status(400).json({ message: e.message, error: e.message });
        }

        // Se utiliza 500 Internal server error cuando hay un error en el servidor.
        return res.status(500).json({ message: e.message, error: e.message });
    }
}

// req: any para permitir leer req.user. Normalmente se extendería el tipo Request de Express.
export const getDeposits = async (req: any, res: Response): Promise<Response | void> => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "No hay usuario autenticado. Agrega el header x-auth-token." });
        }
        const ownerId = String(req.user.id);

        const deposits = await getDepositsUseCase.execute(ownerId);
        return res.status(200).json(deposits);
    } catch (e: any) {
        return res.status(500).json({ message: e.message, error: e.message });
    }
}

export const deleteDeposit = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const depositId = String(req.params.id);
        const deletedDeposit = await deleteDepositUseCase.execute(depositId);
        return res.status(200).json(deletedDeposit);
    } catch (e: any) {
        return res.status(500).json({ message: e.message, error: e.message });
    }
}
