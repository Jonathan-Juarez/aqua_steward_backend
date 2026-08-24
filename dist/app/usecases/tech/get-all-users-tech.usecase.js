"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GetAllUsersTechUseCase {
    techRepository;
    constructor(techRepository) {
        this.techRepository = techRepository;
    }
    async execute() {
        return await this.techRepository.getAllUsers();
    }
}
exports.default = GetAllUsersTechUseCase;
