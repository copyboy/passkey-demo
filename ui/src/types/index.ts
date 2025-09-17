export interface User {
  id: string;
  username: string;
  created_at: string;
  updated_at: string;
  credentials?: Credential[];
}

export interface Credential {
  id: string;
  created_at: string;
}

export interface SerializedCredential {
  id: string;
  rawId: string;
  type: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
    transports: string[];
  };
  clientExtensionResults: any;
}

export interface RegisterRequest {
  username: string;
  credential: SerializedCredential;
}

export interface LoginRequest {
  username: string;
  credential: SerializedCredential;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  sessionId?: string;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export interface RegistrationOptions {
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
  pubKeyCredParams: Array<{
    type: string;
    alg: number;
  }>;
  timeout?: number;
  excludeCredentials?: Array<{
    id: string;
    type: string;
  }>;
  authenticatorSelection?: {
    authenticatorAttachment: string;
    userVerification: string;
    residentKey: string;
  };
  attestation: string;
}

export interface AuthenticationOptions {
  challenge: string;
  allowCredentials?: Array<{
    id: string;
    type: string;
    transports?: string[];
  }>;
  rpId: string;
  userVerification: string;
  timeout?: number;
  authenticatorSelection?: {
    authenticatorAttachment?: string;
    userVerification?: string;
  };
}