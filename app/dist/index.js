"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = __importDefault(require("./routes"));
const auth_1 = require("./services/auth");
const config_1 = require("./config");
const crypto = __importStar(require("crypto"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || config_1.config.cors.origins,
    credentials: config_1.config.cors.credentials
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
app.use('/api', routes_1.default);
app.get('/', (_req, res) => {
    res.redirect('/api/health');
});
app.use((err, _req, res, _next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error'
        }
    });
});
app.use((_req, res) => {
    res.status(404).json({
        error: {
            code: 'NOT_FOUND',
            message: 'Route not found'
        }
    });
});
const server = app.listen(config_1.config.server.port, config_1.config.server.host, () => {
    console.log(`🚀 Server running on ${(0, config_1.getServerUrl)()}`);
    console.log(`📝 Health check: ${(0, config_1.getApiUrl)()}/health`);
    console.log(`🔧 API Base URL: ${(0, config_1.getApiUrl)()}`);
    console.log(`🌐 Local access: http://localhost:${config_1.config.server.port}/api/health`);
    if (!crypto.webcrypto || !crypto.webcrypto.getRandomValues) {
        console.error('WebCrypto API is not available. WebAuthn will not work properly.');
    }
    else {
        console.log('WebCrypto API is available for WebAuthn operations');
    }
});
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
const authService = new auth_1.AuthService();
setInterval(async () => {
    try {
        const result = await authService.cleanup();
        if (result.expiredChallenges > 0 || result.expiredSessions > 0) {
            console.log(`Cleaned up ${result.expiredChallenges} expired challenges and ${result.expiredSessions} expired sessions`);
        }
    }
    catch (error) {
        console.error('Error during cleanup:', error);
    }
}, config_1.config.storage.cleanupInterval);
exports.default = app;
//# sourceMappingURL=index.js.map