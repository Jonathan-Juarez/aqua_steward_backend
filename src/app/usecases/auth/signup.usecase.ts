import User from "../../../domain/entities/user";
import { IAuthRepository } from "../../../domain/repository/auth-repository.interface";
import { ConflictError } from "../../../infrastructure/errors/ConflictError";

// No sabe de Express (req, res) ni de MongoDB. Solo de DTOs y Entidades. Se comporta como un creador de usuario (createUser).
export default class SignupUseCase {
    constructor(private authRepository: IAuthRepository) { }

    async execute(dto: any) {
        const newUser = new User({
            name: dto.name,
            last_name: dto.last_name,
            email: dto.email,
            password: dto.password
        });

        newUser.validate();

        // Se comunica con el repositorio para ver si existe el email.
        const existingEmail = await this.authRepository.findByEmail(newUser.email!);
        if (existingEmail) {
            throw new ConflictError("El correo electrónico ya existe");
        }

        // Se guarda usando el repositorio.
        const savedUser = await this.authRepository.save(newUser);
        return savedUser;
    }
}
