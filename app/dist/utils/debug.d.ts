export declare class DebugUtils {
    static safeLogObject(obj: any, depth?: number, currentDepth?: number): any;
    static formatCredential(credential: any): any;
    static formatBinaryData(data: any): any;
    static validateCredential(credential: any): {
        valid: boolean;
        errors: string[];
    };
    static parseClientDataJSON(clientDataJSON: ArrayBuffer): any;
    static logWebAuthnFlow(step: string, data: any): void;
    static checkWebAuthnSupport(): {
        supported: boolean;
        details: any;
    };
}
//# sourceMappingURL=debug.d.ts.map