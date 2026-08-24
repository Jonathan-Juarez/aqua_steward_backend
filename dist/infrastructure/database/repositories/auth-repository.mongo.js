"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user-model"));
const deposit_model_1 = __importDefault(require("../models/deposit-model"));
const reading_model_1 = __importDefault(require("../models/reading-model"));
const notification_model_1 = __importDefault(require("../models/notification-model"));
const user_1 = __importDefault(require("../../../domain/entities/user"));
const mongoose_1 = require("mongoose");
class AuthRepositoryMongo {
    // Se mapea internamente el documento de Mongoose a la entidad User.
    _toDomain(document) {
        if (!document)
            return null;
        return new user_1.default({
            id: document._id.toString(),
            name: document.name,
            last_name: document.last_name,
            email: document.email,
            password: document.password,
            assigned_deposits: document.assigned_deposits || [],
            fcmTokens: document.fcmTokens || [],
            global_role: document.global_role || "user",
            createdAt: document.createdAt,
            updatedAt: document.updatedAt
        });
    }
    // Se busca un usuario en la db mediante el email.
    async findByEmail(email) {
        const document = await user_model_1.default.findOne({ email });
        return document ? this._toDomain(document) : null;
    }
    // Se guarda una nueva entidad de usuario en la db.
    async save(userEntity) {
        const userData = {
            name: userEntity.name,
            last_name: userEntity.last_name,
            email: userEntity.email,
            password: userEntity.password
        };
        const newDocument = new user_model_1.default(userData);
        const savedDocument = await newDocument.save();
        return this._toDomain(savedDocument);
    }
    // Se realiza una búsqueda por ID nativo de MongoDB devolviendo la entidad.
    async findById(id) {
        const document = await user_model_1.default.findById(id);
        return this._toDomain(document);
    }
    // Se actualiza la contraseña de un usuario mediante su email.
    async resetPassword(email, newPassword) {
        const document = await user_model_1.default.findOneAndUpdate({ email }, { password: newPassword }, { new: true });
        return this._toDomain(document);
    }
    // Se actualiza un usuario mediante su ID. Se actualiza nombre y apellido.
    async update(id, newData) {
        const document = await user_model_1.default.findByIdAndUpdate(id, newData, { new: true });
        return this._toDomain(document);
    }
    async delete(email) {
        const user = await user_model_1.default.findOne({ email });
        if (!user)
            return;
        const userId = new mongoose_1.Types.ObjectId(user._id.toString());
        // Buscar todos los depósitos donde el usuario es el dueño (owner_id)
        const ownedDeposits = await deposit_model_1.default.find({ owner_id: userId }).select("_id").lean();
        const ownedDepositIds = ownedDeposits.map(d => d._id);
        if (ownedDepositIds.length > 0) {
            // Eliminar todas las lecturas (ReadingsBucket) pertenecientes a los depósitos del usuario
            await reading_model_1.default.deleteMany({ deposit_id: { $in: ownedDepositIds } });
            // Eliminar todas las notificaciones asociadas a los depósitos del usuario
            await notification_model_1.default.deleteMany({ deposit_id: { $in: ownedDepositIds } });
            // Eliminar los depósitos creados por el usuario
            await deposit_model_1.default.deleteMany({ owner_id: userId });
        }
        // Eliminar notificaciones enviadas directamente al usuario
        await notification_model_1.default.deleteMany({ user_id: userId });
        // Eliminar el usuario
        await user_model_1.default.findByIdAndDelete(userId);
    }
}
exports.default = AuthRepositoryMongo;
