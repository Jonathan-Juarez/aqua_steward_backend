import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import UserModel from "../database/models/user-model";

let isFirebaseInitialized = false;

try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (!serviceAccountJson) {
        console.warn(
            "ADVERTENCIA: FIREBASE_SERVICE_ACCOUNT_JSON no está definida. " +
            "Las notificaciones push están desactivadas temporalmente."
        );
    } else {
        const serviceAccount = JSON.parse(serviceAccountJson);

        if (getApps().length === 0) {
            initializeApp({
                credential: cert(serviceAccount)
            });
        }

        isFirebaseInitialized = true;
        console.log("Firebase Admin SDK inicializado exitosamente desde variable de entorno.");
    }
} catch (error: any) {
    console.error(
        "Error leyendo FIREBASE_SERVICE_ACCOUNT_JSON o inicializando Firebase Admin SDK:",
        error.message
    );
}


// Envía una notificación push a una lista de tokens FCM. Proporciona manejo de errores para ignorar y limpiar automáticamente tokens inválidos/viejos de la base de datos.
export const sendPushNotification = async (
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>
): Promise<void> => {
    if (!isFirebaseInitialized || tokens.length === 0) {
        return;
    }

    // Filtrar tokens vacíos, nulos y eliminar duplicados para evitar envíos dobles al mismo dispositivo
    const uniqueTokens = Array.from(new Set(tokens.filter(t => t && t.trim().length > 0)));
    if (uniqueTokens.length === 0) return;

    try {
        const message = {
            tokens: uniqueTokens,
            notification: {
                title,
                body,
            },
            data: data || {},
            android: {
                notification: {
                    channelId: "high_importance_channel",
                    sound: "default",
                    priority: "high" as const
                }
            },
            apns: {
                payload: {
                    aps: {
                        sound: "default",
                        badge: 1
                    }
                }
            }
        };

        const response = await getMessaging().sendEachForMulticast(message);
        console.log(`Envío multicast FCM: ${response.successCount} exitosas, ${response.failureCount} fallidas.`);

        // Limpiar tokens expirados o desinstalados para mantener la integridad de la base de datos
        if (response.failureCount > 0) {
            const tokensToRemove: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success && resp.error) {
                    const code = resp.error.code;
                    // Códigos estándar de Firebase para tokens inválidos o no registrados
                    if (
                        code === "messaging/registration-token-not-registered" ||
                        code === "messaging/invalid-registration-token"
                    ) {
                        tokensToRemove.push(uniqueTokens[idx]);
                    }
                }
            });

            if (tokensToRemove.length > 0) {
                console.log(`-> Limpiando ${tokensToRemove.length} tokens FCM obsoletos de la base de datos...`);
                await UserModel.updateMany(
                    { fcmTokens: { $in: tokensToRemove } },
                    { $pull: { fcmTokens: { $in: tokensToRemove } } }
                );
            }
        }
    } catch (error: any) {
        console.error("Error al enviar notificación push multicast:", error.message);
    }
};
