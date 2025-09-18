/**
 * 应用程序配置文件
 * 统一管理所有环境相关的配置项
 */

// 获取本机IP地址（可以通过环境变量覆盖）
const getHostIP = (): string => {
  return process.env.HOST_IP || '192.168.203.123';
};

// 获取主机名（可以通过环境变量覆盖）
const getHostname = (): string => {
  return process.env.HOSTNAME || getHostIP();
};

export const config = {
  // 服务器配置
  server: {
    port: parseInt(process.env.PORT || '3001'),
    host: '0.0.0.0', // 监听所有接口
    hostname: getHostname(),
  },

  // 前端配置
  frontend: {
    port: parseInt(process.env.FRONTEND_PORT || '3000'),
    hostname: getHostname(),
    get url() {
      return `http://${this.hostname}:${this.port}`;
    }
  },

  // WebAuthn 配置
  webauthn: {
    // Relying Party ID - 必须与前端访问域名匹配
    rpId: getHostname(),
    rpName: 'Passkey Demo',
    // 允许的来源 - 前端访问地址
    get allowedOrigins() {
      const hostname = getHostname();
      return [
        `http://localhost:${config.frontend.port}`,
        `http://${hostname}:${config.frontend.port}`
      ];
    },
    // 超时时间（毫秒）
    timeout: 60000,
  },

  // CORS 配置
  cors: {
    get origins() {
      return config.webauthn.allowedOrigins;
    },
    credentials: true
  },

  // 开发模式配置
  development: {
    // 是否启用详细日志
    verbose: process.env.NODE_ENV === 'development',
    // 是否启用调试模式
    debug: process.env.DEBUG === 'true',
  },

  // 数据存储配置
  storage: {
    dataDir: process.env.DATA_DIR || './data',
    // 清理间隔（毫秒）
    cleanupInterval: 60 * 60 * 1000, // 1小时
  }
} as const;

// 导出便捷的访问方法
export const getServerUrl = () => `http://${config.server.hostname}:${config.server.port}`;
export const getFrontendUrl = () => config.frontend.url;
export const getApiUrl = () => `${getServerUrl()}/api`;

// 打印配置信息（仅在开发模式）
if (config.development.verbose) {
  console.log('📋 应用配置信息:');
  console.log(`  服务器地址: ${getServerUrl()}`);
  console.log(`  前端地址: ${getFrontendUrl()}`);
  console.log(`  API地址: ${getApiUrl()}`);
  console.log(`  WebAuthn RP ID: ${config.webauthn.rpId}`);
  console.log(`  允许的来源: ${config.webauthn.allowedOrigins.join(', ')}`);
}
