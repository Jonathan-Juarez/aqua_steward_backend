import { IDepositRepository } from "../../../domain/repository/deposit-repository.interface";
import DepositsModel, { IDepositsDoc } from "../models/deposit-model";
import Deposit from "../../../domain/entities/deposit";

export default class DepositRepositoryMongo implements IDepositRepository {

    private _toDomain(document: IDepositsDoc | null): Deposit | null {
        if (!document) return null;

        return new Deposit({
            id: document._id.toString(),
            name: document.name,
            ip: document.ip,
            capacity: document.capacity,
            installation_height: document.installation_height,
            fill_gap: document.fill_gap,
            owner_id: document.owner_id.toString(),
            sensors: document.sensors,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt
        });
    }

    async findByIp(ip: string): Promise<Deposit | null> {
        const document = await DepositsModel.findOne({ ip });
        return this._toDomain(document);
    }

    async save(depositEntity: Deposit): Promise<Deposit> {
        const depositData = {
            name: depositEntity.name,
            ip: depositEntity.ip,
            capacity: depositEntity.capacity,
            installation_height: depositEntity.installation_height,
            fill_gap: depositEntity.fill_gap,
            owner_id: depositEntity.owner_id,
            sensors: depositEntity.sensors
        };

        const newDocument = new DepositsModel(depositData);
        const savedDocument = await newDocument.save();

        return this._toDomain(savedDocument) as Deposit;
    }

    async findByOwnerId(ownerId: string): Promise<Deposit[]> {
        const documents = await DepositsModel.find({ owner_id: ownerId as any });
        return documents.map(doc => this._toDomain(doc) as Deposit);
    }

    async delete(id: string): Promise<Deposit | null> {
        const deletedDocument = await DepositsModel.findByIdAndDelete(id);
        return this._toDomain(deletedDocument);
    }
}
