import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    env: {
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      REDIS_URL: 'redis://localhost:6379',
      JWT_SECRET: 'test_jwt_secret_at_least_32_characters_long',
      JWT_REFRESH_SECRET: 'test_refresh_secret_at_least_32_characters',
      PLATFORM_ADMIN_JWT_SECRET: 'test_platform_admin_jwt_secret_32_chars_min',
      PLATFORM_ADMIN_JWT_REFRESH_SECRET: 'test_platform_admin_refresh_secret_32_chars_min',
      EVOLUTION_API_KEY: 'test_evolution_key',
      FRONTEND_URL: 'http://localhost:3000',
    },
  },
});
