"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = void 0;
const CustomError_1 = require("./CustomError");
// Excepción lanzada cuando el usuario está autenticado pero no posee los permisos/rol necesarios (HTTP 403).
class ForbiddenError extends CustomError_1.CustomError {
    message;
    statusCode = 403;
    constructor(message = "No tienes permisos para realizar esta acción.") {
        super(message);
        this.message = message;
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
    formatMessage() { return [{ message: this.message }]; }
}
exports.ForbiddenError = ForbiddenError;
