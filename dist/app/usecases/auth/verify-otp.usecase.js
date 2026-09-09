"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BadRequestError_1 = require("../../../infrastructure/errors/BadRequestError");
const otp_service_1 = require("../../../infrastructure/services/otp.service");
class VerifyOtpUseCase {
    async execute(email, otp) {
        if (!email?.trim() || !otp?.trim()) {
            throw new BadRequestError_1.BadRequestError("El correo y el código son obligatorios.");
        }
        const verified = await (0, otp_service_1.verifyOtp)(email, otp);
        return { verified };
    }
}
exports.default = VerifyOtpUseCase;
