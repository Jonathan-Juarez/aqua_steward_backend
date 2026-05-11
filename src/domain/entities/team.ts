export interface TeamMemberData {
    user_id: string;
    email: string;
    name: string;
    last_name: string;
    role: string;
    status: string;
}

export default class TeamMember {
    user_id: string;
    email: string;
    name: string;
    last_name: string;
    role: string;
    status: string;

    constructor(data: TeamMemberData) {
        this.user_id = data.user_id;
        this.email = data.email;
        this.name = data.name;
        this.last_name = data.last_name;
        this.role = data.role;
        this.status = data.status || 'pending';
    }

    validate(): void {
        if (!this.user_id) throw new Error("No se encontró el usuario");
        if (!this.role) throw new Error("No se encontró el rol");
    }

    isOwner(): boolean {
        return this.role === 'owner';
    }
}
