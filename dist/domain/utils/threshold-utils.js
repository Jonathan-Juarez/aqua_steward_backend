"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateThreshold = void 0;
const number_utils_1 = require("./number-utils");
// Evalúa si una lectura supera el umbral de un sensor y genera un resultado estandarizado con el mensaje de alerta.
const evaluateThreshold = (value, minVal, maxVal, depositName = "", unit = "") => {
    const valRounded = (0, number_utils_1.roundTo1Decimal)(value);
    const formattedVal = (0, number_utils_1.formatCleanNumber)(valRounded);
    // Simplifica la unidad antes de armar el texto
    const unitStr = unit ? ` ${unit}` : '';
    // Mensajes limpios y concisos
    if (minVal !== undefined && valRounded < minVal) {
        const formattedMin = (0, number_utils_1.formatCleanNumber)(minVal);
        return {
            isTriggered: true,
            type: "min",
            message: `${depositName} bajó del mínimo: ${formattedVal} / ${formattedMin}${unitStr}`,
            triggerValue: valRounded
        };
    }
    if (maxVal !== undefined && valRounded > maxVal) {
        const formattedMax = (0, number_utils_1.formatCleanNumber)(maxVal);
        return {
            isTriggered: true,
            type: "max",
            message: `${depositName} superó el máximo: ${formattedVal} / ${formattedMax}${unitStr}`,
            triggerValue: valRounded
        };
    }
    return {
        isTriggered: false,
        type: "normal",
        message: "",
        triggerValue: valRounded
    };
};
exports.evaluateThreshold = evaluateThreshold;
