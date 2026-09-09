"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const BadRequestError_1 = require("../../../infrastructure/errors/BadRequestError");
class SigninUseCase {
    authRepository;
    constructor(authRepository) {
        this.authRepository = authRepository;
    }
    async execute(dto) {
        const user = await this.authRepository.findByEmail(dto.email);
        if (!user || !user.password) {
            throw new BadRequestError_1.BadRequestError("El correo o contraseña es incorrecto");
        }
        const isMatch = await bcryptjs_1.default.compare(dto.password, user.password);
        if (!isMatch) {
            throw new BadRequestError_1.BadRequestError("El correo o contraseña es incorrecto");
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "365d" });
        const userWithoutPassword = {
            id: user.id,
            name: user.name,
            last_name: user.last_name,
            email: user.email,
            assigned_deposits: user.assigned_deposits,
            global_role: user.global_role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        return {
            token: token,
            user: userWithoutPassword
        };
    }
}
exports.default = SigninUseCase;
