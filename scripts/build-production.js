const { existsSync, rmSync } = require("node:fs");
const { execFileSync } = require("node:child_process");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const distPath = path.join(projectRoot, "dist");
const serverEntryPoint = path.join(distPath, "server.js");

try {
    console.log("Limpiando el build anterior...");
    rmSync(distPath, { recursive: true, force: true });

    console.log("Compilando TypeScript para producción...");
    const typescriptCompiler = require.resolve("typescript/bin/tsc");
    execFileSync(process.execPath, [typescriptCompiler], {
        cwd: projectRoot,
        stdio: "inherit"
    });

    if (!existsSync(serverEntryPoint)) {
        throw new Error("La compilación terminó sin generar dist/server.js");
    }

    console.log("Build de producción generado correctamente en dist/.");
    console.log("El proyecto ya está listo para subir a CapRover.");
} catch (error) {
    console.error("No se pudo generar el build de producción:", error.message);
    process.exit(1);
}
