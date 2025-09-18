export declare const config: {
    readonly server: {
        readonly port: number;
        readonly host: "0.0.0.0";
        readonly hostname: string;
    };
    readonly frontend: {
        readonly port: number;
        readonly hostname: string;
        readonly url: string;
    };
    readonly webauthn: {
        readonly rpId: string;
        readonly rpName: "Passkey Demo";
        readonly allowedOrigins: string[];
        readonly timeout: 60000;
    };
    readonly cors: {
        readonly origins: string[];
        readonly credentials: true;
    };
    readonly development: {
        readonly verbose: boolean;
        readonly debug: boolean;
    };
    readonly storage: {
        readonly dataDir: string;
        readonly cleanupInterval: number;
    };
};
export declare const getServerUrl: () => string;
export declare const getFrontendUrl: () => string;
export declare const getApiUrl: () => string;
//# sourceMappingURL=index.d.ts.map