// Simple ES module wrapper to run the server with tsx
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting server with tsx...');

// Use tsx to run the TypeScript server
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development'
  }
});

serverProcess.on('error', (err) => {
  console.error('Failed to start server process:', err);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code || 0);
});

// Handle shutdown signals
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  serverProcess.kill('SIGTERM');
});