# AquaSteward Backend

AquaSteward es un sistema que resuelve la problemática de la mala gestión del agua, tanto en su desperdicio como en su calidad (pH y la turbidez). El monitoreo no lo realiza solo, sino que se le ofrece al usuario la capacidad de trabajar en conjunto con otros individuos mediante sus dispositivos móviles y acceso a internet, cada uno con un rol determinado (analista, administrador, propietario y técnico), por lo que el usuario objetivo no presenta limitaciones de edad o nivel educativo para su uso básico. Sin embargo, para el uso avanzado, es necesario que el usuario tenga entre 18 y 60 años, fundamentos sobre la ciencia de datos y un nivel educativo medio superior en adelante.

## Tecnologías

El proyecto está construido sobre un backend de Node.js orientado a microservicios lógicos, estructurado mediante TypeScript para reforzar el tipado fuerte y la fiabilidad de sus contratos.

| Categoría | Tecnología |
|---|---|
| **Lenguaje** | TypeScript / Node.js |
| **Framework Web** | Express |
| **Base de Datos** | MongoDB (ODM con Mongoose) |
| **Comunicación en Tiempo Real** | Socket.io |
| **Internet de las Cosas (IoT)** | MQTT.js (Broker HiveMQ Cloud) |
| **Autenticación** | JSON Web Tokens (JWT) y bcryptjs |
| **Notificaciones Push** | Firebase Admin SDK (FCM) |
| **Seguridad** | express-rate-limit |
| **Herramientas de Desarrollo** | Nodemon, ts-node |

## Estructura del Proyecto con Clean Architecture

El código sigue los principios de la Arquitectura Limpia, separando el núcleo de negocio de los detalles técnicos en tres capas principales. La capa de Dominio define los contratos (interfaces) que la capa de Infraestructura implementa, respetando el Principio de Inversión de Dependencias.

```text
src/
├── domain/                          # Capa de Dominio (núcleo de negocio)
│   ├── entities/                    # Entidades con reglas de negocio internas
│   │   ├── deposit.ts
│   │   ├── notification.ts
│   │   ├── reading.ts
│   │   ├── team.ts
│   │   └── user.ts
│   ├── repository/                  # Puertos: interfaces (contratos) de repositorio
│   │   ├── auth-repository.interface.ts
│   │   ├── deposit-repository.interface.ts
│   │   ├── notification-repository.interface.ts
│   │   ├── reading-repository.interface.ts
│   │   ├── realtime-repository.interface.ts   # Puerto de salida para WebSocket
│   │   └── team-repository.interface.ts
│   └── utils/                       # Utilidades de dominio (fechas, números, umbrales, rate limiting)
│       ├── date-utils.ts
│       ├── number-utils.ts
│       ├── rate_limit.ts            # Fábrica de limitadores de tasa con tiempo restante dinámico
│       └── threshold-utils.ts
│
├── app/                             # Capa de Aplicación (casos de uso)
│   ├── dtos/                        # Objetos de Transferencia de Datos
│   │   ├── deposit.dto.ts
│   │   ├── reading.dto.ts
│   │   └── team.dto.ts
│   └── usecases/
│       ├── auth/
│       │   ├── delete-user.usecase.ts
│       │   ├── reset-password.usecase.ts
│       │   ├── send-otp.usecase.ts
│       │   ├── signin.usecase.ts
│       │   ├── signup.usecase.ts
│       │   ├── update-user.usecase.ts
│       │   └── verify-otp.usecase.ts
│       ├── deposits/
│       │   ├── create-deposit.usecase.ts
│       │   ├── delete-deposit.usecase.ts
│       │   ├── get-deposits.usecase.ts
│       │   └── update-deposit.usecase.ts    # Valida sensores activos y conflictos de IP
│       ├── notifications/
│       │   ├── delete-all-notifications.usecase.ts
│       │   ├── delete-notification.usecase.ts
│       │   ├── get-notifications.usecase.ts
│       │   ├── mark-read.usecase.ts
│       │   ├── register-token.usecase.ts
│       │   └── unregister-token.usecase.ts
│       ├── readings/
│       │   ├── export-readings.usecase.ts
│       │   ├── get-reading-report-stats.usecase.ts
│       │   ├── get-readings.usecase.ts
│       │   └── processReadings.usecase.ts     # Transforma, persiste y emite por WS
│       ├── team/
│       │   ├── accept-invitation.usecase.ts
│       │   ├── delete-member.usecase.ts
│       │   ├── get-invitation.usecase.ts
│       │   ├── get-team.usecase.ts
│       │   ├── invite-member.usecase.ts
│       │   ├── reject-invitation.usecase.ts
│       │   └── update-member.usecase.ts
│       └── tech/
│           ├── get-all-users-tech.usecase.ts
│           └── get-system-stats.usecase.ts
│
├── infrastructure/                  # Capa de Infraestructura (detalles técnicos)
│   ├── config/
│   │   ├── connect-db.ts            # Conexión a MongoDB
│   │   └── sensor.config.ts         # Configuración de tópicos y eventos WebSocket
│   ├── database/
│   │   ├── models/                  # Modelos Mongoose
│   │   │   ├── deposit-model.ts
│   │   │   ├── notification-model.ts
│   │   │   ├── reading-model.ts
│   │   │   ├── report-model.js
│   │   │   └── user-model.ts
│   │   └── repositories/           # Adaptadores: implementaciones Mongo de los puertos
│   │       ├── auth-repository.mongo.ts
│   │       ├── deposit-repository.mongo.ts
│   │       ├── notification-repository.mongo.ts
│   │       ├── reading-repository.mongo.ts
│   │       ├── team-repository.mongo.ts
│   │       └── tech-repository.mongo.ts
│   ├── errors/                      # Errores personalizados HTTP
│   │   ├── BadRequestError.ts
│   │   ├── ConflictError.ts
│   │   ├── CustomError.ts
│   │   ├── ForbiddenError.ts
│   │   ├── NotFoundError.ts
│   │   └── UnauthorizedError.ts
│   ├── middlewares/
│   │   ├── auth.ts                  # Validación de tokens JWT
│   │   ├── authorize.ts             # Control de acceso por roles (propietario, admin, analista, técnico)
│   │   ├── errors.ts               # Middleware global de manejo de errores
│   │   └── rate_limit.ts            # Limitador de tasa y tiempo restante dinámico
│   ├── network/                     # Comunicación en tiempo real
│   │   ├── broker.ts               # Conexión y suscripción al Broker HiveMQ
│   │   ├── sensor_listener.ts      # Recibe datos (MQTT) y delega al caso de uso
│   │   └── websocket.ts            # Implementación del puerto IRealTimeRepository (Socket.IO)
│   └── services/
│       ├── firebase.service.ts      # Envío de notificaciones push mediante FCM
│       └── otp.service.ts           # Envío de códigos OTP por correo
│
├── interfaces/                      # Adaptadores primarios / Controladores HTTP
│   └── http/                        # Routers Express de cada módulo
│       ├── auth-route.ts
│       ├── deposit-route.ts
│       ├── notification-route.ts
│       ├── reading-route.ts
│       ├── team-route.ts
│       └── tech-route.ts
│
├── app.ts                           # Configuración de Express, Socket.IO, rate limiting y rutas
└── server.ts                        # Punto de entrada de la aplicación
```

## Endpoints de la API REST

### Estado del Servidor y Salud

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| `GET` | `/` | Retorna el estado base y nombre del servicio | No |
| `GET` | `/health` | Chequeo de salud y conteo de clientes Socket.IO conectados | No |

### Autenticación (`/api/auth`)

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| `POST` | `/send-otp` | Genera y envía código OTP de 4 dígitos al correo electrónico | No |
| `POST` | `/verify-otp` | Valida el código OTP de verificación ingresado | No |
| `POST` | `/signup` | Registro de un nuevo usuario | No |
| `POST` | `/signin` | Inicio de sesión (retorna token JWT y datos de usuario) | No |
| `PUT` | `/restore-password` | Restablece la contraseña tras validar el código OTP | No |
| `PUT` | `/update-user` | Actualiza la información de perfil del usuario | Sí (`x-auth-token`) |
| `DELETE` | `/delete-user` | Elimina la cuenta del usuario autenticado | Sí (`x-auth-token`) |

### Depósitos (`/api/deposit`)

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| `POST` | `/createDeposit` | Crea un nuevo depósito (el creador se asigna como propietario) | Sí (`x-auth-token`) |
| `GET` | `/getDeposits` | Obtiene todos los depósitos asociados al usuario (propios y en equipo) | Sí (`x-auth-token`) |
| `PUT` | `/updateDeposit/:id` | Actualiza configuración, dimensiones y sensores del depósito | Sí (`x-auth-token`, Propietario / Admin) |
| `DELETE` | `/deleteDeposit/:id` | Elimina un depósito por ID y sus registros vinculados | Sí (`x-auth-token`, Propietario) |

### Lecturas y Reportes (`/api/reading`)

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| `GET` | `/:depositId/sensor/:sensorType` | Historial de lecturas de un sensor (`HC-SR04`, `PH-4502C`, `TS300B`). Query: `?filter=Dia\|Semana\|Mes` | Sí (`x-auth-token`) |
| `GET` | `/:depositId/export` | Obtiene registros consolidados de sensores para exportación. Query: `?sensors=HC-SR04,PH-4502C&filter=Dia\|Semana\|Mes` | Sí (`x-auth-token`) |
| `GET` | `/:depositId/report-stats` | Obtiene métricas y estadísticas de cumplimiento para reportes PDF. Query: `?filter=Dia\|Semana\|Mes` | Sí (`x-auth-token`) |

### Equipo y Colaboradores (`/api/team`)

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| `GET` | `/invitations` | Obtiene las invitaciones pendientes recibidas por el usuario | Sí (`x-auth-token`) |
| `GET` | `/:depositId` | Obtiene los miembros y roles del equipo del depósito | Sí (`x-auth-token`) |
| `POST` | `/:depositId/invite` | Invita a un usuario por correo asignándole un rol (`admin`, `analista`, `tecnico`) | Sí (`x-auth-token`, Propietario / Admin) |
| `PUT` | `/:depositId/members/:userId` | Actualiza el rol de un miembro en el depósito | Sí (`x-auth-token`, Propietario / Admin) |
| `DELETE` | `/:depositId/members/:userId` | Elimina a un miembro del equipo del depósito | Sí (`x-auth-token`, Propietario / Admin) |
| `PUT` | `/:depositId/accept` | Acepta una invitación pendiente a un depósito | Sí (`x-auth-token`) |
| `DELETE` | `/:depositId/reject` | Rechaza una invitación pendiente a un depósito | Sí (`x-auth-token`) |
| `DELETE` | `/:depositId/leave` | Abandona voluntariamente el equipo de un depósito | Sí (`x-auth-token`) |

### Notificaciones Push (`/api/notifications`)

| Método | Ruta | Descripción | Autenticación / Rol |
|---|---|---|---|
| `POST` | `/register` | Registra el token FCM del dispositivo para notificaciones push | Sí (`x-auth-token`) |
| `POST` | `/unregister` | Da de baja el token FCM del dispositivo actual | Sí (`x-auth-token`) |
| `GET` | `/getNotifications` | Obtiene el historial de notificaciones y alertas del usuario | Sí (`x-auth-token`) |
| `PUT` | `/markAsRead` | Marca una notificación específica o todas como leídas | Sí (`x-auth-token`) |
| `DELETE` | `/deleteNotification/:id` | Elimina una notificación específica por su ID | Sí (`x-auth-token`) |
| `DELETE` | `/deleteAllNotifications` | Elimina todas las notificaciones recibidas por el usuario | Sí (`x-auth-token`) |

### Soporte y Diagnóstico Técnico (`/api/tech`)

| Método | Ruta | Descripción | Autenticación / Rol |
|---|---|---|---|
| `GET` | `/stats` | Métricas y estadísticas globales del sistema (usuarios, depósitos, lecturas) | Sí (`x-auth-token`, Técnico) |
| `GET` | `/users` | Lista global de usuarios para soporte técnico y auditoría | Sí (`x-auth-token`, Técnico) |

## Comunicación en Tiempo Real

### MQTT (IoT - Backend)

El backend se suscribe al tópico raíz `aquasteward/#` del broker HiveMQ Cloud. Los microcontroladores publican datos crudos en tópicos con el formato `aquasteward/{ip_dispositivo}/{sensor}`:

| Tópico | Sensor | Valor publicado |
|---|---|---|
| `aquasteward/{ip}/distancia` | HC-SR04 (Ultrasonido) | Distancia cruda en cm |
| `aquasteward/{ip}/ph` | PH-4502C | ADC crudo promedio |
| `aquasteward/{ip}/turbidez` | TS300B | ADC crudo promedio |

El `sensor_listener` recibe los mensajes MQTT y delega toda la lógica al `ProcessReadingsUseCase`, el cual valida el dato, lo transforma según las dimensiones del depósito, lo persiste en MongoDB y emite el resultado procesado al cliente móvil.

### WebSockets (Backend - App Móvil)

El caso de uso emite los datos procesados a la app móvil (Flutter) a través de un puerto de salida (`IRealTimeRepository`) implementado por `WebSocketGateway` con Socket.io. Los eventos emitidos son:

| Evento | Clave del dato | Descripción |
|---|---|---|
| `deposit_level_update` | `litros` | Nivel de agua procesado |
| `deposit_ph_update` | `ph` | Valor de pH procesado |
| `deposit_turbidity_update` | `ntu` | Turbidez procesada en NTU |

Todos los eventos incluyen el campo `ip` para identificar el depósito de origen.
También incluyen `depositId`, `sensor`, `value` y `timestamp`; se conserva la
clave específica (`litros`, `ph` o `ntu`) para compatibilidad con clientes
existentes. Al conectarse, el servidor emite `realtime_ready` con el ID del
socket.

En CapRover debe estar activada la opción **Enable Websocket Support** en la
sección **HTTP Settings**. El endpoint `/health` muestra en
`realtime.connectedClients` cuántos clientes Socket.IO están enlazados.

## Seguridad y Rate Limiting

El servidor implementa medidas de protección mediante `express-rate-limit` y la eliminación de cabeceras sensibles:

- **Desactivación de `X-Powered-By`**: Se elimina la cabecera HTTP para evitar exponer la tecnología del servidor a potenciales atacantes.
- **Limitación General de Tasa (`/api/deposit`, `/api/reading`, `/api/team`, `/api/notifications`)**: `60 peticiones` por minuto por IP para permitir un uso fluido de la app móvil sin bloquear al usuario en navegación activa.
- **Limitación Estricta de Autenticación (`/api/auth`)**: `20 peticiones` por 15 minutos por IP para proteger contra ataques de fuerza bruta en inicio de sesión y recuperación de contraseña.
- **Cálculo Dinámico de Tiempo Restante**: En caso de exceder el límite (HTTP 429), la API retorna un JSON indicando el tiempo exacto estimado en minutos y segundos antes de poder reintentar.

## Instalación y Ejecución

Asegúrate de tener **Node.js** y **npm** instalados.

1.  Clona el repositorio:
    ```bash
    git clone <url-del-repositorio>
    cd aqua_steward_backend
    ```

2.  Instala las dependencias:
    ```bash
    npm install
    ```

3.  Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
    ```env
    MONGO_URI=mongodb://localhost:27017/aqua_steward

    JWT_SECRET=<tu_secreto_jwt>

    # Service Account de Firebase en una sola línea de JSON
    FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"<tu_project_id>","private_key_id":"<tu_private_key_id>","private_key":"-----BEGIN PRIVATE KEY-----\n<tu_clave_privada>\n-----END PRIVATE KEY-----\n","client_email":"<tu_client_email>"}

    # Credenciales HiveMQ
    MQTT_PORT=8883
    MQTT_USERNAME=<usuario_mqtt>
    MQTT_PASSWORD=<contraseña_mqtt>
    MQTT_CLUSTER_URL=mqtts://<tu_cluster>.hivemq.cloud
    ```

    No guardes `firebase-service-account.json` en el proyecto. En producción,
    configura `FIREBASE_SERVICE_ACCOUNT_JSON` directamente en CapRover, Docker,
    Render, Railway o el proveedor utilizado, conservando el JSON completo en
    una sola línea.

### Comandos Disponibles

| Comando | Descripción |
|-|-|
| `npm run dev` | Inicia el servidor en modo desarrollo con auto-recarga (nodemon + ts-node) |
| `npm run build` | Compila los módulos TypeScript a la carpeta `/dist` |
| `npm run build:production` | Limpia, compila y comprueba el build que se subirá a CapRover |
| `npm run test:realtime` | Verifica localmente los handshakes polling y WebSocket de Socket.IO |
| `npm run start` | Inicia el servidor de producción desde `/dist/server.js` |

### Despliegue en CapRover

Antes de subir el proyecto, instala las dependencias y genera el build:

```bash
npm install
npm run build:production
```

El segundo comando elimina cualquier build anterior, compila TypeScript y
comprueba que exista `dist/server.js`. Sube el proyecto completo a CapRover,
incluida la carpeta `dist`. Si despliegas desde Git, agrega y confirma también
esa carpeta antes de hacer el despliegue.

En **App Configs** de CapRover configura:

- **Container HTTP Port:** `3000` (puerto asignado por la plantilla Node usada
  por este proyecto).
- **Environmental Variables:** las variables documentadas para `.env`, incluida
  `FIREBASE_SERVICE_ACCOUNT_JSON`. No agregues manualmente una variable `PORT`;
  deja que CapRover proporcione el puerto de la aplicación.

El servidor utiliza automáticamente el valor de `PORT` proporcionado por la
plantilla de CapRover. En el despliegue actual la plantilla asigna `3000`, por
lo que **Container HTTP Port** también debe ser `3000`. Si la plataforma no
proporciona un valor válido, el código conserva `80` únicamente como respaldo.

Después del despliegue puedes comprobar que la API está activa visitando
`https://<tu-dominio>/health`. Debe responder `{"status":"ok"}`. Durante un
nuevo despliegue, CapRover envía `SIGTERM` al contenedor anterior; el servidor
cierra HTTP, MQTT y MongoDB de forma controlada antes de finalizar.
