"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionStorage = void 0;
const base_1 = require("./base");
class SessionStorage extends base_1.BaseStorage {
    constructor() {
        super('sessions.json');
    }
    async findAll() {
        await this.loadData();
        return this.data;
    }
    async findById(id) {
        await this.loadData();
        return this.data.find(session => session.id === id) || null;
    }
    async findByUserId(userId) {
        await this.loadData();
        return this.data.find(session => session.user_id === userId) || null;
    }
    async create(sessionData) {
        await this.loadData();
        await this.cleanupExpired();
        const session = {
            id: this.generateId(),
            ...sessionData,
            created_at: this.formatDate(),
            expires_at: this.formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000))
        };
        this.data.push(session);
        await this.saveData();
        return session;
    }
    async update(id, sessionData) {
        await this.loadData();
        const index = this.data.findIndex(session => session.id === id);
        if (index === -1)
            return null;
        this.data[index] = {
            ...this.data[index],
            ...sessionData
        };
        await this.saveData();
        return this.data[index];
    }
    async delete(id) {
        await this.loadData();
        const index = this.data.findIndex(session => session.id === id);
        if (index === -1)
            return false;
        this.data.splice(index, 1);
        await this.saveData();
        return true;
    }
    async deleteByUserId(userId) {
        await this.loadData();
        const initialLength = this.data.length;
        this.data = this.data.filter(session => session.user_id !== userId);
        if (this.data.length < initialLength) {
            await this.saveData();
            return true;
        }
        return false;
    }
    async cleanupExpired() {
        await this.loadData();
        const now = new Date();
        const initialLength = this.data.length;
        this.data = this.data.filter(session => new Date(session.expires_at) > now);
        if (this.data.length < initialLength) {
            await this.saveData();
        }
        return initialLength - this.data.length;
    }
    async isValidSession(id) {
        await this.loadData();
        const session = this.data.find(s => s.id === id);
        if (!session)
            return false;
        return new Date(session.expires_at) > new Date();
    }
}
exports.SessionStorage = SessionStorage;
//# sourceMappingURL=session.js.map