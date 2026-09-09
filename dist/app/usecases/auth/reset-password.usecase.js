"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("../../../domain/entities/user"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const NotFoundError_1 = require("../../../infrastructure/errors/NotFoundError");
const ConflictError_1 = require("../../../infrastructure/errors/ConflictError");
class ResetPasswordUseCase {
    authRepository;
    constructor(authRepository) {
        this.authRepository = authRepository;
    }
    async execute(dto) {
        const user = await this.authRepository.findByEmail(dto.email);
        // Se valida si el correo existe lanzando un 404 estructurado.
        if (!user?.email)
            throw new NotFoundError_1.NotFoundError("El correo no existe");
        // Se valida la complejidad de la nueva contraseña con las reglas del dominio.
        user_1.default.validatePassword(dto.password);
        // Se valida que la contraseña nueva no coincida con la encriptada actualmente (Conflicto de estado).
        const isSamePassword = await bcryptjs_1.default.compare(dto.password, user.password);
        if (isSamePassword) {
            throw new ConflictError_1.ConflictError("La nueva contraseña no puede ser igual a la anterior");
        }
        // Se restaura la contraseña.
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(dto.password, salt);
        const updatedUser = await this.authRepository.resetPassword(dto.email, hashedPassword);
        return updatedUser;
    }
}
exports.default = ResetPasswordUseCase;
