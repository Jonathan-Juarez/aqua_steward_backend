"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("../../../domain/entities/user"));
const ConflictError_1 = require("../../../infrastructure/errors/ConflictError");
// No sabe de Express (req, res) ni de MongoDB. Solo de DTOs y Entidades. Se comporta como un creador de usuario (createUser).
class SignupUseCase {
    authRepository;
    constructor(authRepository) {
        this.authRepository = authRepository;
    }
    async execute(dto) {
        const newUser = new user_1.default({
            name: dto.name,
            last_name: dto.last_name,
            email: dto.email,
            password: dto.password
        });
        newUser.validate();
        // Se comunica con el repositorio para ver si existe el email.
        const existingEmail = await this.authRepository.findByEmail(newUser.email);
        if (existingEmail) {
            throw new ConflictError_1.ConflictError("El correo electrónico ya existe");
        }
        // Se guarda usando el repositorio.
        const savedUser = await this.authRepository.save(newUser);
        return savedUser;
    }
}
exports.default = SignupUseCase;
