import { User, AttestationConveyancePreference, UserVerificationRequirement } from '../types';
export declare class AuthService {
    private userStorage;
    private credentialStorage;
    private challengeStorage;
    private sessionStorage;
    constructor();
    generateRegistrationOptions(username: string): Promise<{
        challenge: string;
        rp: {
            name: string;
            id: string;
        };
        user: {
            id: string;
            name: string;
            displayName: string;
        };
        pubKeyCredParams: {
            type: string;
            alg: number;
        }[];
        timeout: number;
        excludeCredentials: never[];
        authenticatorSelection: {
            authenticatorAttachment: string;
            userVerification: string;
            residentKey: string;
        };
        attestation: AttestationConveyancePreference;
    }>;
    private deserializeCredential;
    private base64ToArrayBuffer;
    private base64urlToBase64;
    verifyRegistration(username: string, credential: any): Promise<{
        success: boolean;
        message: string;
        user: User;
    }>;
    private verifyCredentialAttestation;
    generateAuthenticationOptions(username: string): Promise<{
        challenge: string;
        rpId: string;
        allowCredentials: {
            id: string;
            type: "public-key";
            transports: readonly ["internal"];
        }[];
        userVerification: UserVerificationRequirement;
        timeout: number;
        authenticatorSelection: {
            authenticatorAttachment: string;
            userVerification: string;
        };
    }>;
    verifyAuthentication(username: string, credential: any): Promise<{
        success: boolean;
        message: string;
        user: User;
        sessionId: string;
    }>;
    private verifyCredentialAssertion;
    getCurrentUser(sessionId: string): Promise<{
        credentials: {
            id: string;
            created_at: string;
        }[];
        id: string;
        username: string;
        created_at: string;
        updated_at: string;
    }>;
    logout(sessionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    cleanup(): Promise<{
        expiredChallenges: number;
        expiredSessions: number;
    }>;
}
//# sourceMappingURL=auth.d.ts.map