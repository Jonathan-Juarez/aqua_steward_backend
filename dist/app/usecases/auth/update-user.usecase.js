"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NotFoundError_1 = require("../../../infrastructure/errors/NotFoundError");
const BadRequestError_1 = require("../../../infrastructure/errors/BadRequestError");
class UpdateUserUseCase {
    authRepository;
    constructor(authRepository) {
        this.authRepository = authRepository;
    }
    async execute(dto) {
        const user = await this.authRepository.findById(dto.id);
        if (!user) {
            throw new NotFoundError_1.NotFoundError("El usuario no existe");
        }
        // Verifica si los datos enviados son idénticos a los actuales para evitar actualizaciones redundantes.
        if (user.name === dto.data?.name && user.last_name === dto.data?.last_name) {
            throw new BadRequestError_1.BadRequestError("No se detectaron cambios para actualizar");
        }
        const updatedUser = await this.authRepository.update(dto.id, dto.data);
        return updatedUser;
    }
}
exports.default = UpdateUserUseCase;
