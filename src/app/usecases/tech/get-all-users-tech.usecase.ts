import { ITechRepository } from "../../../domain/repository/tech-repository.interface";
import { ITechUserSummaryDTO } from "../../dtos/tech.dto";

export default class GetAllUsersTechUseCase {
    constructor(private techRepository: ITechRepository) {}

    async execute(): Promise<ITechUserSummaryDTO[]> {
        return await this.techRepository.getAllUsers();
    }
}
