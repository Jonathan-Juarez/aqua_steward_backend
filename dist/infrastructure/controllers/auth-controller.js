"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const signup_usecase_1 = __importDefault(require("../../app/usecases/auth/signup.usecase"));
const signin_usecase_1 = __importDefault(require("../../app/usecases/auth/signin.usecase"));
const reset_password_usecase_1 = __importDefault(require("../../app/usecases/auth/reset-password.usecase"));
const auth_repository_mongo_1 = __importDefault(require("../database/repositories/auth-repository.mongo"));
const update_user_usecase_1 = __importDefault(require("../../app/usecases/auth/update-user.usecase"));
const delete_user_usecase_1 = __importDefault(require("../../app/usecases/auth/delete-user.usecase"));
const send_otp_usecase_1 = __importDefault(require("../../app/usecases/auth/send-otp.usecase"));
const verify_otp_usecase_1 = __importDefault(require("../../app/usecases/auth/verify-otp.usecase"));
// Se instancia el repositorio de MongoDB una sola vez
const userRepository = new auth_repository_mongo_1.default();
// Se inyecta la dependencia real a los Casos de Uso del Dominio
const signupUseCase = new signup_usecase_1.default(userRepository);
const signinUseCase = new signin_usecase_1.default(userRepository);
const resetPasswordUseCase = new reset_password_usecase_1.default(userRepository);
const updateUserUseCase = new update_user_usecase_1.default(userRepository);
const deleteUserUseCase = new delete_user_usecase_1.default(userRepository);
// OTP
const sendOtpUseCase = new send_otp_usecase_1.default();
const verifyOtpUseCase = new verify_otp_usecase_1.default();
class AuthController {
    static async sendOtp(req, res) {
        const result = await sendOtpUseCase.execute(req.body.email);
        return res.status(200).json(result);
    }
    static async verifyOtp(req, res) {
        const result = await verifyOtpUseCase.execute(req.body.email, req.body.otp);
        return res.status(200).json(result);
    }
    static async signup(req, res) {
        const user = await signupUseCase.execute(req.body);
        return res.status(201).json(user);
    }
    static async signin(req, res) {
        const result = await signinUseCase.execute(req.body);
        return res.status(200).json(result);
    }
    static async resetPassword(req, res) {
        const user = await resetPasswordUseCase.execute(req.body);
        return res.status(200).json(user);
    }
    static async updateUser(req, res) {
        const user = await updateUserUseCase.execute(req.body);
        return res.status(200).json(user);
    }
    static async deleteUser(req, res) {
        const user = await deleteUserUseCase.execute(req.body.email);
        return res.status(200).json(user);
    }
}
exports.AuthController = AuthController;
