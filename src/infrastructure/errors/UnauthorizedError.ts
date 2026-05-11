import { CustomError } from './CustomError';

export class UnauthorizedError extends CustomError {
    statusCode = 401;
    constructor(public message: string = "No autorizado") {
        super(message);
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
    formatMessage() { return [{ message: this.message }]; }
}
