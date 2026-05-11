import { CustomError } from './CustomError';

// Error que se lanza cuando la petición del cliente es incorrecta.
export class BadRequestError extends CustomError {
    statusCode = 400;
    constructor(public message: string = "Petición incorrecta") {
        super(message);
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
    formatMessage() { return [{ message: this.message }]; }
}
