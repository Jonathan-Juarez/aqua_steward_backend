"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = void 0;
const CustomError_1 = require("./CustomError");
// Error que se lanza cuando una petición crea un estado que ya existe o está en uso.
class ConflictError extends CustomError_1.CustomError {
    message;
    statusCode = 409;
    constructor(message = "El recurso ya existe") {
        super(message);
        this.message = message;
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
    formatMessage() { return [{ message: this.message }]; }
}
exports.ConflictError = ConflictError;
