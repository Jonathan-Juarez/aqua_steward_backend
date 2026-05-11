// DTO que define los datos crudos recibidos desde el listener MQTT.
export interface IReadingRawDTO {
    deviceIp: string;
    topicKey: string;
    rawValue: number;
}

// Resultado que se devuelve al listener para que emita por WebSocket/MQTT.
export interface IReadingProcessedDTO {
    sensorType: string;
    deviceIp: string;
    processedValue: number;
}

// Define el contrato estricto de entrada para obtener las lecturas de un sensor en un depósito.
export interface GetReadingsDTO {
    depositId: string;
    sensorType: string;
    filter: string;
}

