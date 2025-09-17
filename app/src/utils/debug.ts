/**
 * 调试工具函数
 * 用于 WebAuthn 开发和故障排除
 */

export class DebugUtils {
  /**
   * 安全地记录对象结构，避免循环引用
   */
  static safeLogObject(obj: any, depth: number = 3, currentDepth: number = 0): any {
    if (currentDepth >= depth) return '[Max depth reached]';
    if (obj === null) return null;
    if (obj === undefined) return undefined;
    
    // 处理基本类型
    if (typeof obj !== 'object') return obj;
    
    // 处理二进制数据
    if (obj instanceof ArrayBuffer) {
      return {
        type: 'ArrayBuffer',
        byteLength: obj.byteLength,
        preview: Array.from(new Uint8Array(obj.slice(0, 16))).join(' ') + (obj.byteLength > 16 ? '...' : '')
      };
    }
    
    if (obj instanceof Uint8Array) {
      return {
        type: 'Uint8Array',
        length: obj.length,
        preview: Array.from(obj.slice(0, 16)).join(' ') + (obj.length > 16 ? '...' : '')
      };
    }
    
    if (obj instanceof Buffer) {
      return {
        type: 'Buffer',
        length: obj.length,
        preview: obj.toString('hex').substring(0, 32) + (obj.length > 16 ? '...' : '')
      };
    }
    
    // 处理数组
    if (Array.isArray(obj)) {
      return obj.map(item => this.safeLogObject(item, depth, currentDepth + 1));
    }
    
    // 处理普通对象
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      try {
        result[key] = this.safeLogObject(value, depth, currentDepth + 1);
      } catch (error) {
        result[key] = `[Error logging: ${error instanceof Error ? error.message : 'Unknown error'}]`;
      }
    }
    
    return result;
  }

  /**
   * 格式化 WebAuthn 凭证对象用于调试
   */
  static formatCredential(credential: any): any {
    return {
      id: credential.id,
      rawId: this.formatBinaryData(credential.rawId),
      type: credential.type,
      response: credential.response ? {
        clientDataJSON: this.formatBinaryData(credential.response.clientDataJSON),
        attestationObject: this.formatBinaryData(credential.response.attestationObject),
        transports: credential.response.transports || []
      } : null,
      clientExtensionResults: credential.clientExtensionResults,
      authenticatorAttachment: credential.authenticatorAttachment,
      getType: () => credential.getType?.()
    };
  }

  /**
   * 格式化二进制数据
   */
  static formatBinaryData(data: any): any {
    if (!data) return null;
    
    if (typeof data === 'string') {
      return {
        type: 'string',
        length: data.length,
        preview: data.substring(0, 100) + (data.length > 100 ? '...' : '')
      };
    }
    
    if (data instanceof ArrayBuffer) {
      const bytes = new Uint8Array(data);
      return {
        type: 'ArrayBuffer',
        byteLength: data.byteLength,
        hex: Array.from(bytes.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' ') + (data.byteLength > 8 ? '...' : ''),
        base64: btoa(String.fromCharCode(...Array.from(bytes.slice(0, 8)))) + (data.byteLength > 8 ? '...' : '')
      };
    }
    
    if (data instanceof Uint8Array) {
      return {
        type: 'Uint8Array',
        length: data.length,
        hex: Array.from(data.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' ') + (data.length > 8 ? '...' : ''),
        preview: Array.from(data.slice(0, 16)).join(' ') + (data.length > 16 ? '...' : '')
      };
    }
    
    return {
      type: typeof data,
      value: data
    };
  }

  /**
   * 验证 WebAuthn 凭证结构
   */
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

      if (!credential.response.attestationObject) {
        errors.push('缺少 attestationObject');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 解析 clientDataJSON
   */
  static parseClientDataJSON(clientDataJSON: ArrayBuffer): any {
    try {
      const decoder = new TextDecoder('utf-8');
      const jsonStr = decoder.decode(clientDataJSON);
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('解析 clientDataJSON 失败:', error);
      return null;
    }
  }

  /**
   * 记录完整的 WebAuthn 流程
   */
  static logWebAuthnFlow(step: string, data: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      step,
      data: this.safeLogObject(data, 2)
    };
    
    console.log(`🔐 [WEBAUTHN_FLOW] ${step}:`, JSON.stringify(logEntry, null, 2));
  }

  /**
   * 检查浏览器 WebAuthn 支持
   */
  static checkWebAuthnSupport(): { supported: boolean; details: any } {
    const details: any = {};

    // 检查基本的 WebAuthn 支持
    details.webAuthnAvailable = typeof (global as any).PublicKeyCredential !== 'undefined';
    
    // 检查具体方法
    details.navigatorCredentialsAvailable = typeof (global as any).navigator !== 'undefined' && typeof (global as any).navigator?.credentials !== 'undefined';
    details.publicKeyAvailable = details.navigatorCredentialsAvailable && typeof (global as any).PublicKeyCredential !== 'undefined';
    
    // 检查用户验证支持
    details.userVerificationAvailable = details.publicKeyAvailable && typeof (global as any).PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable === 'function';
    
    // 检查设备凭证支持
    details.devicePublicKeyAvailable = details.publicKeyAvailable && typeof (global as any).PublicKeyCredential?.isConditionalMediationAvailable === 'function';

    return {
      supported: details.webAuthnAvailable && details.navigatorCredentialsAvailable,
      details
    };
  }
}