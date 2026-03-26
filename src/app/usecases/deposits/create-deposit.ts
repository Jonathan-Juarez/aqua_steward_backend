import Deposit from "../../../domain/entities/deposit";
import { IDepositRepository } from "../../../domain/repository/deposit-repository.interface";

export default class CreateDepositUseCase {
    constructor(private depositRepository: IDepositRepository) { }

    async execute(dto: any) {
        const newDeposit = new Deposit({
            name: dto.name,
            ip: dto.ip,
            capacity: dto.capacity,
            installation_height: dto.installation_height,
            fill_gap: dto.fill_gap,
            owner_id: dto.owner_id,
            sensors: dto.sensors
        });

        newDeposit.validate();

        const existingDeposit = await this.depositRepository.findByIp(newDeposit.ip!);
        if (existingDeposit) {
            throw new Error("La IP ya existe en un depósito");
        }

        const savedDeposit = await this.depositRepository.save(newDeposit);
        return savedDeposit;
    }
}
