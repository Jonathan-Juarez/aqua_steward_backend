import { CustomError } from './CustomError';

// Error que se lanza cuando la petición del cliente es incorrecta. Indica que la falla viene del lado del usuario o del programa, debido a un texto mal escrito o datos incompletos.
export class BadRequestError extends CustomError {
    statusCode = 400;
    constructor(public message: string = "Petición incorrecta") {
        super(message);
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
    formatMessage() { return [{ message: this.message }]; }
}
