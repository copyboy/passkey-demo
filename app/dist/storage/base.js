"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseStorage = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class BaseStorage {
    constructor(fileName) {
        this.data = [];
        this.filePath = path_1.default.join(process.cwd(), 'data', fileName);
    }
    async loadData() {
        try {
            const data = await promises_1.default.readFile(this.filePath, 'utf-8');
            const parsed = JSON.parse(data);
            this.data = Array.isArray(parsed) ? parsed : parsed.data || [];
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                this.data = [];
                await this.saveData();
            }
            else {
                throw error;
            }
        }
    }
    async saveData() {
        await promises_1.default.mkdir(path_1.default.dirname(this.filePath), { recursive: true });
        await promises_1.default.writeFile(this.filePath, JSON.stringify(this.data, null, 2));
    }
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    formatDate(date = new Date()) {
        return date.toISOString();
    }
}
exports.BaseStorage = BaseStorage;
//# sourceMappingURL=base.js.map