import express from "express";
import http from "http";
import { Server } from "socket.io";

// Importación de adaptadores HTTP (Routers)
import { AuthRouter } from "./interfaces/http/auth-route";
import { DepositRouter } from "./interfaces/http/deposit-route";
import { ReadingRouter } from "./interfaces/http/reading-route";
import { TeamRouter } from "./interfaces/http/team-route";
import { NotificationRouter } from "./interfaces/http/notification-route";
import { TechRouter } from "./interfaces/http/tech-route";


// Repositorios de Infraestructura (MongoDB)
import AuthRepositoryMongo from "./infrastructure/database/repositories/auth-repository.mongo";
import DepositRepositoryMongo from "./infrastructure/database/repositories/deposit-repository.mongo";
import ReadingRepositoryMongo from "./infrastructure/database/repositories/reading-repository.mongo";
import { TeamRepositoryMongo } from "./infrastructure/database/repositories/team-repository.mongo";
import NotificationRepositoryMongo from "./infrastructure/database/repositories/notification-repository.mongo";
import TechRepositoryMongo from "./infrastructure/database/repositories/tech-repository.mongo";

// Casos de Uso - Auth
import SignupUseCase from "./app/usecases/auth/signup.usecase";
import SigninUseCase from "./app/usecases/auth/signin.usecase";
import ResetPasswordUseCase from "./app/usecases/auth/reset-password.usecase";
import UpdateUserUseCase from "./app/usecases/auth/update-user.usecase";
import DeleteUserUseCase from "./app/usecases/auth/delete-user.usecase";
import SendOtpUseCase from "./app/usecases/auth/send-otp.usecase";
import VerifyOtpUseCase from "./app/usecases/auth/verify-otp.usecase";

// Casos de Uso - Deposits
import CreateDepositUseCase from "./app/usecases/deposits/create-deposit.usecase";
import GetDepositsUseCase from "./app/usecases/deposits/get-deposits.usecase";
import DeleteDepositUseCase from "./app/usecases/deposits/delete-deposit.usecase";
import UpdateDepositUseCase from "./app/usecases/deposits/update-deposit.usecase";

// Casos de Uso - Readings
import GetReadingsUseCase from "./app/usecases/readings/get-readings.usecase";
import ExportReadingsUseCase from "./app/usecases/readings/export-readings.usecase";
import GetReadingReportStatsUseCase from "./app/usecases/readings/get-reading-report-stats.usecase";

// Casos de Uso - Team
import { GetTeamUseCase } from "./app/usecases/team/get-team.usecase";
import { InviteMemberUseCase } from "./app/usecases/team/invite-member.usecase";
import { UpdateMemberUseCase } from "./app/usecases/team/update-member.usecase";
import { DeleteMemberUseCase } from "./app/usecases/team/delete-member.usecase";
import { AcceptInvitationUseCase } from "./app/usecases/team/accept-invitation.usecase";
import { RejectInvitationUseCase } from "./app/usecases/team/reject-invitation.usecase";
import { GetInvitationUseCase } from "./app/usecases/team/get-invitation.usecase";

// Casos de Uso - Notifications
import RegisterTokenUseCase from "./app/usecases/notifications/register-token.usecase";
import UnregisterTokenUseCase from "./app/usecases/notifications/unregister-token.usecase";
import GetNotificationsUseCase from "./app/usecases/notifications/get-notifications.usecase";
import DeleteNotificationUseCase from "./app/usecases/notifications/delete-notification.usecase";
import DeleteAllNotificationsUseCase from "./app/usecases/notifications/delete-all-notifications.usecase";
import MarkNotificationsAsReadUseCase from "./app/usecases/notifications/mark-read.usecase";

// Casos de Uso - Tech
import GetSystemStatsUseCase from "./app/usecases/tech/get-system-stats.usecase";
import GetAllUsersTechUseCase from "./app/usecases/tech/get-all-users-tech.usecase";

import { errors } from "./infrastructure/middlewares/errors";
import { createLimiter } from "./infrastructure/middlewares/rate_limit";


// Crear instancia de express, servidor HTTP y servidor de Socket.IO.
export const app = express();
export const server = http.createServer(app);
// Socket.IO acepta polling y WebSocket. CapRover debe tener habilitada la
// opción "Websocket Support" para permitir la actualización a wss://.
export const io = new Server(server, {
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

io.on("connection", (socket) => {
    console.log(
        `[Socket.IO] Cliente conectado: ${socket.id} ` +
        `(transporte: ${socket.conn.transport.name}, total: ${io.engine.clientsCount})`
    );

    socket.conn.on("upgrade", (transport) => {
        console.log(`[Socket.IO] ${socket.id} actualizado a ${transport.name}.`);
    });

    socket.on("disconnect", (reason) => {
        console.log(
            `[Socket.IO] Cliente desconectado: ${socket.id} ` +
            `(motivo: ${reason}, total: ${io.engine.clientsCount})`
        );
    });

    socket.emit("realtime_ready", {
        status: "connected",
        socketId: socket.id
    });
});

io.engine.on("connection_error", (error) => {
    console.error(
        `[Socket.IO] Error de conexión (${error.code}): ${error.message}`
    );
});

// Desactivar cabecera X-Powered-By para evitar exploits al indicar el framework usado en las respuestas.
app.disable("x-powered-by");

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Respuesta básica al abrir directamente el dominio del backend.
app.get("/", (_req, res) => {
    res.status(200).json({
        service: "AquaSteward Backend",
        status: "ok"
    });
});

// Endpoint liviano para verificar desde CapRover que el contenedor está activo.
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        realtime: {
            path: "/socket.io",
            connectedClients: io.engine.clientsCount
        }
    });
});


// Limitadores según la sensibilidad del módulo.
const generalLimiter = createLimiter(1 * 60 * 1000, 60);  // 60 peticiones / 1 min para uso fluido de la app.
const authLimiter = createLimiter(15 * 60 * 1000, 20);    // 20 peticiones / 15 min para protección de login / claves.

// Inyección de dependencias
const authRepository = new AuthRepositoryMongo();
const depositRepository = new DepositRepositoryMongo();
const readingRepository = new ReadingRepositoryMongo();
const teamRepository = new TeamRepositoryMongo();
const notificationRepository = new NotificationRepositoryMongo();
const techRepository = new TechRepositoryMongo(); // NO SE USA EN LA APP, ES PARA EL DESARROLLADOR, POSIBLEMENTE SE ELIMINE.

// Rutas con su respectivo Rate Limiter e inyección de casos de uso
app.use("/api/auth", authLimiter, AuthRouter({
    sendOtpUseCase: new SendOtpUseCase(),
    verifyOtpUseCase: new VerifyOtpUseCase(),
    signupUseCase: new SignupUseCase(authRepository),
    signinUseCase: new SigninUseCase(authRepository),
    resetPasswordUseCase: new ResetPasswordUseCase(authRepository),
    updateUserUseCase: new UpdateUserUseCase(authRepository),
    deleteUserUseCase: new DeleteUserUseCase(authRepository)
}));

app.use("/api/deposit", generalLimiter, DepositRouter({
    createDepositUseCase: new CreateDepositUseCase(depositRepository, authRepository),
    getDepositsUseCase: new GetDepositsUseCase(depositRepository, authRepository),
    deleteDepositUseCase: new DeleteDepositUseCase(depositRepository, teamRepository),
    updateDepositUseCase: new UpdateDepositUseCase(depositRepository)
}));

app.use("/api/reading", generalLimiter, ReadingRouter({
    getReadingsUseCase: new GetReadingsUseCase(depositRepository, readingRepository),
    exportReadingsUseCase: new ExportReadingsUseCase(depositRepository, readingRepository),
    getReadingReportStatsUseCase: new GetReadingReportStatsUseCase(readingRepository)
}));

app.use("/api/team", generalLimiter, TeamRouter({
    getTeamUseCase: new GetTeamUseCase(teamRepository),
    inviteMemberUseCase: new InviteMemberUseCase(teamRepository, authRepository, depositRepository),
    updateMemberUseCase: new UpdateMemberUseCase(teamRepository, authRepository, depositRepository),
    deleteMemberUseCase: new DeleteMemberUseCase(teamRepository, authRepository, depositRepository),
    acceptInvitationUseCase: new AcceptInvitationUseCase(teamRepository, authRepository),
    rejectInvitationUseCase: new RejectInvitationUseCase(teamRepository, authRepository),
    getInvitationUseCase: new GetInvitationUseCase(teamRepository, authRepository)
}));

app.use("/api/notifications", generalLimiter, NotificationRouter({
    registerTokenUseCase: new RegisterTokenUseCase(notificationRepository),
    unregisterTokenUseCase: new UnregisterTokenUseCase(notificationRepository),
    getNotificationsUseCase: new GetNotificationsUseCase(notificationRepository),
    deleteNotificationUseCase: new DeleteNotificationUseCase(notificationRepository),
    deleteAllNotificationsUseCase: new DeleteAllNotificationsUseCase(notificationRepository),
    markNotificationsAsReadUseCase: new MarkNotificationsAsReadUseCase(notificationRepository)
}));

app.use("/api/tech", TechRouter({
    getSystemStatsUseCase: new GetSystemStatsUseCase(techRepository),
    getAllUsersTechUseCase: new GetAllUsersTechUseCase(techRepository)
}));



// Middleware para manejo de errores globales.
app.use(errors);
