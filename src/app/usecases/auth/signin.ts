import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUserRepository } from "../../../domain/repository/user-repository.interface";

export default class SigninUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(dto: any) {
        const user = await this.userRepository.findByEmail(dto.email);

        if (!user || !user.password) {
            throw new Error("El correo o contraseña es incorrecto");
        }

        const isMatch = await bcrypt.compare(dto.password, user.password);
        if (!isMatch) {
            throw new Error("El correo o contraseña es incorrecto");
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

        const userWithoutPassword = {
            id: user.id,
            name: user.name,
            last_name: user.last_name,
            email: user.email,
            assigned_deposits: user.assigned_deposits,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        return {
            token: token,
            user: userWithoutPassword
        };
    }
}
