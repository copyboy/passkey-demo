"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_1 = require("../services/auth");
class AuthController {
    constructor() {
        this.getRegistrationChallenge = async (req, res) => {
            try {
                const { username } = req.body;
                if (!username || typeof username !== 'string') {
                    res.status(400).json({
                        error: {
                            code: 'INVALID_REQUEST',
                            message: '用户名是必需的'
                        }
                    });
                    return;
                }
                const options = await this.authService.generateRegistrationOptions(username);
                res.json(options);
            }
            catch (error) {
                const statusCode = error instanceof Error && error.message === '用户名已存在' ? 409 : 500;
                res.status(statusCode).json({
                    error: {
                        code: 'REGISTRATION_ERROR',
                        message: error instanceof Error ? error.message : '获取注册选项失败'
                    }
                });
            }
        };
        this.verifyRegistration = async (req, res) => {
            try {
                const { username, credential } = req.body;
                if (!username || !credential) {
                    res.status(400).json({
                        error: {
                            code: 'INVALID_REQUEST',
                            message: '用户名和凭证是必需的'
                        }
                    });
                    return;
                }
                const result = await this.authService.verifyRegistration(username, credential);
                res.json(result);
            }
            catch (error) {
                res.status(400).json({
                    error: {
                        code: 'REGISTRATION_FAILED',
                        message: error instanceof Error ? error.message : '注册失败'
                    }
                });
            }
        };
        this.getLoginChallenge = async (req, res) => {
            try {
                const { username } = req.body;
                if (!username || typeof username !== 'string') {
                    res.status(400).json({
                        error: {
                            code: 'INVALID_REQUEST',
                            message: '用户名是必需的'
                        }
                    });
                    return;
                }
                const options = await this.authService.generateAuthenticationOptions(username);
                res.json(options);
            }
            catch (error) {
                const statusCode = error instanceof Error && error.message === '用户不存在' ? 404 : 500;
                res.status(statusCode).json({
                    error: {
                        code: 'LOGIN_ERROR',
                        message: error instanceof Error ? error.message : '获取登录选项失败'
                    }
                });
            }
        };
        this.verifyLogin = async (req, res) => {
            try {
                const { username, credential } = req.body;
                if (!username || !credential) {
                    res.status(400).json({
                        error: {
                            code: 'INVALID_REQUEST',
                            message: '用户名和凭证是必需的'
                        }
                    });
                    return;
                }
                const result = await this.authService.verifyAuthentication(username, credential);
                if (result.sessionId) {
                    res.cookie('sessionId', result.sessionId, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: 24 * 60 * 60 * 1000
                    });
                }
                res.json(result);
            }
            catch (error) {
                res.status(400).json({
                    error: {
                        code: 'LOGIN_FAILED',
                        message: error instanceof Error ? error.message : '登录失败'
                    }
                });
            }
        };
        this.logout = async (req, res) => {
            try {
                const sessionId = req.cookies.sessionId;
                if (!sessionId) {
                    res.status(400).json({
                        error: {
                            code: 'INVALID_REQUEST',
                            message: '没有找到有效的会话'
                        }
                    });
                    return;
                }
                const result = await this.authService.logout(sessionId);
                res.clearCookie('sessionId');
                res.json(result);
            }
            catch (error) {
                res.status(400).json({
                    error: {
                        code: 'LOGOUT_FAILED',
                        message: error instanceof Error ? error.message : '注销失败'
                    }
                });
            }
        };
        this.authService = new auth_1.AuthService();
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.js.map