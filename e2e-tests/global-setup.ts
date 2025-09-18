import { execSync } from 'child_process';
import { FullConfig } from '@playwright/test';
import path from 'path';

const projectRoot = path.resolve(__dirname, '..');

async function globalSetup(config: FullConfig) {
  console.log('Seeding test database...');
  execSync('npm run test:seed', { cwd: projectRoot, stdio: 'inherit' });
  console.log('Database seeded.');
}

export default globalSetup;