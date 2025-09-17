import { Request, Response } from 'express';
import { AuthService } from '../services/auth';
import { RegisterRequest, LoginRequest, ErrorResponse } from '../types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // 获取注册挑战
  getRegistrationChallenge = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username } = req.body;
      
      if (!username || typeof username !== 'string') {
        res.status(400).json({
          error: {
            code: 'INVALID_REQUEST',
            message: '用户名是必需的'
          }
        } as ErrorResponse);
        return;
      }

      const options = await this.authService.generateRegistrationOptions(username);
      
      res.json(options);
    } catch (error) {
      const statusCode = error instanceof Error && error.message === '用户名已存在' ? 409 : 500;
      res.status(statusCode).json({
        error: {
          code: 'REGISTRATION_ERROR',
          message: error instanceof Error ? error.message : '获取注册选项失败'
        }
      } as ErrorResponse);
    }
  };

  // 验证注册
  verifyRegistration = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, credential }: RegisterRequest = req.body;
      
      if (!username || !credential) {
        res.status(400).json({
          error: {
            code: 'INVALID_REQUEST',
            message: '用户名和凭证是必需的'
          }
        } as ErrorResponse);
        return;
      }

      const result = await this.authService.verifyRegistration(username, credential);
      
      res.json(result);
    } catch (error) {
      res.status(400).json({
        error: {
          code: 'REGISTRATION_FAILED',
          message: error instanceof Error ? error.message : '注册失败'
        }
      } as ErrorResponse);
    }
  };

  // 获取登录挑战
  getLoginChallenge = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username } = req.body;
      
      if (!username || typeof username !== 'string') {
        res.status(400).json({
          error: {
            code: 'INVALID_REQUEST',
            message: '用户名是必需的'
          }
        } as ErrorResponse);
        return;
      }

      const options = await this.authService.generateAuthenticationOptions(username);
      
      res.json(options);
    } catch (error) {
      const statusCode = error instanceof Error && error.message === '用户不存在' ? 404 : 500;
      res.status(statusCode).json({
        error: {
          code: 'LOGIN_ERROR',
          message: error instanceof Error ? error.message : '获取登录选项失败'
        }
      } as ErrorResponse);
    }
  };

  // 验证登录
  verifyLogin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, credential }: LoginRequest = req.body;
      
      if (!username || !credential) {
        res.status(400).json({
          error: {
            code: 'INVALID_REQUEST',
            message: '用户名和凭证是必需的'
          }
        } as ErrorResponse);
        return;
      }

      const result = await this.authService.verifyAuthentication(username, credential);
      
      // 设置会话 cookie
      if (result.sessionId) {
        res.cookie('sessionId', result.sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000 // 24小时
        });
      }
      
      res.json(result);
    } catch (error) {
      res.status(400).json({
        error: {
          code: 'LOGIN_FAILED',
          message: error instanceof Error ? error.message : '登录失败'
        }
      } as ErrorResponse);
    }
  };

  // 注销
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const sessionId = req.cookies.sessionId;
      
      if (!sessionId) {
        res.status(400).json({
          error: {
            code: 'INVALID_REQUEST',
            message: '没有找到有效的会话'
          }
        } as ErrorResponse);
        return;
      }

      const result = await this.authService.logout(sessionId);
      
      // 清除 cookie
      res.clearCookie('sessionId');
      
      res.json(result);
    } catch (error) {
      res.status(400).json({
        error: {
          code: 'LOGOUT_FAILED',
          message: error instanceof Error ? error.message : '注销失败'
        }
      } as ErrorResponse);
    }
  };
}