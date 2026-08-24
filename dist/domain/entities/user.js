"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BadRequestError_1 = require("../../infrastructure/errors/BadRequestError");
class User {
    id;
    name;
    last_name;
    email;
    password;
    assigned_deposits;
    fcmTokens;
    global_role;
    createdAt;
    updatedAt;
    constructor(data) {
        this.id = data.id;
        this.name = data.name ? data.name.trim() : data.name;
        this.last_name = data.last_name ? data.last_name.trim() : data.last_name;
        this.email = data.email ? data.email.trim() : data.email;
        this.password = data.password ? data.password.trim() : data.password;
        // Si no se asignan depósitos, es un array vacío por defecto.
        this.assigned_deposits = data.assigned_deposits || [];
        this.fcmTokens = data.fcmTokens || [];
        this.global_role = data.global_role || "user";
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
    // Reglas de negocio.
    validate() {
        // Validación de email básico.
        const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
        if (!this.email || !emailRegex.test(this.email)) {
            throw new BadRequestError_1.BadRequestError("Correo electrónico no válido");
        }
        User.validatePassword(this.password);
    }
    // Se valida la complejidad de la contraseña de forma independiente.
    static validatePassword(password) {
        if (!password) {
            throw new BadRequestError_1.BadRequestError("La contraseña es obligatoria");
        }
        // Si ya está hasheada con bcrypt, no se valida complejidad.
        if (password.startsWith("$2a$") || password.startsWith("$2b$")) {
            return;
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(password)) {
            throw new BadRequestError_1.BadRequestError("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un carácter especial.");
        }
    }
}
exports.default = User;
