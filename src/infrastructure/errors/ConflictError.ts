import { CustomError } from './CustomError';

// Error que se lanza cuando una petición crea un estado que ya existe o está en uso.
export class ConflictError extends CustomError {
    statusCode = 409;
    constructor(public message: string = "El recurso ya existe") {
        super(message);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
    formatMessage() { return [{ message: this.message }]; }
}
