import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
      '**/tests/**',  // Playwright test directories
      'packages/web/tests/**/*.spec.ts',  // Only exclude Playwright specs in web package
      '**/node_modules/**'  // Exclude all node_modules to prevent Next.js test conflicts
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'packages/*/dist/',
        'packages/web/**', // Exclude Next.js web app from coverage
        'packages/schema/**', // Exclude schema package (just type definitions)
        'packages/*/scripts/**', // Exclude build scripts
        '**/index.ts', // Exclude re-export index files
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.stories.*',
        '**/test-fixtures/**',
        '**/tests/**', // Exclude Playwright test directories
        '**/.next/**', // Exclude Next.js build artifacts
        '**/.storybook/**' // Exclude Storybook config
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90
      }
    }
  }
}); 