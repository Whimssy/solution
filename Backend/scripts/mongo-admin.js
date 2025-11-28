#!/usr/bin/env node

require('dotenv').config();
const { spawn } = require('child_process');

// Set environment variables for mongo-express
// Explicitly set PORT to 8081 for mongo-express (override any existing PORT)
const env = {
  ...process.env,
  PORT: '8081', // Force port 8081 for mongo-express
  ME_CONFIG_MONGODB_URL: process.env.MONGODB_URI || 'mongodb://localhost:27017/mamafua',
  ME_CONFIG_SITE_SESSIONSECRET: process.env.ME_SESSION_SECRET || 'mamafua-session-secret-2024', // Note: no underscore between SESSION and SECRET
  ME_CONFIG_SITE_COOKIESECRET: process.env.ME_COOKIE_SECRET || 'mamafua-cookie-secret-2024',
};

// Use pnpm exec to run mongo-express, which will handle the path resolution correctly
const child = spawn('pnpm', ['exec', 'mongo-express'], {
  env,
  stdio: 'inherit',
  shell: true,
});

child.on('error', (err) => {
  console.error('Failed to start mongo-express:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

