import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IAuthRepository } from "../../../domain/repository/auth-repository.interface";
import { BadRequestError } from "../../../infrastructure/errors/BadRequestError";

export default class SigninUseCase {
    constructor(private authRepository: IAuthRepository) { }

    async execute(dto: any) {
        const user = await this.authRepository.findByEmail(dto.email);

        if (!user || !user.password) {
            throw new BadRequestError("El correo o contraseña es incorrecto");
        }

        const isMatch = await bcrypt.compare(dto.password, user.password);
        if (!isMatch) {
            throw new BadRequestError("El correo o contraseña es incorrecto");
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: "365d" });

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
