"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const router = (0, express_1.Router)();
const authController = new auth_1.AuthController();
router.post('/register/challenge', authController.getRegistrationChallenge);
router.post('/register/verify', authController.verifyRegistration);
router.post('/login/challenge', authController.getLoginChallenge);
router.post('/login/verify', authController.verifyLogin);
router.post('/logout', authController.logout);
exports.default = router;
//# sourceMappingURL=auth.js.map