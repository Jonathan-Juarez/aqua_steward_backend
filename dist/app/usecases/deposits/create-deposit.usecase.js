"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deposit_1 = __importDefault(require("../../../domain/entities/deposit"));
const ConflictError_1 = require("../../../infrastructure/errors/ConflictError");
const NotFoundError_1 = require("../../../infrastructure/errors/NotFoundError");
class CreateDepositUseCase {
    depositRepository;
    authRepository;
    constructor(depositRepository, authRepository) {
        this.depositRepository = depositRepository;
        this.authRepository = authRepository;
    }
    async execute(dto) {
        const newDeposit = new deposit_1.default({
            name: dto.name,
            ip: dto.ip,
            capacity: dto.capacity,
            installation_height: dto.installation_height,
            fill_gap: dto.fill_gap,
            owner_id: dto.owner_id,
            sensors: dto.sensors
        });
        newDeposit.validate();
        const existingDeposit = await this.depositRepository.findByIp(newDeposit.ip);
        if (existingDeposit) {
            throw new ConflictError_1.ConflictError("La IP ya existe en un depósito");
        }
        const savedDeposit = await this.depositRepository.save(newDeposit);
        // Tras crear exitosamente el depósito, se busca al usuario que lo creó y se añade un objeto en assigned_deposit { role: "owner", deposit: savedDeposit.id }.
        const user = await this.authRepository.findById(dto.owner_id);
        if (!user) {
            throw new NotFoundError_1.NotFoundError("El usuario no existe");
        }
        // Si el usuario no tiene depósitos asignados, se inicializa el array.
        if (!user.assigned_deposits) {
            user.assigned_deposits = [];
        }
        // Se agrega el depósito al usuario como propietario.
        user.assigned_deposits.push({ role: "owner", status: "accepted", deposit_id: savedDeposit.id });
        // Se actualiza el usuario.
        await this.authRepository.update(user.id, user);
        return savedDeposit;
    }
}
exports.default = CreateDepositUseCase;
