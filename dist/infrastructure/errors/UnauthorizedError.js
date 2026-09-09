"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedError = void 0;
const CustomError_1 = require("./CustomError");
// Error que se lanza cuando el cliente no está autenticado correctamente.
class UnauthorizedError extends CustomError_1.CustomError {
    message;
    statusCode = 401;
    constructor(message = "No autorizado") {
        super(message);
        this.message = message;
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
    formatMessage() { return [{ message: this.message }]; }
}
exports.UnauthorizedError = UnauthorizedError;
