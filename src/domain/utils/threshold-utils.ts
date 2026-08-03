import { roundTo1Decimal, formatCleanNumber } from "./number-utils";

export interface ThresholdEvaluationResult {
    isTriggered: boolean;
    type: "min" | "max" | "normal";
    message: string;
    triggerValue: number;
}


// Evalúa si una lectura supera el umbral de un sensor y genera un resultado estandarizado con el mensaje de alerta.
export const evaluateThreshold = (
    value: number,
    minVal?: number,
    maxVal?: number,
    depositName: string = "",
    unit: string = ""
): ThresholdEvaluationResult => {
    const valRounded = roundTo1Decimal(value);
    const formattedVal = formatCleanNumber(valRounded);

    // Simplifica la unidad antes de armar el texto
    const unitStr = unit ? ` ${unit}` : '';

    // Mensajes limpios y concisos


    if (minVal !== undefined && valRounded < minVal) {
        const formattedMin = formatCleanNumber(minVal);
        return {
            isTriggered: true,
            type: "min",
            message: `${depositName} bajó del mínimo: ${formattedVal} / ${formattedMin}${unitStr}`,
            triggerValue: valRounded
        };
    }

    if (maxVal !== undefined && valRounded > maxVal) {
        const formattedMax = formatCleanNumber(maxVal);
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
