"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TeamMember {
    user_id;
    email;
    name;
    last_name;
    role;
    status;
    constructor(data) {
        this.user_id = data.user_id;
        this.email = data.email;
        this.name = data.name;
        this.last_name = data.last_name;
        this.role = data.role;
        this.status = data.status || 'pending';
    }
    validate() {
        if (!this.user_id)
            throw new Error("No se encontró el usuario");
        if (!this.role)
            throw new Error("No se encontró el rol");
    }
    isOwner() {
        return this.role === 'owner';
    }
}
exports.default = TeamMember;
