import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './user';

const router: Router = Router();

// 健康检查
router.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 认证路由
router.use('/auth', authRoutes);

// 用户路由
router.use('/user', userRoutes);

export default router;