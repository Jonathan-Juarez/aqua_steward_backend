export default interface IRealTimeRepository {
    emitDepositUpdate(deviceIp: string, topicKey: string, processedValue: number): void;
}
