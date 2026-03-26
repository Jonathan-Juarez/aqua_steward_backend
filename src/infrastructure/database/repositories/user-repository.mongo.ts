import { IUserRepository } from "../../../domain/repository/user-repository.interface";
import UserModel, { IUserDoc } from "../models/user-model";
import User from "../../../domain/entities/user";

export default class UserRepositoryMongo implements IUserRepository {

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
    async restorePassword(email: string, newPassword: string): Promise<User | null> {
        const document = await UserModel.findOneAndUpdate({ email }, { password: newPassword }, { new: true });
        return this._toDomain(document);
    }
}
