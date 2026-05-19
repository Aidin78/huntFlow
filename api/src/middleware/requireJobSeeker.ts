import type { NextFunction, Request, Response } from 'express';

import { UserRole } from '@huntflow/db';

import { sendError } from '../lib/errors';
import { requireAuth } from './requireAuth';

export function requireJobSeeker(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.userRole !== UserRole.JOB_SEEKER) {
      sendError(res, 403, 'FORBIDDEN', 'Job seeker account required');
      return;
    }
    next();
  });
}
