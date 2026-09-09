"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositController = void 0;
const create_deposit_usecase_1 = __importDefault(require("../../app/usecases/deposits/create-deposit.usecase"));
const get_deposits_usecase_1 = __importDefault(require("../../app/usecases/deposits/get-deposits.usecase"));
const delete_deposit_usecase_1 = __importDefault(require("../../app/usecases/deposits/delete-deposit.usecase"));
const update_deposit_usecase_1 = __importDefault(require("../../app/usecases/deposits/update-deposit.usecase"));
const deposit_repository_mongo_1 = __importDefault(require("../database/repositories/deposit-repository.mongo"));
const auth_repository_mongo_1 = __importDefault(require("../database/repositories/auth-repository.mongo"));
const team_repository_mongo_1 = require("../database/repositories/team-repository.mongo");
// Se instancia el repositorio y se inyecta a los casos de uso.
const depositRepository = new deposit_repository_mongo_1.default();
const authRepository = new auth_repository_mongo_1.default();
const teamRepository = new team_repository_mongo_1.TeamRepositoryMongo();
const createDepositUseCase = new create_deposit_usecase_1.default(depositRepository, authRepository);
const getDepositsUseCase = new get_deposits_usecase_1.default(depositRepository, authRepository);
const deleteDepositUseCase = new delete_deposit_usecase_1.default(depositRepository, teamRepository);
const updateDepositUseCase = new update_deposit_usecase_1.default(depositRepository);
class DepositController {
    // Se crea un nuevo depósito con los datos del body.
    static async createDeposit(req, res) {
        const savedDeposit = await createDepositUseCase.execute(req.body);
        return res.status(201).json(savedDeposit);
    }
    // Se obtienen los depósitos del usuario autenticado.
    static async getDeposits(req, res) {
        const ownerId = String(req.user.id);
        const deposits = await getDepositsUseCase.execute(ownerId);
        return res.status(200).json(deposits);
    }
    // Se elimina un depósito por su ID de parámetro.
    static async deleteDeposit(req, res) {
        const depositId = String(req.params.id);
        const deletedDeposit = await deleteDepositUseCase.execute(depositId);
        return res.status(200).json(deletedDeposit);
    }
    // Se actualiza un depósito por su ID con los datos parciales del body.
    static async updateDeposit(req, res) {
        const depositId = String(req.params.id);
        const updatedDeposit = await updateDepositUseCase.execute(depositId, req.body);
        return res.status(200).json(updatedDeposit);
    }
}
exports.DepositController = DepositController;
