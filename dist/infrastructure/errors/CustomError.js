"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
// Error personalizado del cual heredan los errores operativos.
class CustomError extends Error {
    constructor(message) {
        super(message);
        // Restaura el prototipo correcto de la instancia, asegurando que instanceof funcione correctamente.
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}
exports.CustomError = CustomError;
