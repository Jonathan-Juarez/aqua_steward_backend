// Error personalizado del cual heredan los errores operativos.
export abstract class CustomError extends Error {
    // Código de estado HTTP.
    abstract statusCode: number;

    constructor(message: string) {
        super(message);
        // Restaura el prototipo correcto de la instancia, asegurando que instanceof funcione correctamente.
        Object.setPrototypeOf(this, CustomError.prototype);
    }

    // Devuelve el mensaje de error formateado para el cliente.
    abstract formatMessage(): { message: string; field?: string }[];
}
