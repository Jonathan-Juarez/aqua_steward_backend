"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BadRequestError_1 = require("../../../infrastructure/errors/BadRequestError");
const otp_service_1 = require("../../../infrastructure/services/otp.service");
class SendOtpUseCase {
    async execute(email) {
        if (!email?.trim())
            throw new BadRequestError_1.BadRequestError("El correo electrónico es obligatorio.");
        await (0, otp_service_1.sendOtp)(email);
        return { success: true };
    }
}
exports.default = SendOtpUseCase;
