import { IAuthRepository } from '../../../domain/repository/auth-repository.interface';
import { NotFoundError } from '../../../infrastructure/errors/NotFoundError';
import { BadRequestError } from '../../../infrastructure/errors/BadRequestError';

export default class UpdateUserUseCase {
    constructor(private authRepository: IAuthRepository) { }

    async execute(dto: any) {
        const user = await this.authRepository.findById(dto.id);
        if (!user) {
            throw new NotFoundError("El usuario no existe");
        }
        // Verifica si los datos enviados son idénticos a los actuales para evitar actualizaciones redundantes.
        if (user.name === dto.data?.name && user.last_name === dto.data?.last_name) {
            throw new BadRequestError("No se detectaron cambios para actualizar");
        }

        const updatedUser = await this.authRepository.update(dto.id, dto.data);
        return updatedUser;
    }
}