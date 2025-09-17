"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStorage = void 0;
const base_1 = require("./base");
class UserStorage extends base_1.BaseStorage {
    constructor() {
        super('users.json');
    }
    async findAll() {
        await this.loadData();
        return this.data;
    }
    async findById(id) {
        await this.loadData();
        return this.data.find(user => user.id === id) || null;
    }
    async findByUsername(username) {
        await this.loadData();
        return this.data.find(user => user.username === username) || null;
    }
    async create(userData) {
        await this.loadData();
        const user = {
            id: this.generateId(),
            ...userData,
            created_at: this.formatDate(),
            updated_at: this.formatDate()
        };
        this.data.push(user);
        await this.saveData();
        return user;
    }
    async update(id, userData) {
        await this.loadData();
        const index = this.data.findIndex(user => user.id === id);
        if (index === -1)
            return null;
        this.data[index] = {
            ...this.data[index],
            ...userData,
            updated_at: this.formatDate()
        };
        await this.saveData();
        return this.data[index];
    }
    async delete(id) {
        await this.loadData();
        const index = this.data.findIndex(user => user.id === id);
        if (index === -1)
            return false;
        this.data.splice(index, 1);
        await this.saveData();
        return true;
    }
}
exports.UserStorage = UserStorage;
//# sourceMappingURL=user.js.map