"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengeStorage = void 0;
const base_1 = require("./base");
class ChallengeStorage extends base_1.BaseStorage {
    constructor() {
        super('challenges.json');
    }
    async findAll() {
        await this.loadData();
        return this.data;
    }
    async findById(id) {
        await this.loadData();
        return this.data.find(challenge => challenge.challenge === id) || null;
    }
    async findByUsername(username) {
        await this.loadData();
        return this.data.filter(challenge => challenge.username === username);
    }
    async findByUsernameAndType(username, type) {
        await this.loadData();
        return this.data.find(challenge => challenge.username === username && challenge.type === type) || null;
    }
    async create(challengeData) {
        await this.loadData();
        await this.cleanupExpired();
        const challenge = {
            challenge: challengeData.challenge || this.generateId(),
            username: challengeData.username,
            type: challengeData.type,
            created_at: this.formatDate(),
            expires_at: this.formatDate(new Date(Date.now() + 5 * 60 * 1000))
        };
        this.data.push(challenge);
        await this.saveData();
        return challenge;
    }
    async update(id, challengeData) {
        await this.loadData();
        const index = this.data.findIndex(challenge => challenge.challenge === id);
        if (index === -1)
            return null;
        this.data[index] = {
            ...this.data[index],
            ...challengeData
        };
        await this.saveData();
        return this.data[index];
    }
    async delete(id) {
        await this.loadData();
        const index = this.data.findIndex(challenge => challenge.challenge === id);
        if (index === -1)
            return false;
        this.data.splice(index, 1);
        await this.saveData();
        return true;
    }
    async cleanupExpired() {
        await this.loadData();
        const now = new Date();
        const initialLength = this.data.length;
        this.data = this.data.filter(challenge => new Date(challenge.expires_at) > now);
        if (this.data.length < initialLength) {
            await this.saveData();
        }
        return initialLength - this.data.length;
    }
    async isValidChallenge(challenge, username, type) {
        await this.loadData();
        const challengeData = this.data.find(c => c.challenge === challenge &&
            c.username === username &&
            c.type === type);
        if (!challengeData)
            return false;
        return new Date(challengeData.expires_at) > new Date();
    }
}
exports.ChallengeStorage = ChallengeStorage;
//# sourceMappingURL=challenge.js.map