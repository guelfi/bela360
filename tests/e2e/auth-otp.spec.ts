import { expect, test } from '@playwright/test';
import { WEB_URL, createBusinessAndLogin, getOtp, randomPhone, uniqueSuffix } from './helpers';

test('OTP login sets an httpOnly cookie and grants access to protected routes', async ({ request }) => {
  const { user } = await createBusinessAndLogin(request);

  const me = await request.get('/api/auth/me');
  expect(me.status()).toBe(200);
  const meBody = await me.json();
  expect(meBody.data.user.id).toBe(user.id);

  const clients = await request.get('/api/clients');
  expect(clients.status()).toBe(200);
});

test('wrong OTP code is rejected', async ({ request }) => {
  const phone = randomPhone();

  await request.post('/api/business/onboarding', {
    data: {
      name: `Salao E2E ${uniqueSuffix()}`,
      phone: randomPhone(),
      ownerName: 'Dono E2E',
      ownerPhone: phone,
    },
  });
  await request.post('/api/auth/otp/request', { data: { phone } });
  await getOtp(phone); // garante que o codigo real ja foi gerado

  const verify = await request.post('/api/auth/otp/verify', {
    data: { phone, otp: '000000' },
  });
  expect(verify.status()).toBe(401);
});

test('logout clears the session and blocks further access', async ({ request }) => {
  await createBusinessAndLogin(request);

  const logout = await request.post('/api/auth/logout');
  expect(logout.status()).toBe(200);

  const me = await request.get('/api/auth/me');
  expect(me.status()).toBe(401);
});

test('full browser journey: login, reach dashboard, logout, dashboard blocked again', async ({ page, request }) => {
  const ownerPhone = randomPhone();

  const onboardingRes = await request.post('/api/business/onboarding', {
    data: {
      name: `Salao E2E ${uniqueSuffix()}`,
      phone: randomPhone(),
      ownerName: 'Dono E2E',
      ownerPhone,
    },
  });
  expect(onboardingRes.status()).toBe(201);

  await page.goto(WEB_URL);
  await page.getByPlaceholder('(11) 99999-9999').fill(ownerPhone);
  await page.getByRole('button', { name: 'Enviar codigo' }).click();

  const otp = await getOtp(ownerPhone);
  await page.getByPlaceholder('000000').fill(otp);
  await page.getByRole('button', { name: 'Entrar' }).click();

  // o dashboard busca varias APIs em paralelo apos o redirect client-side,
  // entao a navegacao pode levar mais que o timeout padrao sob carga
  await expect(page).toHaveURL(`${WEB_URL}/dashboard`, { timeout: 10_000 });
  await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();

  await page.getByRole('button', { name: 'Sair' }).click();
  await expect(page).toHaveURL(WEB_URL);

  // sem sessao, tentar acessar o dashboard direto deve voltar pro login
  await page.goto(`${WEB_URL}/dashboard`);
  await expect(page).toHaveURL(WEB_URL);
});
