import { Router } from 'express';
import { AuthController } from '../controllers/auth';

const router: Router = Router();
const authController = new AuthController();

// 注册相关
router.post('/register/challenge', authController.getRegistrationChallenge);
router.post('/register/verify', authController.verifyRegistration);

// 登录相关
router.post('/login/challenge', authController.getLoginChallenge);
router.post('/login/verify', authController.verifyLogin);

// 注销
router.post('/logout', authController.logout);

export default router;