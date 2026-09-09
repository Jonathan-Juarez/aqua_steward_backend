"use strict";
// Utilidad global para calcular rangos de fecha a partir de un filtro ("Dia", "Semana", "Mes").
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDateRangeFromFilter = void 0;
const getDateRangeFromFilter = (filter) => {
    let startDate = new Date();
    let endDate = new Date();
    if (filter === "Dia") {
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0);
        endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999);
    }
    else if (filter === "Semana") {
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
    }
    else if (filter === "Mes") {
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1, 0, 0, 0, 0);
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    return { startDate, endDate };
};
exports.getDateRangeFromFilter = getDateRangeFromFilter;
