import { BadRequestError } from "../../../infrastructure/errors/BadRequestError";
import { verifyOtp } from "../../../infrastructure/services/otp.service";

export default class VerifyOtpUseCase {
    async execute(email: string, otp: string) {
        if (!email?.trim() || !otp?.trim()) {
            throw new BadRequestError("El correo y el código son obligatorios.");
        }
        const verified = await verifyOtp(email, otp);
        return { verified };
    }
}
