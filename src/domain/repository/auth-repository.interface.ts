import User from "../entities/user";

export interface IAuthRepository {
    save(user: User): Promise<User>;
    resetPassword(email: string, newPassword: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    // Partial<User> significa que se pueden actualizar solo algunos campos, ya que son opcionales (Se actualiza nombre y apellido).
    update(id: string, newData: Partial<User>): Promise<User | null>;
}
