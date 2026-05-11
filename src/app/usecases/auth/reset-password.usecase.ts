import { IAuthRepository } from "../../../domain/repository/auth-repository.interface";
import User from "../../../domain/entities/user";
import bcrypt from "bcryptjs";
import { NotFoundError } from "../../../infrastructure/errors/NotFoundError";
import { ConflictError } from "../../../infrastructure/errors/ConflictError";

export default class ResetPasswordUseCase {
    constructor(private authRepository: IAuthRepository) { }

    async execute(dto: any) {
        const user = await this.authRepository.findByEmail(dto.email);

        // Se valida si el correo existe lanzando un 404 estructurado.
        if (!user?.email) throw new NotFoundError("El correo no existe");

        // Se valida la complejidad de la nueva contraseña con las reglas del dominio.
        User.validatePassword(dto.password);

        // Se valida que la contraseña nueva no coincida con la encriptada actualmente (Conflicto de estado).
        const isSamePassword = await bcrypt.compare(dto.password, user.password!);
        if (isSamePassword) {
            throw new ConflictError("La nueva contraseña no puede ser igual a la anterior");
        }

        // Se restaura la contraseña.
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(dto.password, salt);
        const updatedUser = await this.authRepository.resetPassword(dto.email, hashedPassword);

        return updatedUser;
    }
}