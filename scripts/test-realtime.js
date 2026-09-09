const WebSocket = require("ws");
const { server, io } = require("../dist/app");

let finished = false;

const finish = (exitCode, message) => {
    if (finished) return;
    finished = true;

    if (exitCode === 0) {
        console.log(message);
    } else {
        console.error(message);
    }

    io.close(() => process.exit(exitCode));
};

const timeout = setTimeout(() => {
    finish(1, "La prueba Socket.IO superó el tiempo de espera.");
}, 10_000);
timeout.unref();

server.listen(0, "127.0.0.1", async () => {
    try {
        const address = server.address();
        if (!address || typeof address === "string") {
            throw new Error("No se pudo obtener el puerto local de prueba.");
        }

        const baseUrl = `http://127.0.0.1:${address.port}`;
        const pollingResponse = await fetch(
            `${baseUrl}/socket.io/?EIO=4&transport=polling`
        );
        const pollingBody = await pollingResponse.text();

        if (!pollingResponse.ok || !pollingBody.startsWith("0")) {
            throw new Error("Falló el handshake Engine.IO por polling.");
        }

        console.log("Handshake Engine.IO por polling: OK");

        const socket = new WebSocket(
            `ws://127.0.0.1:${address.port}/socket.io/?EIO=4&transport=websocket`
        );

        socket.on("message", (data) => {
            if (!data.toString().startsWith("0")) return;

            clearTimeout(timeout);
            socket.close();
            finish(0, "Handshake Engine.IO por WebSocket: OK");
        });

        socket.on("error", (error) => {
            clearTimeout(timeout);
            finish(1, `Falló el handshake WebSocket: ${error.message}`);
        });
    } catch (error) {
        clearTimeout(timeout);
        finish(1, `Falló la prueba en tiempo real: ${error.message}`);
    }
});
