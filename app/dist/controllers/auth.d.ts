import { Request, Response } from 'express';
export declare class AuthController {
    private authService;
    constructor();
    getRegistrationChallenge: (req: Request, res: Response) => Promise<void>;
    verifyRegistration: (req: Request, res: Response) => Promise<void>;
    getLoginChallenge: (req: Request, res: Response) => Promise<void>;
    verifyLogin: (req: Request, res: Response) => Promise<void>;
    logout: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=auth.d.ts.map