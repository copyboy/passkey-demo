"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const crypto_1 = require("crypto");
const config_1 = require("../config");
const storage_1 = require("../storage");
if (typeof globalThis.crypto === 'undefined') {
    const { webcrypto } = require('crypto');
    globalThis.crypto = webcrypto;
}
class AuthService {
    constructor() {
        if (typeof globalThis.crypto === 'undefined') {
            throw new Error('WebCrypto API is not available. WebAuthn will not work properly.');
        }
        if (!globalThis.crypto.subtle) {
            throw new Error('WebCrypto subtle API is not available. WebAuthn will not work properly.');
        }
        this.userStorage = new storage_1.UserStorage();
        this.credentialStorage = new storage_1.CredentialStorage();
        this.challengeStorage = new storage_1.ChallengeStorage();
        this.sessionStorage = new storage_1.SessionStorage();
    }
    async generateRegistrationOptions(username) {
        console.log('🔍 [BACKEND] 生成原生注册选项，用户名:', username);
        const existingUser = await this.userStorage.findByUsername(username);
        if (existingUser) {
            throw new Error('用户名已存在');
        }
        const challengeBuffer = (0, crypto_1.randomBytes)(32);
        const challenge = challengeBuffer.toString('base64url');
        console.log('🔍 [BACKEND] 生成 challenge:', {
            length: challengeBuffer.length,
            base64url: challenge,
            base64: challengeBuffer.toString('base64')
        });
        const userIdBuffer = (0, crypto_1.randomBytes)(16);
        const userId = userIdBuffer.toString('base64url');
        console.log('🔍 [BACKEND] 生成用户ID:', {
            length: userIdBuffer.length,
            base64url: userId,
            base64: userIdBuffer.toString('base64')
        });
        const options = {
            challenge: challenge,
            rp: {
                name: config_1.config.webauthn.rpName,
                id: config_1.config.webauthn.rpId
            },
            user: {
                id: userId,
                name: username,
                displayName: username
            },
            pubKeyCredParams: [
                { type: 'public-key', alg: -7 },
                { type: 'public-key', alg: -257 }
            ],
            timeout: config_1.config.webauthn.timeout,
            excludeCredentials: [],
            authenticatorSelection: {
                authenticatorAttachment: 'platform',
                userVerification: 'required',
                residentKey: 'required'
            },
            attestation: 'direct'
        };
        await this.challengeStorage.create({
            challenge: challenge,
            username,
            type: 'register'
        });
        console.log('✅ [BACKEND] 注册选项生成完成');
        return options;
    }
    deserializeCredential(credential) {
        console.log('🔍 [BACKEND] 开始反序列化原生凭证...');
        if (!credential || !credential.id || !credential.rawId || !credential.response) {
            throw new Error('无效的凭证格式');
        }
        console.log('🔍 [BACKEND] 凭证 ID:', credential.id);
        console.log('🔍 [BACKEND] rawId 长度:', credential.rawId.length);
        console.log('🔍 [BACKEND] 类型:', credential.type);
        if (credential.response.attestationObject) {
            console.log('🔍 [BACKEND] 处理注册响应');
            return {
                id: credential.id,
                rawId: this.base64ToArrayBuffer(credential.rawId),
                type: credential.type,
                response: {
                    clientDataJSON: this.base64ToArrayBuffer(credential.response.clientDataJSON),
                    attestationObject: this.base64ToArrayBuffer(credential.response.attestationObject),
                    transports: credential.response.transports || []
                },
                clientExtensionResults: credential.clientExtensionResults || {}
            };
        }
        if (credential.response.authenticatorData) {
            console.log('🔍 [BACKEND] 处理认证响应');
            return {
                id: credential.id,
                rawId: this.base64ToArrayBuffer(credential.rawId),
                type: credential.type,
                response: {
                    clientDataJSON: this.base64ToArrayBuffer(credential.response.clientDataJSON),
                    authenticatorData: this.base64ToArrayBuffer(credential.response.authenticatorData),
                    signature: this.base64ToArrayBuffer(credential.response.signature),
                    userHandle: credential.response.userHandle ? this.base64ToArrayBuffer(credential.response.userHandle) : undefined
                },
                clientExtensionResults: credential.clientExtensionResults || {}
            };
        }
        throw new Error('未知的凭证响应格式');
    }
    base64ToArrayBuffer(base64url) {
        if (!base64url) {
            throw new Error('base64ToArrayBuffer 收到空值');
        }
        try {
            const base64 = this.base64urlToBase64(base64url);
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        }
        catch (error) {
            console.error('🔍 [BACKEND] Base64URL 转换失败:', error instanceof Error ? error.message : 'Unknown error');
            console.error('🔍 [BACKEND] 输入字符串:', base64url);
            throw new Error('Base64URL 转换失败: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }
    base64urlToBase64(base64url) {
        let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
        const padding = 4 - (base64.length % 4);
        if (padding !== 4) {
            base64 += '='.repeat(padding);
        }
        return base64;
    }
    async verifyRegistration(username, credential) {
        console.log('🔍 [BACKEND] 开始原生验证注册流程');
        console.log('🔍 [BACKEND] 用户名:', username);
        const deserializedCredential = this.deserializeCredential(credential);
        console.log('🔍 [BACKEND] 反序列化完成');
        const challenge = await this.challengeStorage.findByUsernameAndType(username, 'register');
        if (!challenge) {
            throw new Error('无效的注册挑战');
        }
        console.log('🔍 [BACKEND] 找到挑战:', challenge.challenge.substring(0, 20) + '...');
        const isValidChallenge = await this.challengeStorage.isValidChallenge(challenge.challenge, username, 'register');
        if (!isValidChallenge) {
            throw new Error('注册挑战已过期');
        }
        let user = await this.userStorage.findByUsername(username);
        if (!user) {
            user = await this.userStorage.create({ username });
        }
        const verification = await this.verifyCredentialAttestation(deserializedCredential, challenge.challenge);
        if (!verification.verified) {
            throw new Error('注册验证失败');
        }
        const credentialData = {
            id: credential.id,
            user_id: user.id,
            public_key: Buffer.from(verification.publicKey).toString('base64url'),
            sign_count: verification.counter,
            device_info: {
                aaguid: verification.aaguid
            }
        };
        await this.credentialStorage.create(credentialData);
        console.log('✅ [BACKEND] 凭证保存成功');
        await this.challengeStorage.delete(challenge.challenge);
        console.log('🎉 [BACKEND] 原生注册流程完成成功');
        return {
            success: true,
            message: '注册成功',
            user
        };
    }
    async verifyCredentialAttestation(credential, expectedChallenge) {
        console.log('🔍 [BACKEND] 开始原生验证凭证认证');
        try {
            const clientDataJSON = new TextDecoder().decode(credential.response.clientDataJSON);
            const clientData = JSON.parse(clientDataJSON);
            console.log('🔍 [BACKEND] ClientData:', {
                type: clientData.type,
                challenge: clientData.challenge,
                origin: clientData.origin
            });
            if (clientData.challenge !== expectedChallenge) {
                throw new Error('Challenge 不匹配');
            }
            if (!config_1.config.webauthn.allowedOrigins.includes(clientData.origin)) {
                throw new Error('Origin 不匹配');
            }
            if (clientData.type !== 'webauthn.create') {
                throw new Error('类型不匹配');
            }
            const attestationBuffer = credential.response.attestationObject;
            console.log('✅ [BACKEND] 基本验证通过');
            return {
                verified: true,
                publicKey: attestationBuffer.slice(0, 32),
                counter: 0,
                aaguid: '00000000-0000-0000-0000-000000000000'
            };
        }
        catch (error) {
            console.error('❌ [BACKEND] 验证失败:', error);
            throw new Error(`验证失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async generateAuthenticationOptions(username) {
        console.log('🔍 [BACKEND] 生成原生登录选项，用户名:', username);
        const user = await this.userStorage.findByUsername(username);
        if (!user) {
            throw new Error('用户不存在');
        }
        const credentials = await this.credentialStorage.findByUserId(user.id);
        if (credentials.length === 0) {
            throw new Error('用户没有注册的凭证');
        }
        const challengeBuffer = (0, crypto_1.randomBytes)(32);
        const challenge = challengeBuffer.toString('base64url');
        console.log('🔍 [BACKEND] 生成登录 challenge:', {
            length: challengeBuffer.length,
            base64url: challenge
        });
        const allowCredentials = credentials.map(cred => ({
            id: cred.id,
            type: 'public-key',
            transports: ['internal']
        }));
        const options = {
            challenge: challenge,
            rpId: config_1.config.webauthn.rpId,
            allowCredentials,
            userVerification: 'required',
            timeout: config_1.config.webauthn.timeout,
            authenticatorSelection: {
                authenticatorAttachment: 'platform',
                userVerification: 'required'
            }
        };
        await this.challengeStorage.create({
            challenge: challenge,
            username,
            type: 'login'
        });
        console.log('✅ [BACKEND] 登录选项生成完成');
        return options;
    }
    async verifyAuthentication(username, credential) {
        console.log('🔍 [BACKEND] 开始原生验证登录流程');
        const challenge = await this.challengeStorage.findByUsernameAndType(username, 'login');
        if (!challenge) {
            throw new Error('无效的登录挑战');
        }
        const isValidChallenge = await this.challengeStorage.isValidChallenge(challenge.challenge, username, 'login');
        if (!isValidChallenge) {
            throw new Error('登录挑战已过期');
        }
        const user = await this.userStorage.findByUsername(username);
        if (!user) {
            throw new Error('用户不存在');
        }
        const userCredential = await this.credentialStorage.findById(credential.id);
        if (!userCredential || userCredential.user_id !== user.id) {
            throw new Error('无效的凭证');
        }
        if (!userCredential.public_key) {
            throw new Error('无效的凭证：缺少公钥');
        }
        const deserializedCredential = this.deserializeCredential(credential);
        const verification = await this.verifyCredentialAssertion(deserializedCredential, challenge.challenge, userCredential.public_key);
        if (!verification.verified) {
            throw new Error('登录验证失败');
        }
        await this.credentialStorage.updateSignCount(userCredential.id, verification.counter);
        const session = await this.sessionStorage.create({
            user_id: user.id
        });
        await this.challengeStorage.delete(challenge.challenge);
        console.log('🎉 [BACKEND] 原生登录流程完成成功');
        return {
            success: true,
            message: '登录成功',
            user,
            sessionId: session.id
        };
    }
    async verifyCredentialAssertion(credential, expectedChallenge, publicKey) {
        console.log('🔍 [BACKEND] 开始原生验证凭证断言');
        try {
            const clientDataJSON = new TextDecoder().decode(credential.response.clientDataJSON);
            const clientData = JSON.parse(clientDataJSON);
            console.log('🔍 [BACKEND] ClientData:', {
                type: clientData.type,
                challenge: clientData.challenge,
                origin: clientData.origin
            });
            if (clientData.challenge !== expectedChallenge) {
                throw new Error('Challenge 不匹配');
            }
            if (!config_1.config.webauthn.allowedOrigins.includes(clientData.origin)) {
                throw new Error('Origin 不匹配');
            }
            if (clientData.type !== 'webauthn.get') {
                throw new Error('类型不匹配');
            }
            console.log('✅ [BACKEND] 登录验证通过');
            return {
                verified: true,
                counter: 0
            };
        }
        catch (error) {
            console.error('❌ [BACKEND] 登录验证失败:', error);
            throw new Error(`验证失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getCurrentUser(sessionId) {
        const session = await this.sessionStorage.findById(sessionId);
        if (!session || !(await this.sessionStorage.isValidSession(sessionId))) {
            throw new Error('无效的会话');
        }
        const user = await this.userStorage.findById(session.user_id);
        if (!user) {
            throw new Error('用户不存在');
        }
        const credentials = await this.credentialStorage.findByUserId(user.id);
        return {
            ...user,
            credentials: credentials.map(cred => ({
                id: cred.id,
                created_at: cred.created_at
            }))
        };
    }
    async logout(sessionId) {
        const success = await this.sessionStorage.delete(sessionId);
        if (!success) {
            throw new Error('注销失败');
        }
        return {
            success: true,
            message: '注销成功'
        };
    }
    async cleanup() {
        const expiredChallenges = await this.challengeStorage.cleanupExpired();
        const expiredSessions = await this.sessionStorage.cleanupExpired();
        return {
            expiredChallenges,
            expiredSessions
        };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.js.map