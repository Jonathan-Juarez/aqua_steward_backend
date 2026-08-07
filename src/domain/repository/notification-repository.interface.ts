export interface INotificationRepository {
    registerToken(userId: string, fcmToken: string): Promise<void>;
    unregisterToken(userId: string, fcmToken: string): Promise<void>;
    getNotifications(userId: string): Promise<any[]>;
    deleteNotification(userId: string, notificationId: string): Promise<void>;
    deleteAllNotifications(userId: string): Promise<void>;
    markNotificationAsRead(userId: string, notificationId?: string): Promise<void>;
}
