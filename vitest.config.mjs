import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.mjs'],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.mjs', 'research/**/src/*.mjs'],
      exclude: ['node_modules/', 'tests/'],
    },
  },
});
