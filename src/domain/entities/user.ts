import { BadRequestError } from "../../infrastructure/errors/BadRequestError";

export interface IUserDTO {
    id?: string;
    name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    assigned_deposits?: { role: string; deposit_id: string; status?: string }[];
    createdAt?: Date;
    updatedAt?: Date;
}

export default class User {
    id?: string;
    name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    assigned_deposits: { role: string; deposit_id: string; status?: string }[];
    createdAt?: Date;
    updatedAt?: Date;

    constructor(data: IUserDTO) {
        this.id = data.id;
        this.name = data.name ? data.name.trim() : data.name;
        this.last_name = data.last_name ? data.last_name.trim() : data.last_name;
        this.email = data.email ? data.email.trim() : data.email;
        this.password = data.password ? data.password.trim() : data.password;

        // Si no se asignan depósitos, es un array vacío por defecto.
        this.assigned_deposits = data.assigned_deposits || [];
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    // Reglas de negocio.
    validate(): void {
        // Validación de email básico.
        const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
        if (!this.email || !emailRegex.test(this.email)) {
            throw new BadRequestError("Correo electrónico no válido");
        }

        User.validatePassword(this.password);
    }

    // Se valida la complejidad de la contraseña de forma independiente.
    static validatePassword(password?: string): void {
        if (!password) {
            throw new BadRequestError("La contraseña es obligatoria");
        }

        // Si ya está hasheada con bcrypt, no se valida complejidad.
        if (password.startsWith("$2a$") || password.startsWith("$2b$")) {
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(password)) {
            throw new BadRequestError("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un carácter especial.");
        }
    }
}
