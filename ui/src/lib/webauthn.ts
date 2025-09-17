import { RegistrationOptions, AuthenticationOptions } from '../types';

export class WebAuthnService {
  static isSupported(): boolean {
    return typeof PublicKeyCredential !== 'undefined' && 
           typeof navigator !== 'undefined' && 
           typeof navigator.credentials !== 'undefined';
  }

  static checkSupport(): { supported: boolean; details: any } {
    const details: any = {};

    // 检查基本的 WebAuthn 支持
    details.webAuthnAvailable = typeof PublicKeyCredential !== 'undefined';
    
    // 检查具体方法
    details.navigatorCredentialsAvailable = typeof navigator !== 'undefined' && typeof navigator.credentials !== 'undefined';
    details.publicKeyAvailable = details.navigatorCredentialsAvailable && typeof PublicKeyCredential !== 'undefined';
    
    // 检查用户验证支持
    details.userVerificationAvailable = details.publicKeyAvailable && typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';
    
    // 检查设备凭证支持
    details.devicePublicKeyAvailable = details.publicKeyAvailable && typeof PublicKeyCredential.isConditionalMediationAvailable === 'function';

    return {
      supported: details.webAuthnAvailable && details.navigatorCredentialsAvailable,
      details
    };
  }

  static validateCredential(credential: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!credential) {
      errors.push('凭证对象为空');
      return { valid: false, errors };
    }

    if (!credential.id) {
      errors.push('缺少凭证 ID');
    }

    if (!credential.rawId) {
      errors.push('缺少 rawId');
    }

    if (!credential.type || credential.type !== 'public-key') {
      errors.push('无效的凭证类型');
    }

    if (!credential.response) {
      errors.push('缺少响应对象');
    } else {
      if (!credential.response.clientDataJSON) {
        errors.push('缺少 clientDataJSON');
      }

      if (!credential.response.attestationObject && !credential.response.authenticatorData) {
        errors.push('缺少 attestationObject 或 authenticatorData');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // 将 ArrayBuffer 转换为标准 base64 字符串
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    if (!buffer) {
      return '';
    }
    
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  
  // 使用原生 WebAuthn API 进行注册
  static async register(options: RegistrationOptions) {
    try {
      console.log('🔐 [WEBAUTHN] 开始原生注册');
      
      // 详细分析输入数据格式
      console.log('🔍 [WEBAUTHN] ===== 输入数据分析 =====');
      console.log('🔍 [WEBAUTHN] Challenge 格式分析:', {
        value: options.challenge,
        length: options.challenge.length,
        type: typeof options.challenge,
        prefix: options.challenge.substring(0, 20),
        hasUnderscore: options.challenge.includes('_'),
        hasMinus: options.challenge.includes('-'),
        hasPlus: options.challenge.includes('+'),
        hasSlash: options.challenge.includes('/')
      });
      
      console.log('🔍 [WEBAUTHN] User ID 格式分析:', {
        value: options.user.id,
        length: options.user.id.length,
        type: typeof options.user.id,
        prefix: options.user.id.substring(0, 20),
        hasUnderscore: options.user.id.includes('_'),
        hasMinus: options.user.id.includes('-'),
        hasPlus: options.user.id.includes('+'),
        hasSlash: options.user.id.includes('/')
      });
      
      // 验证和转换 challenge
      let challengeBuffer: ArrayBuffer;
      try {
        challengeBuffer = this.base64ToArrayBuffer(options.challenge);
        console.log('✅ [WEBAUTHN] Challenge 转换成功，长度:', challengeBuffer.byteLength);
      } catch (error) {
        console.error('❌ [WEBAUTHN] Challenge 转换失败:', error);
        throw new Error(`Invalid challenge format: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // 验证和转换 user.id
      let userIdBuffer: ArrayBuffer;
      try {
        userIdBuffer = this.base64ToArrayBuffer(options.user.id);
        console.log('✅ [WEBAUTHN] User ID 转换成功，长度:', userIdBuffer.byteLength);
      } catch (error) {
        console.error('❌ [WEBAUTHN] User ID 转换失败:', error);
        throw new Error(`Invalid user ID format: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // 构建原生 PublicKeyCredentialCreationOptions
      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        challenge: challengeBuffer,
        rp: options.rp,
        user: {
          id: userIdBuffer,
          name: options.user.name,
          displayName: options.user.displayName
        },
        pubKeyCredParams: options.pubKeyCredParams,
        timeout: options.timeout,
        excludeCredentials: options.excludeCredentials?.map(cred => ({
          id: this.base64ToArrayBuffer(cred.id),
          type: cred.type
        })),
        authenticatorSelection: options.authenticatorSelection,
        attestation: options.attestation as AttestationConveyancePreference
      };

      console.log('🔐 [WEBAUTHN] 调用原生 navigator.credentials.create...');
      const credential = await navigator.credentials.create({ publicKey: publicKeyOptions }) as PublicKeyCredential;
      
      console.log('✅ [WEBAUTHN] 原生注册成功');
      console.log('🔐 [WEBAUTHN] 凭证 ID:', credential.id);
      console.log('🔐 [WEBAUTHN] 凭证类型:', credential.type);
      console.log('🔐 [WEBAUTHN] rawId 长度:', credential.rawId.byteLength);
      
      // 序列化为可传输的格式
      const serialized = this.serializeNativeCredential(credential);
      console.log('✅ [WEBAUTHN] 序列化完成');
      
      return serialized;
    } catch (error) {
      console.error('❌ [WEBAUTHN] 原生注册错误:', error);
      console.error('❌ [WEBAUTHN] 错误类型:', error.constructor.name);
      console.error('❌ [WEBAUTHN] 错误消息:', error instanceof Error ? error.message : 'Unknown error');
      
      if (error instanceof DOMException) {
        console.error('❌ [WEBAUTHN] DOMException 详情:', {
          name: error.name,
          message: error.message,
          code: error.code
        });
      }
      
      throw new Error(`注册失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 使用原生 WebAuthn API 进行认证
  static async authenticate(options: AuthenticationOptions) {
    try {
      console.log('🔐 [WEBAUTHN] 开始原生认证');
      
      // 构建原生 PublicKeyCredentialRequestOptions
      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        challenge: this.base64ToArrayBuffer(options.challenge),
        rpId: options.rpId,
        allowCredentials: options.allowCredentials?.map(cred => ({
          id: this.base64ToArrayBuffer(cred.id),
          type: cred.type,
          transports: cred.transports as AuthenticatorTransport[]
        })),
        userVerification: options.userVerification as UserVerificationRequirement,
        timeout: options.timeout
      };

      console.log('🔐 [WEBAUTHN] 登录选项:', {
        challenge: '***',
        rpId: publicKeyOptions.rpId,
        allowCredentialsCount: publicKeyOptions.allowCredentials?.length || 0,
        userVerification: publicKeyOptions.userVerification,
        timeout: publicKeyOptions.timeout,
        credentialTransports: publicKeyOptions.allowCredentials?.map(c => c.transports).flat()
      });

      console.log('🔐 [WEBAUTHN] 调用原生 navigator.credentials.get...');
      const credential = await navigator.credentials.get({ publicKey: publicKeyOptions }) as PublicKeyCredential;
      
      console.log('🔐 [WEBAUTHN] 原生认证成功');
      console.log('🔐 [WEBAUTHN] 凭证 ID:', credential.id);
      
      // 序列化为可传输的格式
      const serialized = this.serializeNativeCredential(credential);
      
      return serialized;
    } catch (error) {
      console.error('❌ [WEBAUTHN] 原生认证错误:', error);
      throw new Error('登录失败，请重试');
    }
  }

  // 序列化原生 WebAuthn 凭证
  private static serializeNativeCredential(credential: PublicKeyCredential): any {
    const response = credential.response as AuthenticatorAttestationResponse | AuthenticatorAssertionResponse;
    
    console.log('🔐 [WEBAUTHN] 开始序列化原生凭证...');
    
    const serialized = {
      id: credential.id,
      rawId: this.arrayBufferToBase64(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: this.arrayBufferToBase64(response.clientDataJSON),
        authenticatorData: 'authenticatorData' in response ? this.arrayBufferToBase64(response.authenticatorData) : undefined,
        signature: 'signature' in response ? this.arrayBufferToBase64(response.signature) : undefined,
        userHandle: 'userHandle' in response && response.userHandle ? this.arrayBufferToBase64(response.userHandle) : undefined,
        attestationObject: 'attestationObject' in response ? this.arrayBufferToBase64((response as AuthenticatorAttestationResponse).attestationObject) : undefined
      },
      clientExtensionResults: credential.getClientExtensionResults(),
      authenticatorAttachment: credential.authenticatorAttachment
    };

    // 清理 undefined 字段
    Object.keys(serialized.response).forEach(key => {
      if (serialized.response[key] === undefined) {
        delete serialized.response[key];
      }
    });

    console.log('🔐 [WEBAUTHN] 原生序列化完成');
    return serialized;
  }

  // 健壮的 base64 转 ArrayBuffer - 支持多种格式
  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    if (!base64 || typeof base64 !== 'string') {
      throw new Error(`Invalid base64 input: ${typeof base64}`);
    }

    console.log('🔧 [WEBAUTHN] 处理 base64 输入:', {
      length: base64.length,
      prefix: base64.substring(0, 20),
      hasUnderscore: base64.includes('_'),
      hasMinus: base64.includes('-'),
      hasPlus: base64.includes('+'),
      hasSlash: base64.includes('/'),
      hasEquals: base64.includes('=')
    });

    // 清理和标准化 base64 字符串
    let cleanBase64 = base64.trim();
    
    // 检测并转换 base64url 格式
    if (cleanBase64.includes('_') || cleanBase64.includes('-')) {
      console.log('🔧 [WEBAUTHN] 检测到 base64url 格式，转换为标准 base64');
      cleanBase64 = cleanBase64
        .replace(/_/g, '/')  // _ -> /
        .replace(/-/g, '+');  // - -> +
    }

    // 移除所有空白字符
    cleanBase64 = cleanBase64.replace(/\s/g, '');

    // 添加必要的填充
    const paddingNeeded = (4 - (cleanBase64.length % 4)) % 4;
    if (paddingNeeded > 0) {
      console.log(`🔧 [WEBAUTHN] 添加 ${paddingNeeded} 个填充字符`);
      cleanBase64 += '='.repeat(paddingNeeded);
    }

    // 验证 base64 格式
    if (!this.isValidBase64(cleanBase64)) {
      console.error('❌ [WEBAUTHN] 无效的 base64 格式:', cleanBase64.substring(0, 50));
      throw new Error('Invalid base64 format');
    }

    try {
      const binaryString = atob(cleanBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      console.log('✅ [WEBAUTHN] base64 转换成功，长度:', bytes.length);
      return bytes.buffer;
    } catch (error) {
      console.error('❌ [WEBAUTHN] atob() 转换失败:', error);
      console.error('❌ [WEBAUTHN] 输入字符串:', cleanBase64);
      throw new Error(`Base64 decoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 验证 base64 格式
  private static isValidBase64(str: string): boolean {
    // 标准 base64 正则：A-Z, a-z, 0-9, +, /, =
    const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
    return base64Regex.test(str) && str.length > 0;
  }

  // ArrayBuffer 转 base64
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    if (!buffer) {
      return '';
    }

    try {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch (error) {
      console.error('❌ [WEBAUTHN] btoa() 转换失败:', error);
      throw new Error(`Base64 encoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}