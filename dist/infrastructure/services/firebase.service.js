"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushNotification = void 0;
const app_1 = require("firebase-admin/app");
const messaging_1 = require("firebase-admin/messaging");
const user_model_1 = __importDefault(require("../database/models/user-model"));
let isFirebaseInitialized = false;
try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
        console.warn("ADVERTENCIA: FIREBASE_SERVICE_ACCOUNT_JSON no está definida. " +
            "Las notificaciones push están desactivadas temporalmente.");
    }
    else {
        const serviceAccount = JSON.parse(serviceAccountJson);
        if ((0, app_1.getApps)().length === 0) {
            (0, app_1.initializeApp)({
                credential: (0, app_1.cert)(serviceAccount)
            });
        }
        isFirebaseInitialized = true;
        console.log("Firebase Admin SDK inicializado exitosamente desde variable de entorno.");
    }
}
catch (error) {
    console.error("Error leyendo FIREBASE_SERVICE_ACCOUNT_JSON o inicializando Firebase Admin SDK:", error.message);
}
// Envía una notificación push a una lista de tokens FCM. Proporciona manejo de errores para ignorar y limpiar automáticamente tokens inválidos/viejos de la base de datos.
const sendPushNotification = async (tokens, title, body, data) => {
    if (!isFirebaseInitialized || tokens.length === 0) {
        return;
    }
    // Filtrar tokens vacíos, nulos y eliminar duplicados para evitar envíos dobles al mismo dispositivo
    const uniqueTokens = Array.from(new Set(tokens.filter(t => t && t.trim().length > 0)));
    if (uniqueTokens.length === 0)
        return;
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
                    priority: "high"
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
        const response = await (0, messaging_1.getMessaging)().sendEachForMulticast(message);
        console.log(`Envío multicast FCM: ${response.successCount} exitosas, ${response.failureCount} fallidas.`);
        // Limpiar tokens expirados o desinstalados para mantener la integridad de la base de datos
        if (response.failureCount > 0) {
            const tokensToRemove = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success && resp.error) {
                    const code = resp.error.code;
                    // Códigos estándar de Firebase para tokens inválidos o no registrados
                    if (code === "messaging/registration-token-not-registered" ||
                        code === "messaging/invalid-registration-token") {
                        tokensToRemove.push(uniqueTokens[idx]);
                    }
                }
            });
            if (tokensToRemove.length > 0) {
                console.log(`-> Limpiando ${tokensToRemove.length} tokens FCM obsoletos de la base de datos...`);
                await user_model_1.default.updateMany({ fcmTokens: { $in: tokensToRemove } }, { $pull: { fcmTokens: { $in: tokensToRemove } } });
            }
        }
    }
    catch (error) {
        console.error("Error al enviar notificación push multicast:", error.message);
    }
};
exports.sendPushNotification = sendPushNotification;
