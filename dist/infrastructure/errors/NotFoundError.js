"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = void 0;
const CustomError_1 = require("./CustomError");
// Error que se lanza cuando un recurso no se encuentra.
class NotFoundError extends CustomError_1.CustomError {
    message;
    statusCode = 404;
    constructor(message = "No se encontro el recurso") {
        super(message);
        this.message = message;
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
    formatMessage() { return [{ message: this.message }]; }
}
exports.NotFoundError = NotFoundError;
