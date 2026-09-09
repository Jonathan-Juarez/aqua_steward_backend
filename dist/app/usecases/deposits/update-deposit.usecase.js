"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deposit_1 = __importDefault(require("../../../domain/entities/deposit"));
const BadRequestError_1 = require("../../../infrastructure/errors/BadRequestError");
const NotFoundError_1 = require("../../../infrastructure/errors/NotFoundError");
const ConflictError_1 = require("../../../infrastructure/errors/ConflictError");
class UpdateDepositUseCase {
    depositRepository;
    constructor(depositRepository) {
        this.depositRepository = depositRepository;
    }
    async execute(id, data) {
        if (!id)
            throw new BadRequestError_1.BadRequestError("No se proporcionó el ID del depósito a actualizar");
        // Se obtiene el depósito existente.
        const existingDeposit = await this.depositRepository.findById(id);
        if (!existingDeposit)
            throw new NotFoundError_1.NotFoundError("No se encontró el depósito a actualizar");
        // Se preservan los _id de MongoDB de los sensores existentes para conservar el historial.
        const mergedSensors = data.sensors?.map(newSensor => {
            const currentSensor = existingDeposit.sensors?.find(s => s.type === newSensor.type);
            return currentSensor?._id ? { ...newSensor, _id: currentSensor._id } : newSensor;
        }) ?? existingDeposit.sensors;
        // Se crea la nueva entidad de Dominio fusionada.
        const updatedDeposit = new deposit_1.default({
            ...existingDeposit,
            ...data,
            sensors: mergedSensors
        });
        // Se validan las reglas de negocio en la Entidad (IP, dimensiones y al menos un sensor activo).
        updatedDeposit.validate();
        // Si cambió la IP, se verifica que no esté duplicada en otro depósito.
        if (data.ip && data.ip !== existingDeposit.ip) {
            const ipConflict = await this.depositRepository.findByIp(data.ip);
            if (ipConflict)
                throw new ConflictError_1.ConflictError("La IP ya pertenece a otro depósito");
        }
        // Se guardan los cambios.
        return await this.depositRepository.update(id, updatedDeposit);
    }
}
exports.default = UpdateDepositUseCase;
