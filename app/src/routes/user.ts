import { Router } from 'express';
import { UserController } from '../controllers/user';

const router: Router = Router();
const userController = new UserController();

// 获取当前用户信息
router.get('/me', userController.getMe);

export default router;