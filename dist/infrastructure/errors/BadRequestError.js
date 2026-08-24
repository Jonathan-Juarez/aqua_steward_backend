"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestError = void 0;
const CustomError_1 = require("./CustomError");
// Error que se lanza cuando la petición del cliente es incorrecta. Indica que la falla viene del lado del usuario o del programa, debido a un texto mal escrito o datos incompletos.
class BadRequestError extends CustomError_1.CustomError {
    message;
    statusCode = 400;
    constructor(message = "Petición incorrecta") {
        super(message);
        this.message = message;
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
    formatMessage() { return [{ message: this.message }]; }
}
exports.BadRequestError = BadRequestError;
