"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deposit_model_1 = __importDefault(require("../models/deposit-model"));
const deposit_1 = __importDefault(require("../../../domain/entities/deposit"));
class DepositRepositoryMongo {
    _toDomain(document) {
        if (!document)
            return null;
        return new deposit_1.default({
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
    async findByIp(ip) {
        const document = await deposit_model_1.default.findOne({ ip });
        return this._toDomain(document);
    }
    async findById(id) {
        const document = await deposit_model_1.default.findById(id);
        return this._toDomain(document);
    }
    async save(depositEntity) {
        const depositData = {
            name: depositEntity.name,
            ip: depositEntity.ip,
            capacity: depositEntity.capacity,
            installation_height: depositEntity.installation_height,
            fill_gap: depositEntity.fill_gap,
            owner_id: depositEntity.owner_id,
            sensors: depositEntity.sensors
        };
        const newDocument = new deposit_model_1.default(depositData);
        const savedDocument = await newDocument.save();
        return this._toDomain(savedDocument);
    }
    async findByOwnerId(ownerId) {
        const documents = await deposit_model_1.default.find({ owner_id: ownerId });
        return documents.map(doc => this._toDomain(doc));
    }
    async findByIds(ids) {
        const documents = await deposit_model_1.default.find({ _id: { $in: ids } });
        return documents.map(doc => this._toDomain(doc));
    }
    async delete(id) {
        const deletedDocument = await deposit_model_1.default.findByIdAndDelete(id);
        return this._toDomain(deletedDocument);
    }
    async update(id, newData) {
        const updatedDocument = await deposit_model_1.default.findByIdAndUpdate(id, newData, { new: true });
        return this._toDomain(updatedDocument);
    }
}
exports.default = DepositRepositoryMongo;
