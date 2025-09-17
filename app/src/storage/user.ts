import { BaseStorage } from './base';
import { User } from '../types';

export class UserStorage extends BaseStorage<User> {
  constructor() {
    super('users.json');
  }

  async findAll(): Promise<User[]> {
    await this.loadData();
    return this.data;
  }

  async findById(id: string): Promise<User | null> {
    await this.loadData();
    return this.data.find(user => user.id === id) || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    await this.loadData();
    return this.data.find(user => user.username === username) || null;
  }

  async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    await this.loadData();
    
    const user: User = {
      id: this.generateId(),
      ...userData,
      created_at: this.formatDate(),
      updated_at: this.formatDate()
    };

    this.data.push(user);
    await this.saveData();
    
    return user;
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    await this.loadData();
    
    const index = this.data.findIndex(user => user.id === id);
    if (index === -1) return null;

    this.data[index] = {
      ...this.data[index],
      ...userData,
      updated_at: this.formatDate()
    };

    await this.saveData();
    return this.data[index];
  }

  async delete(id: string): Promise<boolean> {
    await this.loadData();
    
    const index = this.data.findIndex(user => user.id === id);
    if (index === -1) return false;

    this.data.splice(index, 1);
    await this.saveData();
    return true;
  }
}