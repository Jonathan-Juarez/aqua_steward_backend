export interface ISystemStatsDTO {
    totalUsers: number;
    totalDeposits: number;
    activeSensors: {
        distance: number;
        ph: number;
        turbidity: number;
    };
}

export interface ITechUserSummaryDTO {
    id: string;
    name: string;
    last_name: string;
    email: string;
    global_role: string;
    assignedDepositsCount: number;
    createdAt?: Date;
}
