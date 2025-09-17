export interface User {
    id: string;
    username: string;
    created_at: string;
    updated_at: string;
}
export interface Credential {
    id: string;
    user_id: string;
    public_key: string;
    sign_count: number;
    device_info?: {
        aaguid?: string;
        device_type?: string;
    };
    created_at: string;
    updated_at: string;
}
export interface Challenge {
    challenge: string;
    username: string;
    type: 'register' | 'login';
    created_at: string;
    expires_at: string;
}
export interface Session {
    id: string;
    user_id: string;
    created_at: string;
    expires_at: string;
}
export interface RegisterRequest {
    username: string;
    credential: any;
}
export interface LoginRequest {
    username: string;
    credential: any;
}
export interface AuthResponse {
    success: boolean;
    message: string;
    user?: User;
}
export interface ErrorResponse {
    error: {
        code: string;
        message: string;
    };
}
export type AttestationConveyancePreference = 'none' | 'indirect' | 'direct' | 'enterprise';
export type UserVerificationRequirement = 'required' | 'preferred' | 'discouraged';
export interface AuthenticatorSelectionCriteria {
    authenticatorAttachment?: 'platform' | 'cross-platform';
    requireResidentKey?: boolean;
    residentKey?: 'required' | 'preferred' | 'discouraged';
    userVerification?: UserVerificationRequirement;
}
export interface PublicKeyCredentialParameters {
    type: 'public-key';
    alg: number;
}
export interface PublicKeyCredentialCreationOptions {
    challenge: Buffer;
    rp: {
        name: string;
        id: string;
    };
    user: {
        id: Buffer;
        name: string;
        displayName: string;
    };
    pubKeyCredParams: PublicKeyCredentialParameters[];
    timeout?: number;
    excludeCredentials?: Array<{
        id: Buffer;
        type: 'public-key';
    }>;
    authenticatorSelection?: AuthenticatorSelectionCriteria;
    attestation?: AttestationConveyancePreference;
}
export interface PublicKeyCredentialRequestOptions {
    challenge: Buffer;
    rpId: string;
    allowCredentials?: Array<{
        id: Buffer;
        type: 'public-key';
    }>;
    userVerification?: UserVerificationRequirement;
    timeout?: number;
}
//# sourceMappingURL=index.d.ts.map