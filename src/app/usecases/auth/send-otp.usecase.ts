import { BadRequestError } from "../../../infrastructure/errors/BadRequestError";
import { sendOtp } from "../../../infrastructure/services/otp.service";

export default class SendOtpUseCase {
    async execute(email: string) {
        if (!email?.trim()) throw new BadRequestError("El correo electrónico es obligatorio.");
        await sendOtp(email);
        return { success: true };
    }
}
