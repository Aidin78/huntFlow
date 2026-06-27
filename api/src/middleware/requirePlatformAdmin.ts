import type { NextFunction, Request, Response } from 'express';

import { sendError } from '../lib/errors';
import { requireAuth } from './requireAuth';

export function requirePlatformAdmin(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.userRole !== 'PLATFORM_ADMIN') {
      sendError(res, 403, 'FORBIDDEN', 'Platform admin account required');
      return;
    }
    next();
  });
}
