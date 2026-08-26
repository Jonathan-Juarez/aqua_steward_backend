export default interface IRealTimeRepository {
    emitDepositUpdate(
        depositId: string,
        deviceIp: string,
        topicKey: string,
        processedValue: number
    ): void;
}
