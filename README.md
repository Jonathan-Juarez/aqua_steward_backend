# AquaSteward Backend

AquaSteward es un sistema que resuelve la problemática de la mala gestión del agua, tanto en su desperdicio como en su calidad (pH y la turbidez). El monitoreo no lo realiza solo, sino que se le ofrece al usuario la capacidad de trabajar en conjunto con otros individuos mediante sus dispositivos móviles y acceso a internet, cada uno con un rol determinado (analista, administrador y propietario), por lo que el usuario objetivo no presenta limitaciones de edad o nivel educativo para su uso básico. Sin embargo, para el uso avanzado, es necesario que el usuario tenga entre 18 y 60 años, fundamentos sobre la ciencia de datos y un nivel educativo medio superior en adelante.

## Caracteristicas Principales

*   **Gestion de Roles Colaborativos:** Identidad y permisos organizados en tres estratos: Propietario, Administrador y Analista.
*   **Monitoreo en Tiempo Real de Sensores:** Lectura continua y procesamiento de variables criticas (pH, Turbidez y Nivel del Agua) utilizando sensores como el HC-SR04, PH-4502C y TS300B.
*   **Procesamiento Telemetrico:** Capacidad de transformacion automatica de senales y voltajes crudos a resultados precisos integrados al modelo de depositos.
*   **Conectividad Dual:** Recepcion de mensajes de hardware IoT a traves del protocolo MQTT (Broker HiveMQ) y retransmision asincrona a clientes web/moviles mediante WebSockets (Socket.io).

## Tecnologías

El proyecto esta construido sobre un backend de Node.js orientado a microservicios logicos, estructurado mediante TypeScript para reforzar el tipado fuerte y la fiabilidad de sus contratos.

*   **Lenguaje:** TypeScript / Node.js
*   **Framework Web:** Express.js
*   **Base de Datos:** MongoDB (Object Data Modeling implementado con Mongoose)
*   **Comunicacion en Tiempo Real:** Socket.io
*   **Internet de las Cosas (IoT):** MQTT.js
*   **Autenticacion:** JSON Web Tokens (JWT) y bcryptjs

## Estructura del Proyecto (Clean Architecture)

El codigo sigue los principios de la Arquitectura Limpia, manteniendo un aislamiento sustancial entre el nucleo de negocio y las herramientas externas:

```text
src/
├── domain/                  # Corazon de la aplicacion (Sin dependencias externas)
│   ├── entities/            # Modelos del negocio y reglas internas (Deposit, User)
│   ├── repositories/        # Interfaces estrictas requeridas para los accesos de dastos (IUserRepository)
│   └── usecases/            # Logica que orquesta flujos sin interaccion directa con la DB
├── infrastructure/          # Detalles externos, conexiones y librerias
│   ├── config/              # Configuracion global como la coneccion a DB
│   ├── controllers/         # Analisis y validacion de HTTP Requests/Responses (Express)
│   ├── database/            # Implementaciones Mongo de Repositorios y Modelos (Esquemas)
│   ├── middlewares/         # Middleware de validacion, como revision de tokens JWT
│   ├── mqtt/                # Modulos de conexion IoT y suscripcion al Broker MQTT
│   └── routes/              # Definicion de endpoints delegados a los Controladores (API REST)
└── server.ts                # Entry point de la aplicacion que vincula dependencias y protocolos
```

## Instalacion y Ejecucion

Para replicar este proyecto en tu entorno local, asegurate de tener Node.js y npm (o pnpm/yarn) vigentes:

1.  Clona el repositorio.
2.  Ejecuta la instalacion de dependencias nativas y de desarrollo:
    ```bash
    npm install
    ```
3.  Crea un archivo `.env` en la raiz del proyecto y define las variables de entorno principales:
    ```text
    PORT=3000
    MONGO_URI=mongodb+srv://...
    ```

### Comandos de Desarrollo y Produccion

El archivo `package.json` incluye los siguientes comandos para la interoperabilidad del superset compilable:

*   `npm run build`: Compila estaticamente los modulos TypeScript y aloja la salida en la carpeta `/dist`.
*   `npm run start`: Inicia el servidor de despliegue a traves de los assets previamente compilados en `/dist/server.js`.
*   `npm run dev`: Ejecuta la aplicacion en servidor virtualizado, auto-compilando en caliente sin escribir en disco, alimentado por el demonio (nodemon y ts-node) para desarrollo continuo.

## Flujo Operativo y de Identidad

La API valida la informacion de cada creacion basandose siempre en Reglas de Negocio en la capa de Entidades (ej. validaciones rigurosas sobre contrasenas, correos o formatos IPv4). Cualquier disrupcion logica se notifica debidamente como errores legibles HTTP `400 Bad Request` o conflictos de recurrencia `409 Conflict`. Cada transaccion segura (tales como registrar o requerir informacion en cadena al broker MQTT) se legitima a lo largo de cabeceras integradas bajo `x-auth-token`.
