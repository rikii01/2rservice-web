import type { Request, Response, NextFunction } from 'express';
/**
 * Middleware to restrict access to ADMIN role only.
 * Must be used AFTER authMiddleware.
 */
export declare function adminOnly(req: Request, res: Response, next: NextFunction): Promise<void>;
