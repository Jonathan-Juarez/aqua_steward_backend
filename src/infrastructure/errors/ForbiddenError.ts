import { CustomError } from './CustomError';

// Excepción lanzada cuando el usuario está autenticado pero no posee los permisos/rol necesarios (HTTP 403).
export class ForbiddenError extends CustomError {
    statusCode = 403;
    constructor(public message: string = "No tienes permisos para realizar esta acción.") {
        super(message);
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
    formatMessage() { return [{ message: this.message }]; }
}
