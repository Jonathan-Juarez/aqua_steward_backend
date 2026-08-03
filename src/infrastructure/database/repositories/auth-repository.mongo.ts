import { IAuthRepository } from "../../../domain/repository/auth-repository.interface";
import UserModel, { IUserDoc } from "../models/user-model";
import DepositsModel from "../models/deposit-model";
import ReadingsBucketModel from "../models/reading-model";
import NotificationModel from "../models/notification-model";
import User from "../../../domain/entities/user";
import { Types } from "mongoose";

export default class AuthRepositoryMongo implements IAuthRepository {

    // Se mapea internamente el documento de Mongoose a la entidad User.
    private _toDomain(document: IUserDoc | null): User | null {
        if (!document) return null;

        return new User({
            id: document._id.toString(),
            name: document.name,
            last_name: document.last_name,
            email: document.email,
            password: document.password,
            assigned_deposits: document.assigned_deposits || [],
            fcmTokens: document.fcmTokens || [],
            createdAt: document.createdAt,
            updatedAt: document.updatedAt
        });
    }

    // Se busca un usuario en la db mediante el email.
    async findByEmail(email: string): Promise<User | null> {
        const document = await UserModel.findOne({ email });
        return document ? this._toDomain(document) : null;
    }

    // Se guarda una nueva entidad de usuario en la db.
    async save(userEntity: User): Promise<User> {
        const userData = {
            name: userEntity.name,
            last_name: userEntity.last_name,
            email: userEntity.email,
            password: userEntity.password
        };

        const newDocument = new UserModel(userData);
        const savedDocument = await newDocument.save();

        return this._toDomain(savedDocument) as User;
    }

    // Se realiza una búsqueda por ID nativo de MongoDB devolviendo la entidad.
    async findById(id: string): Promise<User | null> {
        const document = await UserModel.findById(id);
        return this._toDomain(document);
    }

    // Se actualiza la contraseña de un usuario mediante su email.
    async resetPassword(email: string, newPassword: string): Promise<User | null> {
        const document = await UserModel.findOneAndUpdate({ email }, { password: newPassword }, { new: true });
        return this._toDomain(document);
    }

    // Se actualiza un usuario mediante su ID. Se actualiza nombre y apellido.
    async update(id: string, newData: Partial<User>): Promise<User | null> {
        const document = await UserModel.findByIdAndUpdate(id, newData, { new: true });
        return this._toDomain(document);
    }

    async delete(email: string): Promise<void> {
        const user = await UserModel.findOne({ email });
        if (!user) return;

        const userId = new Types.ObjectId(user._id.toString());

        // Buscar todos los depósitos donde el usuario es el dueño (owner_id)
        const ownedDeposits = await DepositsModel.find({ owner_id: userId as any }).select("_id").lean();
        const ownedDepositIds = ownedDeposits.map(d => d._id);

        if (ownedDepositIds.length > 0) {
            // Eliminar todas las lecturas (ReadingsBucket) pertenecientes a los depósitos del usuario
            await ReadingsBucketModel.deleteMany({ deposit_id: { $in: ownedDepositIds } });

            // Eliminar todas las notificaciones asociadas a los depósitos del usuario
            await NotificationModel.deleteMany({ deposit_id: { $in: ownedDepositIds } });

            // Eliminar los depósitos creados por el usuario
            await DepositsModel.deleteMany({ owner_id: userId as any });
        }

        // Eliminar notificaciones enviadas directamente al usuario
        await NotificationModel.deleteMany({ user_id: userId });

        // Eliminar el usuario
        await UserModel.findByIdAndDelete(userId);
    }
}
