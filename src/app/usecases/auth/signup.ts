import User from "../../../domain/entities/user";
import { IUserRepository } from "../../../domain/repository/user-repository.interface";

// No sabe de Express (req, res) ni de MongoDB. Solo de DTOs y Entidades. Se comporta como un creador de usuario (createUser).
export default class SignupUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(dto: any) {
        const newUser = new User({
            name: dto.name,
            last_name: dto.last_name,
            email: dto.email,
            password: dto.password
        });

        newUser.validate();

        // Se comunica con el repositorio para ver si existe el email.
        const existingEmail = await this.userRepository.findByEmail(newUser.email!);
        if (existingEmail) {
            throw new Error("El correo electrónico ya existe");
        }

        // Se guarda usando el repositorio.
        const savedUser = await this.userRepository.save(newUser);
        return savedUser;
    }
}
