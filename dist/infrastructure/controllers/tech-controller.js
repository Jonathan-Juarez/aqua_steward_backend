"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechController = void 0;
const get_system_stats_usecase_1 = __importDefault(require("../../app/usecases/tech/get-system-stats.usecase"));
const get_all_users_tech_usecase_1 = __importDefault(require("../../app/usecases/tech/get-all-users-tech.usecase"));
const tech_repository_mongo_1 = __importDefault(require("../database/repositories/tech-repository.mongo"));
const techRepository = new tech_repository_mongo_1.default();
const getSystemStatsUseCase = new get_system_stats_usecase_1.default(techRepository);
const getAllUsersTechUseCase = new get_all_users_tech_usecase_1.default(techRepository);
class TechController {
    static async getStats(req, res) {
        const stats = await getSystemStatsUseCase.execute();
        return res.status(200).json(stats);
    }
    static async getUsers(req, res) {
        const users = await getAllUsersTechUseCase.execute();
        return res.status(200).json(users);
    }
}
exports.TechController = TechController;
