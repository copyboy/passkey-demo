"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiUrl = exports.getFrontendUrl = exports.getServerUrl = exports.config = void 0;
const getHostIP = () => {
    return process.env.HOST_IP || '192.168.203.123';
};
const getHostname = () => {
    return process.env.HOSTNAME || getHostIP();
};
exports.config = {
    server: {
        port: parseInt(process.env.PORT || '3001'),
        host: '0.0.0.0',
        hostname: getHostname(),
    },
    frontend: {
        port: parseInt(process.env.FRONTEND_PORT || '3000'),
        hostname: getHostname(),
        get url() {
            return `http://${this.hostname}:${this.port}`;
        }
    },
    webauthn: {
        rpId: getHostname(),
        rpName: 'Passkey Demo',
        get allowedOrigins() {
            const hostname = getHostname();
            return [
                `http://localhost:${exports.config.frontend.port}`,
                `http://${hostname}:${exports.config.frontend.port}`
            ];
        },
        timeout: 60000,
    },
    cors: {
        get origins() {
            return exports.config.webauthn.allowedOrigins;
        },
        credentials: true
    },
    development: {
        verbose: process.env.NODE_ENV === 'development',
        debug: process.env.DEBUG === 'true',
    },
    storage: {
        dataDir: process.env.DATA_DIR || './data',
        cleanupInterval: 60 * 60 * 1000,
    }
};
const getServerUrl = () => `http://${exports.config.server.hostname}:${exports.config.server.port}`;
exports.getServerUrl = getServerUrl;
const getFrontendUrl = () => exports.config.frontend.url;
exports.getFrontendUrl = getFrontendUrl;
const getApiUrl = () => `${(0, exports.getServerUrl)()}/api`;
exports.getApiUrl = getApiUrl;
if (exports.config.development.verbose) {
    console.log('📋 应用配置信息:');
    console.log(`  服务器地址: ${(0, exports.getServerUrl)()}`);
    console.log(`  前端地址: ${(0, exports.getFrontendUrl)()}`);
    console.log(`  API地址: ${(0, exports.getApiUrl)()}`);
    console.log(`  WebAuthn RP ID: ${exports.config.webauthn.rpId}`);
    console.log(`  允许的来源: ${exports.config.webauthn.allowedOrigins.join(', ')}`);
}
//# sourceMappingURL=index.js.map