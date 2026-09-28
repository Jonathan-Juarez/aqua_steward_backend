"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
// Importación de adaptadores HTTP (Routers)
const auth_route_1 = require("./interfaces/http/auth-route");
const deposit_route_1 = require("./interfaces/http/deposit-route");
const reading_route_1 = require("./interfaces/http/reading-route");
const team_route_1 = require("./interfaces/http/team-route");
const notification_route_1 = require("./interfaces/http/notification-route");
const tech_route_1 = require("./interfaces/http/tech-route");
// Repositorios de Infraestructura (MongoDB)
const auth_repository_mongo_1 = __importDefault(require("./infrastructure/database/repositories/auth-repository.mongo"));
const deposit_repository_mongo_1 = __importDefault(require("./infrastructure/database/repositories/deposit-repository.mongo"));
const reading_repository_mongo_1 = __importDefault(require("./infrastructure/database/repositories/reading-repository.mongo"));
const team_repository_mongo_1 = require("./infrastructure/database/repositories/team-repository.mongo");
const notification_repository_mongo_1 = __importDefault(require("./infrastructure/database/repositories/notification-repository.mongo"));
const tech_repository_mongo_1 = __importDefault(require("./infrastructure/database/repositories/tech-repository.mongo"));
// Casos de Uso - Auth
const signup_usecase_1 = __importDefault(require("./app/usecases/auth/signup.usecase"));
const signin_usecase_1 = __importDefault(require("./app/usecases/auth/signin.usecase"));
const reset_password_usecase_1 = __importDefault(require("./app/usecases/auth/reset-password.usecase"));
const update_user_usecase_1 = __importDefault(require("./app/usecases/auth/update-user.usecase"));
const delete_user_usecase_1 = __importDefault(require("./app/usecases/auth/delete-user.usecase"));
const send_otp_usecase_1 = __importDefault(require("./app/usecases/auth/send-otp.usecase"));
const verify_otp_usecase_1 = __importDefault(require("./app/usecases/auth/verify-otp.usecase"));
// Casos de Uso - Deposits
const create_deposit_usecase_1 = __importDefault(require("./app/usecases/deposits/create-deposit.usecase"));
const get_deposits_usecase_1 = __importDefault(require("./app/usecases/deposits/get-deposits.usecase"));
const delete_deposit_usecase_1 = __importDefault(require("./app/usecases/deposits/delete-deposit.usecase"));
const update_deposit_usecase_1 = __importDefault(require("./app/usecases/deposits/update-deposit.usecase"));
// Casos de Uso - Readings
const get_readings_usecase_1 = __importDefault(require("./app/usecases/readings/get-readings.usecase"));
const export_readings_usecase_1 = __importDefault(require("./app/usecases/readings/export-readings.usecase"));
const get_reading_report_stats_usecase_1 = __importDefault(require("./app/usecases/readings/get-reading-report-stats.usecase"));
// Casos de Uso - Team
const get_team_usecase_1 = require("./app/usecases/team/get-team.usecase");
const invite_member_usecase_1 = require("./app/usecases/team/invite-member.usecase");
const update_member_usecase_1 = require("./app/usecases/team/update-member.usecase");
const delete_member_usecase_1 = require("./app/usecases/team/delete-member.usecase");
const accept_invitation_usecase_1 = require("./app/usecases/team/accept-invitation.usecase");
const reject_invitation_usecase_1 = require("./app/usecases/team/reject-invitation.usecase");
const get_invitation_usecase_1 = require("./app/usecases/team/get-invitation.usecase");
// Casos de Uso - Notifications
const register_token_usecase_1 = __importDefault(require("./app/usecases/notifications/register-token.usecase"));
const unregister_token_usecase_1 = __importDefault(require("./app/usecases/notifications/unregister-token.usecase"));
const get_notifications_usecase_1 = __importDefault(require("./app/usecases/notifications/get-notifications.usecase"));
const delete_notification_usecase_1 = __importDefault(require("./app/usecases/notifications/delete-notification.usecase"));
const delete_all_notifications_usecase_1 = __importDefault(require("./app/usecases/notifications/delete-all-notifications.usecase"));
const mark_read_usecase_1 = __importDefault(require("./app/usecases/notifications/mark-read.usecase"));
// Casos de Uso - Tech
const get_system_stats_usecase_1 = __importDefault(require("./app/usecases/tech/get-system-stats.usecase"));
const get_all_users_tech_usecase_1 = __importDefault(require("./app/usecases/tech/get-all-users-tech.usecase"));
const errors_1 = require("./infrastructure/middlewares/errors");
const rate_limit_1 = require("./infrastructure/middlewares/rate_limit");
// Crear instancia de express, servidor HTTP y servidor de Socket.IO.
exports.app = (0, express_1.default)();
exports.server = http_1.default.createServer(exports.app);
// Socket.IO acepta polling y WebSocket. CapRover debe tener habilitada la
// opción "Websocket Support" para permitir la actualización a wss://.
exports.io = new socket_io_1.Server(exports.server, {
    path: "/socket.io",
    transports: ["polling", "websocket"],
    allowEIO3: true,
    pingInterval: 25_000,
    pingTimeout: 20_000,
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
exports.io.on("connection", (socket) => {
    console.log(`[Socket.IO] Cliente conectado: ${socket.id} ` +
        `(transporte: ${socket.conn.transport.name}, total: ${exports.io.engine.clientsCount})`);
    socket.conn.on("upgrade", (transport) => {
        console.log(`[Socket.IO] ${socket.id} actualizado a ${transport.name}.`);
    });
    socket.on("disconnect", (reason) => {
        console.log(`[Socket.IO] Cliente desconectado: ${socket.id} ` +
            `(motivo: ${reason}, total: ${exports.io.engine.clientsCount})`);
    });
    socket.emit("realtime_ready", {
        status: "connected",
        socketId: socket.id
    });
});
exports.io.engine.on("connection_error", (error) => {
    console.error(`[Socket.IO] Error de conexión (${error.code}): ${error.message}`);
});
// Desactivar cabecera X-Powered-By para evitar exploits al indicar el framework usado en las respuestas.
exports.app.disable("x-powered-by");
// Middlewares
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
// Respuesta básica al abrir directamente el dominio del backend.
exports.app.get("/", (_req, res) => {
    res.status(200).json({
        service: "AquaSteward Backend",
        status: "ok"
    });
});
// Endpoint liviano para verificar desde CapRover que el contenedor está activo.
exports.app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        realtime: {
            path: "/socket.io",
            connectedClients: exports.io.engine.clientsCount
        }
    });
});
// Limitadores según la sensibilidad del módulo.
const generalLimiter = (0, rate_limit_1.createLimiter)(1 * 60 * 1000, 60); // 60 peticiones / 1 min para uso fluido de la app.
const authLimiter = (0, rate_limit_1.createLimiter)(15 * 60 * 1000, 20); // 20 peticiones / 15 min para protección de login / claves.
// Inyección de dependencias
const authRepository = new auth_repository_mongo_1.default();
const depositRepository = new deposit_repository_mongo_1.default();
const readingRepository = new reading_repository_mongo_1.default();
const teamRepository = new team_repository_mongo_1.TeamRepositoryMongo();
const notificationRepository = new notification_repository_mongo_1.default();
const techRepository = new tech_repository_mongo_1.default(); // NO SE USA EN LA APP, ES PARA EL DESARROLLADOR, POSIBLEMENTE SE ELIMINE.
// Rutas con su respectivo Rate Limiter e inyección de casos de uso
exports.app.use("/api/auth", authLimiter, (0, auth_route_1.AuthRouter)({
    sendOtpUseCase: new send_otp_usecase_1.default(),
    verifyOtpUseCase: new verify_otp_usecase_1.default(),
    signupUseCase: new signup_usecase_1.default(authRepository),
    signinUseCase: new signin_usecase_1.default(authRepository),
    resetPasswordUseCase: new reset_password_usecase_1.default(authRepository),
    updateUserUseCase: new update_user_usecase_1.default(authRepository),
    deleteUserUseCase: new delete_user_usecase_1.default(authRepository)
}));
exports.app.use("/api/deposit", generalLimiter, (0, deposit_route_1.DepositRouter)({
    createDepositUseCase: new create_deposit_usecase_1.default(depositRepository, authRepository),
    getDepositsUseCase: new get_deposits_usecase_1.default(depositRepository, authRepository),
    deleteDepositUseCase: new delete_deposit_usecase_1.default(depositRepository, teamRepository),
    updateDepositUseCase: new update_deposit_usecase_1.default(depositRepository)
}));
exports.app.use("/api/reading", generalLimiter, (0, reading_route_1.ReadingRouter)({
    getReadingsUseCase: new get_readings_usecase_1.default(depositRepository, readingRepository),
    exportReadingsUseCase: new export_readings_usecase_1.default(depositRepository, readingRepository),
    getReadingReportStatsUseCase: new get_reading_report_stats_usecase_1.default(readingRepository)
}));
exports.app.use("/api/team", generalLimiter, (0, team_route_1.TeamRouter)({
    getTeamUseCase: new get_team_usecase_1.GetTeamUseCase(teamRepository),
    inviteMemberUseCase: new invite_member_usecase_1.InviteMemberUseCase(teamRepository, authRepository, depositRepository),
    updateMemberUseCase: new update_member_usecase_1.UpdateMemberUseCase(teamRepository, authRepository, depositRepository),
    deleteMemberUseCase: new delete_member_usecase_1.DeleteMemberUseCase(teamRepository, authRepository, depositRepository),
    acceptInvitationUseCase: new accept_invitation_usecase_1.AcceptInvitationUseCase(teamRepository, authRepository),
    rejectInvitationUseCase: new reject_invitation_usecase_1.RejectInvitationUseCase(teamRepository, authRepository),
    getInvitationUseCase: new get_invitation_usecase_1.GetInvitationUseCase(teamRepository, authRepository)
}));
exports.app.use("/api/notifications", generalLimiter, (0, notification_route_1.NotificationRouter)({
    registerTokenUseCase: new register_token_usecase_1.default(notificationRepository),
    unregisterTokenUseCase: new unregister_token_usecase_1.default(notificationRepository),
    getNotificationsUseCase: new get_notifications_usecase_1.default(notificationRepository),
    deleteNotificationUseCase: new delete_notification_usecase_1.default(notificationRepository),
    deleteAllNotificationsUseCase: new delete_all_notifications_usecase_1.default(notificationRepository),
    markNotificationsAsReadUseCase: new mark_read_usecase_1.default(notificationRepository)
}));
exports.app.use("/api/tech", (0, tech_route_1.TechRouter)({
    getSystemStatsUseCase: new get_system_stats_usecase_1.default(techRepository),
    getAllUsersTechUseCase: new get_all_users_tech_usecase_1.default(techRepository)
}));
// Middleware para manejo de errores globales.
exports.app.use(errors_1.errors);
