import { BaseStorage } from './base';
import { Challenge } from '../types';
export declare class ChallengeStorage extends BaseStorage<Challenge> {
    constructor();
    findAll(): Promise<Challenge[]>;
    findById(id: string): Promise<Challenge | null>;
    findByUsername(username: string): Promise<Challenge[]>;
    findByUsernameAndType(username: string, type: 'register' | 'login'): Promise<Challenge | null>;
    create(challengeData: any): Promise<Challenge>;
    update(id: string, challengeData: Partial<Challenge>): Promise<Challenge | null>;
    delete(id: string): Promise<boolean>;
    cleanupExpired(): Promise<number>;
    isValidChallenge(challenge: string, username: string, type: 'register' | 'login'): Promise<boolean>;
}
//# sourceMappingURL=challenge.d.ts.map