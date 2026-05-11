import Deposit from "../../../domain/entities/deposit";
import { IAuthRepository } from "../../../domain/repository/auth-repository.interface";
import { IDepositRepository } from "../../../domain/repository/deposit-repository.interface";
import { ICreateDepositDTO } from "../../dtos/deposit.dto";
import { ConflictError } from "../../../infrastructure/errors/ConflictError";
import { NotFoundError } from "../../../infrastructure/errors/NotFoundError";

export default class CreateDepositUseCase {
    constructor(private depositRepository: IDepositRepository, private authRepository: IAuthRepository) { }

    async execute(dto: ICreateDepositDTO) {
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
            throw new ConflictError("La IP ya existe en un depósito");
        }

        const savedDeposit = await this.depositRepository.save(newDeposit);

        // Tras crear exitosamente el depósito, se busca al usuario que lo creó y se añade un objeto en assigned_deposit { role: "owner", deposit: savedDeposit.id }.
        const user = await this.authRepository.findById(dto.owner_id);

        if (!user) {
            throw new NotFoundError("El usuario no existe");
        }

        // Si el usuario no tiene depósitos asignados, se inicializa el array.
        if (!user.assigned_deposits) {
            user.assigned_deposits = [];
        }

        // Se agrega el depósito al usuario como propietario.
        user.assigned_deposits.push({ role: "owner", status: "accepted", deposit_id: savedDeposit.id! });
        // Se actualiza el usuario.
        await this.authRepository.update(user.id!, user);

        return savedDeposit;
    }
}
