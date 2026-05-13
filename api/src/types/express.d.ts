export {};

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      userRole?: 'JOB_SEEKER' | 'EMPLOYER';
    }
  }
}
