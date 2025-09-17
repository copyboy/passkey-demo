"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const auth_1 = require("../services/auth");
class UserController {
    constructor() {
        this.getMe = async (req, res) => {
            try {
                const sessionId = req.cookies.sessionId;
                if (!sessionId) {
                    res.status(401).json({
                        error: {
                            code: 'UNAUTHORIZED',
                            message: '未登录'
                        }
                    });
                    return;
                }
                const user = await this.authService.getCurrentUser(sessionId);
                res.json(user);
            }
            catch (error) {
                const statusCode = error instanceof Error && error.message === '无效的会话' ? 401 : 500;
                res.status(statusCode).json({
                    error: {
                        code: 'USER_ERROR',
                        message: error instanceof Error ? error.message : '获取用户信息失败'
                    }
                });
            }
        };
        this.authService = new auth_1.AuthService();
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.js.map