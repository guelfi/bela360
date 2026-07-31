import { expect, test, request as pwRequest } from '@playwright/test';
import { API_URL, createBusinessAndLogin } from './helpers';

test.describe('Services API', () => {
  test('creates, lists, updates and soft-deletes a service (happy path)', async ({ request }) => {
    await createBusinessAndLogin(request);

    const create = await request.post('/api/services', {
      data: { name: `Corte E2E ${Date.now()}`, duration: 45, price: 60 },
    });
    expect(create.status()).toBe(201);
    const service = (await create.json()).data;

    const list = await request.get('/api/services');
    expect(list.status()).toBe(200);
    const listBody = await list.json();
    expect(listBody.data.some((s: { id: string }) => s.id === service.id)).toBe(true);

    const update = await request.put(`/api/services/${service.id}`, { data: { price: 75 } });
    expect(update.status()).toBe(200);
    expect((await update.json()).data.price).toBe('75');

    const del = await request.delete(`/api/services/${service.id}`);
    expect(del.status()).toBe(200);

    // soft delete: continua existindo mas nao aparece na listagem de ativos
    const listAfterDelete = await request.get('/api/services?active=true');
    const activeIds = (await listAfterDelete.json()).data.map((s: { id: string }) => s.id);
    expect(activeIds).not.toContain(service.id);
  });

  test('rejects a service with a negative price with 400', async ({ request }) => {
    await createBusinessAndLogin(request);

    const res = await request.post('/api/services', {
      data: { name: 'Servico Invalido', duration: 30, price: -10 },
    });
    expect(res.status()).toBe(400);
  });

  test('rejects a duplicate service name in the same business with 409', async ({ request }) => {
    await createBusinessAndLogin(request);
    const name = `Corte Unico ${Date.now()}`;

    const first = await request.post('/api/services', { data: { name, duration: 30, price: 50 } });
    expect(first.status()).toBe(201);

    const second = await request.post('/api/services', { data: { name, duration: 30, price: 50 } });
    expect(second.status()).toBe(409);
  });

  test('cannot read or edit a service belonging to another business (IDOR)', async ({ request }) => {
    await createBusinessAndLogin(request);
    const create = await request.post('/api/services', {
      data: { name: `Corte E2E ${Date.now()}`, duration: 30, price: 50 },
    });
    const service = (await create.json()).data;

    const otherBusiness = await pwRequest.newContext({ baseURL: API_URL });
    await createBusinessAndLogin(otherBusiness);

    const getForeign = await otherBusiness.get(`/api/services/${service.id}`);
    expect(getForeign.status()).toBe(404);

    const updateForeign = await otherBusiness.put(`/api/services/${service.id}`, {
      data: { price: 1 },
    });
    expect(updateForeign.status()).toBe(404);

    await otherBusiness.dispose();
  });
});
