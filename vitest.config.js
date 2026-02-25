import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: [
      'tests/unit/**/*.test.js',
      'tests/integration/rulesTabs.test.js',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['assets/js/**/*.js'],
      exclude: ['assets/js/modules/backgroundSlider.js', 'assets/js/modules/particleBackground.js', 'assets/js/modules/typewriter.js'],
    },
  },
});
