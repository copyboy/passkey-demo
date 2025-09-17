import { Request, Response } from 'express';
import { AuthService } from '../services/auth';
import { ErrorResponse } from '../types';

export class UserController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // 获取当前用户信息
  getMe = async (req: Request, res: Response): Promise<void> => {
    try {
      const sessionId = req.cookies.sessionId;
      
      if (!sessionId) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: '未登录'
          }
        } as ErrorResponse);
        return;
      }

      const user = await this.authService.getCurrentUser(sessionId);
      
      res.json(user);
    } catch (error) {
      const statusCode = error instanceof Error && error.message === '无效的会话' ? 401 : 500;
      res.status(statusCode).json({
        error: {
          code: 'USER_ERROR',
          message: error instanceof Error ? error.message : '获取用户信息失败'
        }
      } as ErrorResponse);
    }
  };
}