import { ISystemStatsDTO, ITechUserSummaryDTO } from "../../app/dtos/tech.dto";

export interface ITechRepository {
    getSystemStats(): Promise<ISystemStatsDTO>;
    getAllUsers(): Promise<ITechUserSummaryDTO[]>;
}
