import { Types } from "mongoose";
import { INotificationRepository } from "../../../domain/repository/notification-repository.interface";
import UserModel from "../models/user-model";
import DepositsModel from "../models/deposit-model";
import NotificationModel from "../models/notification-model";

export default class NotificationRepositoryMongo implements INotificationRepository {
    async registerToken(userId: string, fcmToken: string): Promise<void> {
        const userObjectId = new Types.ObjectId(userId);
        // Remover este token de cualquier otro usuario para evitar notificaciones cruzadas en el mismo dispositivo
        await UserModel.updateMany(
            { fcmTokens: fcmToken, _id: { $ne: userObjectId } },
            { $pull: { fcmTokens: fcmToken } }
        );
        await UserModel.findByIdAndUpdate(userObjectId, {
            $addToSet: { fcmTokens: fcmToken }
        });
    }

    async unregisterToken(userId: string, fcmToken: string): Promise<void> {
        // Remover este token de todos los usuarios para asegurar que ningún usuario envíe notificaciones a este dispositivo
        await UserModel.updateMany(
            { fcmTokens: fcmToken },
            { $pull: { fcmTokens: fcmToken } }
        );
    }

    async getNotifications(userId: string): Promise<any[]> {
        const user = await UserModel.findById(userId);
        if (!user) return [];

        // Obtener IDs de los depósitos pertenecientes o asignados al usuario
        const ownedDeposits = await DepositsModel.find({ owner_id: userId as any });
        const ownedIds = ownedDeposits.map(d => d._id);

        const assignedIds = (user.assigned_deposits || [])
            .filter(d => d.status === "accepted")
            .map(d => d.deposit_id);

        const allDepositIds = [...ownedIds, ...assignedIds];

        // Cargar depósitos para mapear sensor_id con su tipo ("Nivel", "pH", "Turbidez")
        const deposits = await DepositsModel.find({ _id: { $in: allDepositIds as any } }).lean();
        const sensorTypeMap = new Map<string, string>();
        for (const dep of deposits) {
            if (dep.sensors) {
                for (const s of dep.sensors) {
                    if (s._id) {
                        const t = s.type === "PH-4502C" ? "pH" : (s.type === "TS300B" ? "Turbidez" : "Nivel");
                        sensorTypeMap.set(s._id.toString(), t);
                    }
                }
            }
        }

        // Buscar notificaciones por depósitos asociados O por user_id directo (eventos de equipo)
        const userObjectId = new Types.ObjectId(userId);
        const notifications = await NotificationModel.find({
            $or: [
                { deposit_id: { $in: allDepositIds as any } },
                { user_id: userObjectId }
            ]
        })
            .sort({ generation_date: -1 })
            .lean();

        return notifications.map(n => {
            const resolvedType = n.type || n.title || (n.sensor_id ? sensorTypeMap.get(n.sensor_id.toString()) : null) || (n.description.includes("pH") ? "pH" : (n.description.includes("Turbidez") ? "Turbidez" : "Nivel"));
            return {
                id: n._id.toString(),
                title: n.title || resolvedType,
                message: n.description,
                type: resolvedType,
                date: n.generation_date || (n as any).createdAt,
                state: n.state,
                deposit_id: n.deposit_id ? n.deposit_id.toString() : null,
                reading_trigger: n.reading_trigger
            };
        });
    }

    async deleteNotification(notificationId: string): Promise<void> {
        await NotificationModel.findByIdAndDelete(notificationId);
    }

    async deleteAllNotifications(userId: string): Promise<void> {
        const user = await UserModel.findById(userId);
        if (!user) return;

        const ownedDeposits = await DepositsModel.find({ owner_id: userId as any }).select("_id");
        const ownedIds = ownedDeposits.map(d => d._id);

        const assignedIds = (user.assigned_deposits || [])
            .filter(d => d.status === "accepted")
            .map(d => d.deposit_id);

        const allDepositIds = [...ownedIds, ...assignedIds];

        const userObjectId = new Types.ObjectId(userId);
        await NotificationModel.deleteMany({
            $or: [
                { deposit_id: { $in: allDepositIds as any } },
                { user_id: userObjectId }
            ]
        });
    }

    async markNotificationAsRead(userId: string, notificationId?: string): Promise<void> {
        // Si se proporciona un ID, marcar esa notificación como leída.
        if (notificationId) {
            await NotificationModel.findByIdAndUpdate(notificationId, { $set: { state: "inactiva" } });
            return;
        }
        const user = await UserModel.findById(userId);
        if (!user) return;

        const ownedDeposits = await DepositsModel.find({ owner_id: userId as any }).select("_id");
        const ownedIds = ownedDeposits.map(d => d._id);

        const assignedIds = (user.assigned_deposits || [])
            .filter(d => d.status === "accepted")
            .map(d => d.deposit_id);

        const allDepositIds = [...ownedIds, ...assignedIds];

        const userObjectId = new Types.ObjectId(userId);
        // Marcar todas las notificaciones del usuario como leídas.
        await NotificationModel.updateMany(
            {
                $or: [
                    { deposit_id: { $in: allDepositIds as any } },
                    { user_id: userObjectId }
                ],
                state: "activa"
            },
            { $set: { state: "inactiva" } }
        );
    }
}
