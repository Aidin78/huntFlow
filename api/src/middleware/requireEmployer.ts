import type { NextFunction, Request, Response } from 'express';

import { UserRole } from '@huntflow/db';

import { sendError } from '../lib/errors';
import { requireAuth } from './requireAuth';

export function requireEmployer(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.userRole !== UserRole.EMPLOYER) {
      sendError(res, 403, 'FORBIDDEN', 'Employer account required');
      return;
    }
    next();
  });
}
