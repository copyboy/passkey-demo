export declare abstract class BaseStorage<T> {
    protected filePath: string;
    protected data: T[];
    constructor(fileName: string);
    protected loadData(): Promise<void>;
    protected saveData(): Promise<void>;
    protected generateId(): string;
    protected formatDate(date?: Date): string;
    abstract findAll(): Promise<T[]>;
    abstract findById(id: string): Promise<T | null>;
    abstract create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T>;
    abstract update(id: string, data: Partial<T>): Promise<T | null>;
    abstract delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=base.d.ts.map