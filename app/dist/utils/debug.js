"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugUtils = void 0;
class DebugUtils {
    static safeLogObject(obj, depth = 3, currentDepth = 0) {
        if (currentDepth >= depth)
            return '[Max depth reached]';
        if (obj === null)
            return null;
        if (obj === undefined)
            return undefined;
        if (typeof obj !== 'object')
            return obj;
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
        if (Array.isArray(obj)) {
            return obj.map(item => this.safeLogObject(item, depth, currentDepth + 1));
        }
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            try {
                result[key] = this.safeLogObject(value, depth, currentDepth + 1);
            }
            catch (error) {
                result[key] = `[Error logging: ${error instanceof Error ? error.message : 'Unknown error'}]`;
            }
        }
        return result;
    }
    static formatCredential(credential) {
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
    static formatBinaryData(data) {
        if (!data)
            return null;
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
    static validateCredential(credential) {
        const errors = [];
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
        }
        else {
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
    static parseClientDataJSON(clientDataJSON) {
        try {
            const decoder = new TextDecoder('utf-8');
            const jsonStr = decoder.decode(clientDataJSON);
            return JSON.parse(jsonStr);
        }
        catch (error) {
            console.error('解析 clientDataJSON 失败:', error);
            return null;
        }
    }
    static logWebAuthnFlow(step, data) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            step,
            data: this.safeLogObject(data, 2)
        };
        console.log(`🔐 [WEBAUTHN_FLOW] ${step}:`, JSON.stringify(logEntry, null, 2));
    }
    static checkWebAuthnSupport() {
        const details = {};
        details.webAuthnAvailable = typeof global.PublicKeyCredential !== 'undefined';
        details.navigatorCredentialsAvailable = typeof global.navigator !== 'undefined' && typeof global.navigator?.credentials !== 'undefined';
        details.publicKeyAvailable = details.navigatorCredentialsAvailable && typeof global.PublicKeyCredential !== 'undefined';
        details.userVerificationAvailable = details.publicKeyAvailable && typeof global.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable === 'function';
        details.devicePublicKeyAvailable = details.publicKeyAvailable && typeof global.PublicKeyCredential?.isConditionalMediationAvailable === 'function';
        return {
            supported: details.webAuthnAvailable && details.navigatorCredentialsAvailable,
            details
        };
    }
}
exports.DebugUtils = DebugUtils;
//# sourceMappingURL=debug.js.map