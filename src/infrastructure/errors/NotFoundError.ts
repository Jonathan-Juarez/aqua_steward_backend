import { CustomError } from './CustomError';

// Error que se lanza cuando un recurso no se encuentra.
export class NotFoundError extends CustomError {
    statusCode = 404;
    constructor(public message: string = "No se encontro el recurso") {
        super(message);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
    formatMessage() { return [{ message: this.message }]; }
}
