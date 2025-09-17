import { BaseStorage } from './base';
import { User } from '../types';
export declare class UserStorage extends BaseStorage<User> {
    constructor();
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User>;
    update(id: string, userData: Partial<User>): Promise<User | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=user.d.ts.map