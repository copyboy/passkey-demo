import fs from 'fs/promises';
import path from 'path';

export abstract class BaseStorage<T> {
  protected filePath: string;
  protected data: T[] = [];

  constructor(fileName: string) {
    this.filePath = path.join(process.cwd(), 'data', fileName);
  }

  protected async loadData(): Promise<void> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(data);
      this.data = Array.isArray(parsed) ? parsed : parsed.data || [];
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        this.data = [];
        await this.saveData();
      } else {
        throw error;
      }
    }
  }

  protected async saveData(): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2));
  }

  protected generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  protected formatDate(date: Date = new Date()): string {
    return date.toISOString();
  }

  abstract findAll(): Promise<T[]>;
  abstract findById(id: string): Promise<T | null>;
  abstract create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T>;
  abstract update(id: string, data: Partial<T>): Promise<T | null>;
  abstract delete(id: string): Promise<boolean>;
}