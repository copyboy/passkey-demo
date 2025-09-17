"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialStorage = void 0;
const base_1 = require("./base");
class CredentialStorage extends base_1.BaseStorage {
    constructor() {
        super('credentials.json');
    }
    async findAll() {
        await this.loadData();
        return this.data;
    }
    async findById(id) {
        await this.loadData();
        return this.data.find(credential => credential.id === id) || null;
    }
    async findByUserId(userId) {
        await this.loadData();
        return this.data.filter(credential => credential.user_id === userId);
    }
    async create(credentialData) {
        await this.loadData();
        const credential = {
            id: 'id' in credentialData ? credentialData.id : this.generateId(),
            ...credentialData,
            created_at: this.formatDate(),
            updated_at: this.formatDate()
        };
        this.data.push(credential);
        await this.saveData();
        return credential;
    }
    async update(id, credentialData) {
        await this.loadData();
        const index = this.data.findIndex(credential => credential.id === id);
        if (index === -1)
            return null;
        this.data[index] = {
            ...this.data[index],
            ...credentialData,
            updated_at: this.formatDate()
        };
        await this.saveData();
        return this.data[index];
    }
    async updateSignCount(id, signCount) {
        await this.loadData();
        const index = this.data.findIndex(credential => credential.id === id);
        if (index === -1)
            return false;
        this.data[index].sign_count = signCount;
        this.data[index].updated_at = this.formatDate();
        await this.saveData();
        return true;
    }
    async delete(id) {
        await this.loadData();
        const index = this.data.findIndex(credential => credential.id === id);
        if (index === -1)
            return false;
        this.data.splice(index, 1);
        await this.saveData();
        return true;
    }
    async deleteByUserId(userId) {
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
exports.CredentialStorage = CredentialStorage;
//# sourceMappingURL=credential.js.map