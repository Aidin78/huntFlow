import path from 'path';
import dotenv from 'dotenv';

const repoRoot = path.resolve(__dirname, '../../..');
dotenv.config({ path: path.join(repoRoot, '.env') });
dotenv.config({ path: path.join(repoRoot, '.env.local'), override: true });

const defaultTestDb =
  'postgresql://huntflow:huntflow@localhost:5433/huntflow_test?schema=public';

process.env.DATABASE_URL = process.env.DATABASE_URL_TEST?.trim() || defaultTestDb;
process.env.JWT_SECRET =
  process.env.JWT_SECRET?.trim() || 'test-jwt-secret-min-16-chars';
process.env.UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(repoRoot, 'api', 'uploads-test');
