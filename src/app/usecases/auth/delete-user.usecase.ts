import { IAuthRepository } from "../../../domain/repository/auth-repository.interface";
import { NotFoundError } from "../../../infrastructure/errors/NotFoundError";

export default class DeleteUserUseCase {
    constructor(private authRepository: IAuthRepository) { }

    // Se elimina un usuario mediante su correo.
    async execute(email: string): Promise<void> {
        const user = await this.authRepository.findByEmail(email);
        if (!user) {
            throw new NotFoundError("El usuario no existe");
        }

        await this.authRepository.delete(email);
    }
}