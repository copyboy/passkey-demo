"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = require("../controllers/user");
const router = (0, express_1.Router)();
const userController = new user_1.UserController();
router.get('/me', userController.getMe);
exports.default = router;
//# sourceMappingURL=user.js.map