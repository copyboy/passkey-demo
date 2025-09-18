import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes';
import { AuthService } from './services/auth';
import { config, getServerUrl, getApiUrl } from './config';
import * as crypto from 'crypto';

const app: Express = express();

// 中间件
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || config.cors.origins,
  credentials: config.cors.credentials
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API 路由
app.use('/api', apiRoutes);

// 根路径重定向到健康检查
app.get('/', (_req, res) => {
  res.redirect('/api/health');
});

// 错误处理中间件
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: { 
      code: 'INTERNAL_ERROR', 
      message: 'Internal server error' 
    } 
  });
});

// 404 处理
app.use((_req, res) => {
  res.status(404).json({ 
    error: { 
      code: 'NOT_FOUND', 
      message: 'Route not found' 
    } 
  });
});

// 启动服务器
const server = app.listen(config.server.port, config.server.host, () => {
  console.log(`🚀 Server running on ${getServerUrl()}`);
  console.log(`📝 Health check: ${getApiUrl()}/health`);
  console.log(`🔧 API Base URL: ${getApiUrl()}`);
  console.log(`🌐 Local access: http://localhost:${config.server.port}/api/health`);
  
  // 确保 WebCrypto API 可用
  if (!crypto.webcrypto || !crypto.webcrypto.getRandomValues) {
    console.error('WebCrypto API is not available. WebAuthn will not work properly.');
  } else {
    console.log('WebCrypto API is available for WebAuthn operations');
  }
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// 定期清理过期数据
const authService = new AuthService();
setInterval(async () => {
  try {
    const result = await authService.cleanup();
    if (result.expiredChallenges > 0 || result.expiredSessions > 0) {
      console.log(`Cleaned up ${result.expiredChallenges} expired challenges and ${result.expiredSessions} expired sessions`);
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}, config.storage.cleanupInterval);

export default app;