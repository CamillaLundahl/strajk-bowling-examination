import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, './setupTests.js')],
    css: true,
    coverage: {
      exclude: [
        '**/__tests__/booking-test-utils.jsx',
        '**/mocks/**',
        '**/*.scss',
        '**/*.svg',
        '**/assets/**',
      ],
    },
  },
});
