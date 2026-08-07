import { Types } from "mongoose";
import { INotificationRepository } from "../../../domain/repository/notification-repository.interface";
import UserModel from "../models/user-model";
import DepositsModel from "../models/deposit-model";
import NotificationModel from "../models/notification-model";

export default class NotificationRepositoryMongo implements INotificationRepository {
    // Registra el token FCM del usuario y lo desacopla de otros dispositivos para evitar notificaciones duplicadas.
    async registerToken(userId: string, fcmToken: string): Promise<void> {
        const userObjectId = new Types.ObjectId(userId);
        await UserModel.updateMany(
            { fcmTokens: fcmToken, _id: { $ne: userObjectId } },
            { $pull: { fcmTokens: fcmToken } }
        );
        await UserModel.findByIdAndUpdate(userObjectId, {
            $addToSet: { fcmTokens: fcmToken }
        });
    }

    // Remueve el token FCM de la cuenta del usuario para detener el envío de notificaciones push.
    async unregisterToken(userId: string, fcmToken: string): Promise<void> {
        await UserModel.updateMany(
            { fcmTokens: fcmToken },
            { $pull: { fcmTokens: fcmToken } }
        );
    }

    // Clasifica los depósitos del usuario agrupándolos según su rol (Propietario/Admin vs Analista).
    private async getUserDepositContext(userId: string) {
        const user = await UserModel.findById(userId);
        if (!user) return { allDepositIds: [], fullControlDepositIds: [], analystDepositIds: [] };

        const ownedDeposits = await DepositsModel.find({ owner_id: userId as any }).select("_id");
        const ownedIds = ownedDeposits.map(d => d._id);

        const adminIds: any[] = [];
        const analystIds: any[] = [];

        for (const assignment of user.assigned_deposits || []) {
            if (assignment.status === "accepted") {
                if (assignment.role === "admin" || assignment.role === "owner") adminIds.push(assignment.deposit_id);
                else if (assignment.role === "analyst") analystIds.push(assignment.deposit_id);
            }
        }

        const fullControlDepositIds = [...ownedIds, ...adminIds];
        const allDepositIds = [...fullControlDepositIds, ...analystIds];

        return { allDepositIds, fullControlDepositIds, analystDepositIds: analystIds };
    }

    // Obtiene las notificaciones visibles asignadas al usuario y mapea el tipo de sensor y estado de lectura.
    async getNotifications(userId: string): Promise<any[]> {
        const { allDepositIds } = await this.getUserDepositContext(userId);
        const userObjectId = new Types.ObjectId(userId);

        // Mapea el tipo de sensor según su ID registrado en los depósitos.
        const deposits = await DepositsModel.find({ _id: { $in: allDepositIds } }).lean();
        const sensorTypeMap = new Map<string, string>();
        for (const dep of deposits) {
            for (const sensor of dep.sensors || []) {
                if (sensor._id) {
                    const typeName = sensor.type === "PH-4502C" ? "pH" : (sensor.type === "TS300B" ? "Turbidez" : "Nivel");
                    sensorTypeMap.set(sensor._id.toString(), typeName);
                }
            }
        }

        // Filtra notificaciones excluyendo aquellas eliminadas personalmente por el usuario.
        const notifications = await NotificationModel.find({
            $or: [{ deposit_id: { $in: allDepositIds } }, { user_id: userObjectId }],
            deleted_by: { $ne: userObjectId }
        })
            .sort({ generation_date: -1 })
            .lean();

        return notifications.map(n => {
            const resolvedType = n.type || n.title || (n.sensor_id ? sensorTypeMap.get(n.sensor_id.toString()) : null) || (n.description.includes("pH") ? "pH" : (n.description.includes("Turbidez") ? "Turbidez" : "Nivel"));
            const isRead = n.state === "inactiva" || n.read_by?.some((id: any) => id.toString() === userId);

            return {
                id: n._id.toString(),
                title: n.title || resolvedType,
                message: n.description,
                type: resolvedType,
                date: n.generation_date || (n as any).createdAt,
                state: isRead ? "inactiva" : "activa",
                deposit_id: n.deposit_id ? n.deposit_id.toString() : null,
                reading_trigger: n.reading_trigger
            };
        });
    }

    // Elimina una notificación: borrado físico global si es Propietario/Admin o borrado personal si es Analista.
    async deleteNotification(userId: string, notificationId: string): Promise<void> {
        const userObjectId = new Types.ObjectId(userId);
        const notification = await NotificationModel.findById(notificationId);
        if (!notification) return;

        // Notificaciones personales de equipo (invitaciones/cambios de rol).
        if (notification.user_id?.toString() === userId || !notification.deposit_id) {
            await NotificationModel.findByIdAndDelete(notificationId);
            return;
        }

        // Valida si el usuario es Propietario o Administrador del depósito.
        const isOwnerOrAdmin = await DepositsModel.exists({ _id: notification.deposit_id, owner_id: userId as any }) ||
            await UserModel.exists({
                _id: userId as any,
                assigned_deposits: {
                    $elemMatch: { deposit_id: notification.deposit_id, role: { $in: ["admin", "owner"] }, status: "accepted" }
                }
            });

        if (isOwnerOrAdmin) {
            // Borrado físico global de la base de datos.
            await NotificationModel.findByIdAndDelete(notificationId);
        } else {
            // Borrado personal para Analistas (agrega userId a deleted_by).
            await NotificationModel.findByIdAndUpdate(notificationId, {
                $addToSet: { deleted_by: userObjectId }
            });
        }
    }

    // Realiza un borrado masivo aplicando borrado físico para Propietarios/Admins y borrado personal para Analistas.
    async deleteAllNotifications(userId: string): Promise<void> {
        const { fullControlDepositIds, analystDepositIds } = await this.getUserDepositContext(userId);
        const userObjectId = new Types.ObjectId(userId);

        // Borrado físico global para depósitos con control total y notificaciones personales.
        await NotificationModel.deleteMany({
            $or: [{ deposit_id: { $in: fullControlDepositIds } }, { user_id: userObjectId }]
        });

        // Borrado personal para notificaciones donde el usuario es únicamente Analista.
        if (analystDepositIds.length > 0) {
            await NotificationModel.updateMany(
                { deposit_id: { $in: analystDepositIds } },
                { $addToSet: { deleted_by: userObjectId } }
            );
        }
    }

    // Marca notificaciones como leídas de forma individual o masiva agregando el usuario a read_by.
    async markNotificationAsRead(userId: string, notificationId?: string): Promise<void> {
        const userObjectId = new Types.ObjectId(userId);

        if (notificationId) {
            await NotificationModel.findByIdAndUpdate(notificationId, {
                $addToSet: { read_by: userObjectId }
            });
            return;
        }

        const { allDepositIds } = await this.getUserDepositContext(userId);

        await NotificationModel.updateMany(
            { $or: [{ deposit_id: { $in: allDepositIds } }, { user_id: userObjectId }] },
            { $addToSet: { read_by: userObjectId } }
        );
    }
}
