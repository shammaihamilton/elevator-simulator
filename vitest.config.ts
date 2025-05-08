import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        'test{,s}/**',
        '**/*.test.{ts,tsx}',
        '**/__tests__/**',
      ],
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
  },
});