import { execSync } from 'child_process';
import { FullConfig } from '@playwright/test';
import path from 'path';

const projectRoot = path.resolve(__dirname, '..');

async function globalTeardown(config: FullConfig) {
  console.log('Tearing down test database...');
  execSync('npm run test:teardown', { cwd: projectRoot, stdio: 'inherit' });
  console.log('Database teardown complete.');
}

export default globalTeardown;