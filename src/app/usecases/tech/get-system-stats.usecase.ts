import { ITechRepository } from "../../../domain/repository/tech-repository.interface";
import { ISystemStatsDTO } from "../../dtos/tech.dto";

export default class GetSystemStatsUseCase {
    constructor(private techRepository: ITechRepository) {}

    async execute(): Promise<ISystemStatsDTO> {
        return await this.techRepository.getSystemStats();
    }
}
