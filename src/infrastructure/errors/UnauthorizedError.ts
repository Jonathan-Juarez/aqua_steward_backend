import { CustomError } from './CustomError';

// Error que se lanza cuando el cliente no está autenticado correctamente.
export class UnauthorizedError extends CustomError {
    statusCode = 401;
    constructor(public message: string = "No autorizado") {
        super(message);
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
    formatMessage() { return [{ message: this.message }]; }
}
