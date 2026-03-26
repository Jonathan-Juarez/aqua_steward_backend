# AquaSteward Backend

AquaSteward es un sistema que resuelve la problemática de la mala gestión del agua, tanto en su desperdicio como en su calidad (pH y la turbidez). El monitoreo no lo realiza solo, sino que se le ofrece al usuario la capacidad de trabajar en conjunto con otros individuos mediante sus dispositivos móviles y acceso a internet, cada uno con un rol determinado (analista, administrador y propietario), por lo que el usuario objetivo no presenta limitaciones de edad o nivel educativo para su uso básico. Sin embargo, para el uso avanzado, es necesario que el usuario tenga entre 18 y 60 años, fundamentos sobre la ciencia de datos y un nivel educativo medio superior en adelante.

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
| **Herramientas de Desarrollo** | Nodemon, ts-node |

## Estructura del Proyecto con Clean Architecture

El código sigue los principios de la Arquitectura Limpia, separando el núcleo de negocio de los detalles técnicos en tres capas principales:

```text
src/
├── domain/                      
│   ├── entities/                # Entidades con modelos del negocio y reglas internas
│   │   ├── deposit.ts           
│   │   ├── reading.ts           
│   │   ├── user.ts              
│   │   ├── alert.js             
│   │   ├── report.js            
│   │   └── sensor.js            
│   └── repository/              # Interfaces de repositorio (contratos)
│       ├── deposit-repository.interface.ts
│       └── user-repository.interface.ts
│
├── app/                         
│   └── usecases/
│       ├── auth/                # Casos de uso de autenticación
│       │   ├── signup.ts        
│       │   ├── signin.ts        
│       │   └── restore-password.ts  
│       └── deposits/            # Casos de uso de depósitos
│           ├── create-deposit.ts   
│           ├── get-deposits.ts     
│           └── delete-deposit.ts    
│
├── infrastructure/              
│   ├── config/
│   │   └── connect-db.ts        # Conexión a MongoDB
│   ├── controllers/             # Controladores de la API REST
│   │   ├── auth-controller.ts   
│   │   └── deposit-controller.ts    
│   ├── database/
│   │   ├── models/              # Esquemas Mongoose
│   │   │   ├── user-model.ts
│   │   │   ├── deposit-model.ts
│   │   │   ├── reading-model.ts
│   │   │   ├── alert-model.js
│   │   │   └── report-model.js
│   │   └── repositories/       # Implementaciones Mongo de repositorios
│   │       ├── user-repository.mongo.ts
│   │       └── deposit-repository.mongo.ts
│   ├── middlewares/
│   │   └── auth.ts              # Validación de tokens JWT
│   ├── mqtt/                 
│   │   ├── broker.ts            # Conexión y suscripción al Broker HiveMQ
│   │   ├── level-sensor.ts      # Trabaja con el sensor de nivel (HC-SR04)
│   │   ├── ph-sensor.ts         # Trabaja con el sensor de pH (PH-4502C)
│   │   └── turbidity-sensor.ts  # Trabaja con el sensor de turbidez (TS300B)
│   └── routes/                  # Definición de endpoints
│       ├── auth-route.ts
│       └── deposit-route.ts
│
└── server.ts                    # Punto de entrada de la aplicación
```

## Endpoints de la API REST
Hasta el momento se han implementado los siguientes endpoints:

### Autenticación (`/api/auth`)

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| `POST` | `/signup` | Registro de nuevo usuario | No |
| `POST` | `/signin` | Inicio de sesión (retorna JWT) | No |
| `PUT` | `/restore-password` | Restaurar contraseña | No |

### Depósitos (`/api/deposit`)

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| `POST` | `/createDeposit` | Crear un nuevo depósito | Sí (`x-auth-token`) |
| `GET` | `/getDeposits` | Obtener depósitos del usuario | Sí (`x-auth-token`) |
| `DELETE` | `/deleteDeposit/:id` | Eliminar un depósito por ID | Sí (`x-auth-token`) |

## Comunicación en Tiempo Real

### MQTT (IoT → Backend)

El backend se suscribe al tópico raíz `aquasteward/#` del broker HiveMQ Cloud. Los sensores publican datos crudos que los workers procesan y transforman según las reglas de la entidad correspondiente:

*   **Nivel de agua** — `aquasteward/level`
*   **pH** — `aquasteward/ph`
*   **Turbidez** — `aquasteward/turbidity`

### WebSockets (Backend → App Móvil)

Cada sensor con el que se trabaja (worker) retransmite los datos procesados a la app móvil (Flutter) conectada mediante Socket.io, emitiendo eventos por tipo de sensor.

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
    PORT=3000

    JWT_SECRET=<tu_secreto_jwt>

    # Credenciales HiveMQ
    MQTT_PORT=8883
    MQTT_USERNAME=<usuario_mqtt>
    MQTT_PASSWORD=<contraseña_mqtt>
    MQTT_CLUSTER_URL=mqtts://<tu_cluster>.hivemq.cloud
    ```

### Comandos Disponibles

| Comando | Descripción |
|-|-|
| `npm run dev` | Inicia el servidor en modo desarrollo con auto-recarga (nodemon + ts-node) |
| `npm run build` | Compila los módulos TypeScript a la carpeta `/dist` |
| `npm run start` | Inicia el servidor de producción desde `/dist/server.js` |
