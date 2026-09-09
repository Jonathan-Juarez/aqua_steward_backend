"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCleanNumber = exports.roundTo1Decimal = void 0;
// Asegura que ningún cálculo o lectura genere imprecisiones con varios decimales.
const roundTo1Decimal = (val) => {
    if (typeof val !== "number" || isNaN(val))
        return 0;
    return Math.round((val + Number.EPSILON) * 10) / 10;
};
exports.roundTo1Decimal = roundTo1Decimal;
// Formatea el valor para que no muestre decimales si es un número entero.
const formatCleanNumber = (val) => {
    const rounded = (0, exports.roundTo1Decimal)(val);
    return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
};
exports.formatCleanNumber = formatCleanNumber;
