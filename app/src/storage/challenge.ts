import { BaseStorage } from './base';
import { Challenge } from '../types';

export class ChallengeStorage extends BaseStorage<Challenge> {
  constructor() {
    super('challenges.json');
  }

  async findAll(): Promise<Challenge[]> {
    await this.loadData();
    return this.data;
  }

  async findById(id: string): Promise<Challenge | null> {
    await this.loadData();
    return this.data.find(challenge => challenge.challenge === id) || null;
  }

  async findByUsername(username: string): Promise<Challenge[]> {
    await this.loadData();
    return this.data.filter(challenge => challenge.username === username);
  }

  async findByUsernameAndType(username: string, type: 'register' | 'login'): Promise<Challenge | null> {
    await this.loadData();
    return this.data.find(challenge => 
      challenge.username === username && challenge.type === type
    ) || null;
  }

  async create(challengeData: any): Promise<Challenge> {
    await this.loadData();
    
    // 清理过期的挑战
    await this.cleanupExpired();
    
    const challenge: Challenge = {
      challenge: challengeData.challenge || this.generateId(),
      username: challengeData.username,
      type: challengeData.type,
      created_at: this.formatDate(),
      expires_at: this.formatDate(new Date(Date.now() + 5 * 60 * 1000)) // 5分钟后过期
    };

    this.data.push(challenge);
    await this.saveData();
    
    return challenge;
  }

  async update(id: string, challengeData: Partial<Challenge>): Promise<Challenge | null> {
    await this.loadData();
    
    const index = this.data.findIndex(challenge => challenge.challenge === id);
    if (index === -1) return null;

    this.data[index] = {
      ...this.data[index],
      ...challengeData
    };

    await this.saveData();
    return this.data[index];
  }

  async delete(id: string): Promise<boolean> {
    await this.loadData();
    
    const index = this.data.findIndex(challenge => challenge.challenge === id);
    if (index === -1) return false;

    this.data.splice(index, 1);
    await this.saveData();
    return true;
  }

  async cleanupExpired(): Promise<number> {
    await this.loadData();
    
    const now = new Date();
    const initialLength = this.data.length;
    
    this.data = this.data.filter(challenge => 
      new Date(challenge.expires_at) > now
    );
    
    if (this.data.length < initialLength) {
      await this.saveData();
    }
    
    return initialLength - this.data.length;
  }

  async isValidChallenge(challenge: string, username: string, type: 'register' | 'login'): Promise<boolean> {
    await this.loadData();
    
    const challengeData = this.data.find(c => 
      c.challenge === challenge && 
      c.username === username && 
      c.type === type
    );
    
    if (!challengeData) return false;
    
    // 检查是否过期
    return new Date(challengeData.expires_at) > new Date();
  }
}