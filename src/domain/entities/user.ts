export interface IUserDTO {
    id?: string;
    name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    assigned_deposits?: any[];
    createdAt?: Date;
    updatedAt?: Date;
}

export default class User {
    id?: string;
    name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    assigned_deposits: any[];
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
            throw new Error("No es un correo electrónico válido");
        }

        // Solo se valida complejidad si la contraseña es nueva o está cambiando.
        if (this.isPlainPassword(this.password)) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
            if (this.password && !passwordRegex.test(this.password)) {
                throw new Error("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un carácter especial.");
            }
        } else {
            throw new Error("La contraseña no cumple con los requisitos de seguridad.");
        }
    }

    isPlainPassword(password?: string): boolean {
        // Si no se proporciona la contraseña, se retorna false y no entra en la validación.
        if (!password) return false;
        // Si no empieza con el prefijo de bcrypt, se asume que es texto plano.
        return !password.startsWith("$2a$") && !password.startsWith("$2b$");
    }
}
