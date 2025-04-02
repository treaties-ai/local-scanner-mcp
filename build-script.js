#!/usr/bin/env node
import { chmodSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  const indexJsPath = join(__dirname, 'build', 'index.js');
  console.log(`Setting executable permissions on ${indexJsPath}`);
  chmodSync(indexJsPath, 0o755);
  console.log('Permissions set successfully');
} catch (error) {
  console.error('Error setting permissions:', error);
  process.exit(1);
}
