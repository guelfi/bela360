import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'line',
  use: {
    // A maioria dos specs usa a fixture "request" (API direta, mais
    // rapida e sem header Origin - o middleware de CSRF do backend so
    // exige Origin em requisicoes vindas de um browser real). O unico
    // teste baseado em pagina real usa WEB_URL explicitamente (porta e
    // prefixo diferentes da API no stack local via docker-compose.yml).
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:3001',
    trace: 'retain-on-failure',
  },
});
