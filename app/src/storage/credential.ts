import { BaseStorage } from './base';
import { Credential } from '../types';

export class CredentialStorage extends BaseStorage<Credential> {
  constructor() {
    super('credentials.json');
  }

  async findAll(): Promise<Credential[]> {
    await this.loadData();
    return this.data;
  }

  async findById(id: string): Promise<Credential | null> {
    await this.loadData();
    return this.data.find(credential => credential.id === id) || null;
  }

  async findByUserId(userId: string): Promise<Credential[]> {
    await this.loadData();
    return this.data.filter(credential => credential.user_id === userId);
  }

  async create(credentialData: Omit<Credential, 'created_at' | 'updated_at'> | Omit<Credential, 'id' | 'created_at' | 'updated_at'>): Promise<Credential> {
    await this.loadData();
    
    const credential: Credential = {
      id: 'id' in credentialData ? credentialData.id : this.generateId(),
      ...credentialData,
      created_at: this.formatDate(),
      updated_at: this.formatDate()
    };

    this.data.push(credential);
    await this.saveData();
    
    return credential;
  }

  async update(id: string, credentialData: Partial<Credential>): Promise<Credential | null> {
    await this.loadData();
    
    const index = this.data.findIndex(credential => credential.id === id);
    if (index === -1) return null;

    this.data[index] = {
      ...this.data[index],
      ...credentialData,
      updated_at: this.formatDate()
    };

    await this.saveData();
    return this.data[index];
  }

  async updateSignCount(id: string, signCount: number): Promise<boolean> {
    await this.loadData();
    
    const index = this.data.findIndex(credential => credential.id === id);
    if (index === -1) return false;

    this.data[index].sign_count = signCount;
    this.data[index].updated_at = this.formatDate();
    
    await this.saveData();
    return true;
  }

  async delete(id: string): Promise<boolean> {
    await this.loadData();
    
    const index = this.data.findIndex(credential => credential.id === id);
    if (index === -1) return false;

    this.data.splice(index, 1);
    await this.saveData();
    return true;
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    await this.loadData();
    
    const initialLength = this.data.length;
    this.data = this.data.filter(credential => credential.user_id !== userId);
    
    if (this.data.length < initialLength) {
      await this.saveData();
      return true;
    }
    
    return false;
  }
}