import User from "../entities/user";

export interface IUserRepository {
    findByEmail(email: string): Promise<User | null>;
    save(user: User): Promise<User>;
    restorePassword(email: string, newPassword: string): Promise<User | null>;
}
