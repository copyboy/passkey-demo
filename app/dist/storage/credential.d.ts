import { BaseStorage } from './base';
import { Credential } from '../types';
export declare class CredentialStorage extends BaseStorage<Credential> {
    constructor();
    findAll(): Promise<Credential[]>;
    findById(id: string): Promise<Credential | null>;
    findByUserId(userId: string): Promise<Credential[]>;
    create(credentialData: Omit<Credential, 'created_at' | 'updated_at'> | Omit<Credential, 'id' | 'created_at' | 'updated_at'>): Promise<Credential>;
    update(id: string, credentialData: Partial<Credential>): Promise<Credential | null>;
    updateSignCount(id: string, signCount: number): Promise<boolean>;
    delete(id: string): Promise<boolean>;
    deleteByUserId(userId: string): Promise<boolean>;
}
//# sourceMappingURL=credential.d.ts.map