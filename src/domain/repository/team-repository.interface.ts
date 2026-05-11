import TeamMember from "../entities/team";

export interface ITeamRepository {
    getTeam(deposit_id: string): Promise<TeamMember[]>;
    invite(deposit_id: string, email: string, role: string): Promise<TeamMember | null>;
    update(deposit_id: string, user_id: string, role: string): Promise<TeamMember | null>;
    delete(deposit_id: string, user_id: string): Promise<void>;
    acceptInvitation(deposit_id: string, user_id: string): Promise<void>;
    rejectInvitation(deposit_id: string, user_id: string): Promise<void>;
    getInvitations(user_id: string): Promise<any[]>;
}
