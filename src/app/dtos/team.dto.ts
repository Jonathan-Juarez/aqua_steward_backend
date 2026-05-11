export interface InviteMemberDTO {
    deposit_id: string;
    email: string;
    role: string;
}

export interface UpdateMemberDTO {
    deposit_id: string;
    user_id: string;
    role: string;
}

export interface DeleteMemberDTO {
    deposit_id: string;
    user_id: string;
}

export interface GetTeamDTO {
    deposit_id: string;
}

export interface AcceptInvitationDTO {
    deposit_id: string;
    user_id: string;
}

export interface RejectInvitationDTO {
    deposit_id: string;
    user_id: string;
}

export interface GetInvitationDTO {
    user_id: string;
}