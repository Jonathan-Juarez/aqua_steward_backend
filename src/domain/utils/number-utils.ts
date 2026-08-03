// Asegura que ningún cálculo o lectura genere imprecisiones con varios decimales.
export const roundTo1Decimal = (val: number): number => {
    if (typeof val !== "number" || isNaN(val)) return 0;
    return Math.round((val + Number.EPSILON) * 10) / 10;
};

// Formatea el valor para que no muestre decimales si es un número entero.
export const formatCleanNumber = (val: number): string => {
    const rounded = roundTo1Decimal(val);
    return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
};
