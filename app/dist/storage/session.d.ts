import { BaseStorage } from './base';
import { Session } from '../types';
export declare class SessionStorage extends BaseStorage<Session> {
    constructor();
    findAll(): Promise<Session[]>;
    findById(id: string): Promise<Session | null>;
    findByUserId(userId: string): Promise<Session | null>;
    create(sessionData: any): Promise<Session>;
    update(id: string, sessionData: Partial<Session>): Promise<Session | null>;
    delete(id: string): Promise<boolean>;
    deleteByUserId(userId: string): Promise<boolean>;
    cleanupExpired(): Promise<number>;
    isValidSession(id: string): Promise<boolean>;
}
//# sourceMappingURL=session.d.ts.map