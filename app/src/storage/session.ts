import { BaseStorage } from './base';
import { Session } from '../types';

export class SessionStorage extends BaseStorage<Session> {
  constructor() {
    super('sessions.json');
  }

  async findAll(): Promise<Session[]> {
    await this.loadData();
    return this.data;
  }

  async findById(id: string): Promise<Session | null> {
    await this.loadData();
    return this.data.find(session => session.id === id) || null;
  }

  async findByUserId(userId: string): Promise<Session | null> {
    await this.loadData();
    return this.data.find(session => session.user_id === userId) || null;
  }

  async create(sessionData: any): Promise<Session> {
    await this.loadData();
    
    // 清理过期会话
    await this.cleanupExpired();
    
    const session: Session = {
      id: this.generateId(),
      ...sessionData,
      created_at: this.formatDate(),
      expires_at: this.formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000)) // 24小时后过期
    };

    this.data.push(session);
    await this.saveData();
    
    return session;
  }

  async update(id: string, sessionData: Partial<Session>): Promise<Session | null> {
    await this.loadData();
    
    const index = this.data.findIndex(session => session.id === id);
    if (index === -1) return null;

    this.data[index] = {
      ...this.data[index],
      ...sessionData
    };

    await this.saveData();
    return this.data[index];
  }

  async delete(id: string): Promise<boolean> {
    await this.loadData();
    
    const index = this.data.findIndex(session => session.id === id);
    if (index === -1) return false;

    this.data.splice(index, 1);
    await this.saveData();
    return true;
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    await this.loadData();
    
    const initialLength = this.data.length;
    this.data = this.data.filter(session => session.user_id !== userId);
    
    if (this.data.length < initialLength) {
      await this.saveData();
      return true;
    }
    
    return false;
  }

  async cleanupExpired(): Promise<number> {
    await this.loadData();
    
    const now = new Date();
    const initialLength = this.data.length;
    
    this.data = this.data.filter(session => 
      new Date(session.expires_at) > now
    );
    
    if (this.data.length < initialLength) {
      await this.saveData();
    }
    
    return initialLength - this.data.length;
  }

  async isValidSession(id: string): Promise<boolean> {
    await this.loadData();
    
    const session = this.data.find(s => s.id === id);
    if (!session) return false;
    
    // 检查是否过期
    return new Date(session.expires_at) > new Date();
  }
}