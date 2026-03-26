import { IUserRepository } from "../../../domain/repository/user-repository.interface";
import bcrypt from "bcryptjs";

export default class restorePasswordUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(dto: any) {
        const user = await this.userRepository.findByEmail(dto.email);

        // Se valida si el correo existe.
        if (!user?.email) {
            throw new Error("El correo no existe");
        }
        // Se valida que la contraseña nueva no coincida con la encriptada actualmente.
        const isSamePassword = await bcrypt.compare(dto.password, user.password!);
        if (isSamePassword) {
            throw new Error("La contraseña no puede ser la misma");
        }

        // Se restaura la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(dto.password, salt);
        const updatedUser = await this.userRepository.restorePassword(dto.email, hashedPassword);

        return updatedUser;
    }

}