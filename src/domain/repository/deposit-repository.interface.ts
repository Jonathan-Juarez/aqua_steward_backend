import Deposit from "../entities/deposit";

export interface IDepositRepository {
    findByIp(ip: string): Promise<Deposit | null>;
    findById(id: string): Promise<Deposit | null>;
    findByOwnerId(ownerId: string): Promise<Deposit[]>;
    findByIds(ids: string[]): Promise<Deposit[]>;
    save(deposit: Deposit): Promise<Deposit>;
    delete(id: string): Promise<Deposit | null>;
    update(id: string, newData: Partial<Deposit>): Promise<Deposit | null>;
}
