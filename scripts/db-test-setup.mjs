import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const testDbUrl =
  process.env.DATABASE_URL_TEST ||
  'postgresql://huntflow:huntflow@localhost:5433/huntflow_test?schema=public';

console.log('Setting up huntflow_test database...');

try {
  execSync(
    'docker compose exec -T postgres psql -U huntflow -d huntflow -c "CREATE DATABASE huntflow_test;"',
    { cwd: repoRoot, stdio: 'pipe' },
  );
  console.log('Created huntflow_test database.');
} catch {
  console.log('huntflow_test already exists (or docker not running — ensure Postgres is up).');
}

execSync('npm --workspace @huntflow/db exec prisma db push --force-reset --accept-data-loss', {
  cwd: repoRoot,
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: testDbUrl },
});

console.log('Test database schema synced.');
