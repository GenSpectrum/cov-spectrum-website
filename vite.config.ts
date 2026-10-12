import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

function defineEnv(mode: string) {
  const env = loadEnv(mode, process.cwd(), '');
  const nodeEnv = mode === 'production' ? 'production' : 'development';
  const names = [
    'REACT_APP_IS_TESTING',
    'REACT_APP_IS_VERCEL_DEPLOYMENT',
    'REACT_APP_LAPIS_ACCESS_KEY',
    'REACT_APP_LAPIS_HOST',
    'REACT_APP_PPRETTY_HOST',
    'REACT_APP_SERVER_HOST',
    'REACT_APP_WEBSITE_HOST',
  ];

  return Object.fromEntries([
    ['process.env.NODE_ENV', JSON.stringify(nodeEnv)],
    ...names.map(name => [`process.env.${name}`, JSON.stringify(env[name] ?? '')]),
  ]);
}

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: defineEnv(mode),
  build: {
    outDir: 'build',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    include: ['src/**/*.test.{ts,tsx}', 'src/**/*.tests.{ts,tsx}'],
    pool: 'threads',
    testTimeout: 10_000,
  },
}));
