"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GetSystemStatsUseCase {
    techRepository;
    constructor(techRepository) {
        this.techRepository = techRepository;
    }
    async execute() {
        return await this.techRepository.getSystemStats();
    }
}
exports.default = GetSystemStatsUseCase;
