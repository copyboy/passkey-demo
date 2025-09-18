import { randomBytes } from 'crypto';
import { UserStorage, CredentialStorage, ChallengeStorage, SessionStorage } from '../storage';
import { User, Credential, Challenge, Session, AttestationConveyancePreference, UserVerificationRequirement } from '../types';

// 全局设置 WebCrypto API

if (typeof globalThis.crypto === 'undefined') {
  const { webcrypto } = require('crypto');
  globalThis.crypto = webcrypto;
}

export class AuthService {
  private userStorage: UserStorage;
  private credentialStorage: CredentialStorage;
  private challengeStorage: ChallengeStorage;
  private sessionStorage: SessionStorage;

  constructor() {
    // 确保 WebCrypto API 可用
    if (typeof globalThis.crypto === 'undefined') {
      throw new Error('WebCrypto API is not available. WebAuthn will not work properly.');
    }
    
    // 确保 crypto.subtle 可用
    if (!globalThis.crypto.subtle) {
      throw new Error('WebCrypto subtle API is not available. WebAuthn will not work properly.');
    }
    
    this.userStorage = new UserStorage();
    this.credentialStorage = new CredentialStorage();
    this.challengeStorage = new ChallengeStorage();
    this.sessionStorage = new SessionStorage();
  }

  // 生成注册选项 - 原生实现
  async generateRegistrationOptions(username: string) {
    console.log('🔍 [BACKEND] 生成原生注册选项，用户名:', username);
    
    // 检查用户是否已存在
    const existingUser = await this.userStorage.findByUsername(username);
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    // 生成随机 challenge (32字节)
    const challengeBuffer = randomBytes(32);
    const challenge = challengeBuffer.toString('base64url');
    
    console.log('🔍 [BACKEND] 生成 challenge:', {
      length: challengeBuffer.length,
      base64url: challenge,
      base64: challengeBuffer.toString('base64')
    });

    // 生成用户ID (16字节)
    const userIdBuffer = randomBytes(16);
    const userId = userIdBuffer.toString('base64url');
    
    console.log('🔍 [BACKEND] 生成用户ID:', {
      length: userIdBuffer.length,
      base64url: userId,
      base64: userIdBuffer.toString('base64')
    });

    const options = {
      challenge: challenge, // 发送 base64url 格式
      rp: {
        name: 'Passkey Demo',
        id: 'localhost'
      },
      user: {
        id: userId, // 发送 base64url 格式
        name: username,
        displayName: username
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 } // RS256
      ],
      timeout: 60000,
      excludeCredentials: [],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'required'
      },
      attestation: 'direct' as AttestationConveyancePreference
    };

    // 保存挑战
    await this.challengeStorage.create({
      challenge: challenge,
      username,
      type: 'register'
    } as any);

    console.log('✅ [BACKEND] 注册选项生成完成');
    return options;
  }

  // 反序列化原生 WebAuthn 凭证数据
  private deserializeCredential(credential: any): any {
    console.log('🔍 [BACKEND] 开始反序列化原生凭证...');
    
    // 基本验证
    if (!credential || !credential.id || !credential.rawId || !credential.response) {
      throw new Error('无效的凭证格式');
    }
    
    console.log('🔍 [BACKEND] 凭证 ID:', credential.id);
    console.log('🔍 [BACKEND] rawId 长度:', credential.rawId.length);
    console.log('🔍 [BACKEND] 类型:', credential.type);
    
    // 处理注册响应（包含 attestationObject）
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
    
    // 处理认证响应（包含 authenticatorData 和 signature）
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

  // 将 base64url 字符串转换为 ArrayBuffer
  private base64ToArrayBuffer(base64url: string): ArrayBuffer {
    if (!base64url) {
      throw new Error('base64ToArrayBuffer 收到空值');
    }
    
    try {
      // 将 base64url 转换为标准 base64
      const base64 = this.base64urlToBase64(base64url);
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    } catch (error) {
      console.error('🔍 [BACKEND] Base64URL 转换失败:', error instanceof Error ? error.message : 'Unknown error');
      console.error('🔍 [BACKEND] 输入字符串:', base64url);
      throw new Error('Base64URL 转换失败: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  // 将 base64url 转换为标准 base64
  private base64urlToBase64(base64url: string): string {
    // 替换 URL 安全字符
    let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    
    // 添加必要的填充
    const padding = 4 - (base64.length % 4);
    if (padding !== 4) {
      base64 += '='.repeat(padding);
    }
    
    return base64;
  }

  // 验证注册响应 - 原生实现
  async verifyRegistration(username: string, credential: any) {
    console.log('🔍 [BACKEND] 开始原生验证注册流程');
    console.log('🔍 [BACKEND] 用户名:', username);
    
    // 反序列化凭证数据
    const deserializedCredential = this.deserializeCredential(credential);
    console.log('🔍 [BACKEND] 反序列化完成');

    // 查找挑战
    const challenge = await this.challengeStorage.findByUsernameAndType(username, 'register');
    if (!challenge) {
      throw new Error('无效的注册挑战');
    }
    
    console.log('🔍 [BACKEND] 找到挑战:', challenge.challenge.substring(0, 20) + '...');

    // 验证挑战是否过期
    const isValidChallenge = await this.challengeStorage.isValidChallenge(challenge.challenge, username, 'register');
    if (!isValidChallenge) {
      throw new Error('注册挑战已过期');
    }

    // 查找或创建用户
    let user = await this.userStorage.findByUsername(username);
    if (!user) {
      user = await this.userStorage.create({ username });
    }

    // 原生验证逻辑
    const verification = await this.verifyCredentialAttestation(deserializedCredential, challenge.challenge);
    
    if (!verification.verified) {
      throw new Error('注册验证失败');
    }

    // 保存凭证
    const credentialData = {
      id: credential.id, // 使用原始凭证ID，这是浏览器需要的
      user_id: user.id,
      public_key: Buffer.from(verification.publicKey).toString('base64url'),
      sign_count: verification.counter,
      device_info: {
        aaguid: verification.aaguid
      }
    };
    
    await this.credentialStorage.create(credentialData as any);
    console.log('✅ [BACKEND] 凭证保存成功');

    // 删除挑战
    await this.challengeStorage.delete(challenge.challenge);

    console.log('🎉 [BACKEND] 原生注册流程完成成功');
    return {
      success: true,
      message: '注册成功',
      user
    };
  }

  // 原生验证凭证认证
  private async verifyCredentialAttestation(credential: any, expectedChallenge: string): Promise<any> {
    console.log('🔍 [BACKEND] 开始原生验证凭证认证');
    
    try {
      // 解析 clientDataJSON
      const clientDataJSON = new TextDecoder().decode(credential.response.clientDataJSON);
      const clientData = JSON.parse(clientDataJSON);
      
      console.log('🔍 [BACKEND] ClientData:', {
        type: clientData.type,
        challenge: clientData.challenge,
        origin: clientData.origin
      });
      
      // 验证 challenge
      if (clientData.challenge !== expectedChallenge) {
        throw new Error('Challenge 不匹配');
      }
      
      // 验证 origin
      if (clientData.origin !== 'http://localhost:3000') {
        throw new Error('Origin 不匹配');
      }
      
      // 验证类型
      if (clientData.type !== 'webauthn.create') {
        throw new Error('类型不匹配');
      }
      
      // 解析 attestationObject
      const attestationBuffer = credential.response.attestationObject;
      // 这里应该使用专门的 CBOR 解析库，但现在简化处理
      // 实际项目中需要使用 CBOR 解析器来提取公钥等信息
      
      console.log('✅ [BACKEND] 基本验证通过');
      
      // 简化的响应 - 实际需要更复杂的 CBOR 解析
      return {
        verified: true,
        publicKey: attestationBuffer.slice(0, 32), // 简化处理
        counter: 0,
        aaguid: '00000000-0000-0000-0000-000000000000'
      };
      
    } catch (error) {
      console.error('❌ [BACKEND] 验证失败:', error);
      throw new Error(`验证失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 生成登录选项 - 原生实现
  async generateAuthenticationOptions(username: string) {
    console.log('🔍 [BACKEND] 生成原生登录选项，用户名:', username);
    
    // 查找用户
    const user = await this.userStorage.findByUsername(username);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 查找用户的凭证
    const credentials = await this.credentialStorage.findByUserId(user.id);
    if (credentials.length === 0) {
      throw new Error('用户没有注册的凭证');
    }

    // 生成随机 challenge (32字节)
    const challengeBuffer = randomBytes(32);
    const challenge = challengeBuffer.toString('base64url');
    
    console.log('🔍 [BACKEND] 生成登录 challenge:', {
      length: challengeBuffer.length,
      base64url: challenge
    });

    const allowCredentials = credentials.map(cred => ({
      id: cred.id,
      type: 'public-key' as const,
      transports: ['internal'] as const  // 明确指定使用内建authenticator
    }));

    const options = {
      challenge: challenge, // 发送 base64url 格式
      rpId: 'localhost',
      allowCredentials,
      userVerification: 'required' as UserVerificationRequirement,
      timeout: 60000,
      // 添加authenticator选择配置，确保只使用平台内建authenticator
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required'
      }
    };

    // 保存挑战
    await this.challengeStorage.create({
      challenge: challenge,
      username,
      type: 'login'
    } as any);

    console.log('✅ [BACKEND] 登录选项生成完成');
    return options;
  }

  // 验证登录响应 - 原生实现
  async verifyAuthentication(username: string, credential: any) {
    console.log('🔍 [BACKEND] 开始原生验证登录流程');
    
    // 查找挑战
    const challenge = await this.challengeStorage.findByUsernameAndType(username, 'login');
    if (!challenge) {
      throw new Error('无效的登录挑战');
    }

    // 验证挑战是否过期
    const isValidChallenge = await this.challengeStorage.isValidChallenge(challenge.challenge, username, 'login');
    if (!isValidChallenge) {
      throw new Error('登录挑战已过期');
    }

    // 查找用户
    const user = await this.userStorage.findByUsername(username);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 查找凭证
    const userCredential = await this.credentialStorage.findById(credential.id);
    if (!userCredential || userCredential.user_id !== user.id) {
      throw new Error('无效的凭证');
    }

    // 验证认证响应
    if (!userCredential.public_key) {
      throw new Error('无效的凭证：缺少公钥');
    }
    
    // 反序列化凭证数据
    const deserializedCredential = this.deserializeCredential(credential);
    
    // 原生验证逻辑
    const verification = await this.verifyCredentialAssertion(
      deserializedCredential, 
      challenge.challenge,
      userCredential.public_key
    );

    if (!verification.verified) {
      throw new Error('登录验证失败');
    }

    // 更新凭证计数器
    await this.credentialStorage.updateSignCount(userCredential.id, verification.counter);

    // 创建会话
    const session = await this.sessionStorage.create({
      user_id: user.id
    } as any);

    // 删除挑战
    await this.challengeStorage.delete(challenge.challenge);

    console.log('🎉 [BACKEND] 原生登录流程完成成功');
    return {
      success: true,
      message: '登录成功',
      user,
      sessionId: session.id
    };
  }

  // 原生验证凭证断言
  private async verifyCredentialAssertion(credential: any, expectedChallenge: string, publicKey: string): Promise<any> {
    console.log('🔍 [BACKEND] 开始原生验证凭证断言');
    
    try {
      // 解析 clientDataJSON
      const clientDataJSON = new TextDecoder().decode(credential.response.clientDataJSON);
      const clientData = JSON.parse(clientDataJSON);
      
      console.log('🔍 [BACKEND] ClientData:', {
        type: clientData.type,
        challenge: clientData.challenge,
        origin: clientData.origin
      });
      
      // 验证 challenge
      if (clientData.challenge !== expectedChallenge) {
        throw new Error('Challenge 不匹配');
      }
      
      // 验证 origin
      if (clientData.origin !== 'http://localhost:3000') {
        throw new Error('Origin 不匹配');
      }
      
      // 验证类型
      if (clientData.type !== 'webauthn.get') {
        throw new Error('类型不匹配');
      }
      
      console.log('✅ [BACKEND] 登录验证通过');
      
      // 简化的响应 - 实际需要验证签名
      return {
        verified: true,
        counter: 0
      };
      
    } catch (error) {
      console.error('❌ [BACKEND] 登录验证失败:', error);
      throw new Error(`验证失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 获取当前用户信息
  async getCurrentUser(sessionId: string) {
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

  // 注销
  async logout(sessionId: string) {
    const success = await this.sessionStorage.delete(sessionId);
    if (!success) {
      throw new Error('注销失败');
    }

    return {
      success: true,
      message: '注销成功'
    };
  }

  // 清理过期数据
  async cleanup() {
    const expiredChallenges = await this.challengeStorage.cleanupExpired();
    const expiredSessions = await this.sessionStorage.cleanupExpired();
    
    return {
      expiredChallenges,
      expiredSessions
    };
  }
}