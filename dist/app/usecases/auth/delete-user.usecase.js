"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NotFoundError_1 = require("../../../infrastructure/errors/NotFoundError");
class DeleteUserUseCase {
    authRepository;
    constructor(authRepository) {
        this.authRepository = authRepository;
    }
    // Se elimina un usuario mediante su correo.
    async execute(email) {
        const user = await this.authRepository.findByEmail(email);
        if (!user) {
            throw new NotFoundError_1.NotFoundError("El usuario no existe");
        }
        await this.authRepository.delete(email);
    }
}
exports.default = DeleteUserUseCase;
