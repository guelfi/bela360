import { expect, test, request as pwRequest } from '@playwright/test';
import { API_URL, createBusinessAndLogin, randomPhone } from './helpers';

test.describe('Clients API', () => {
  test('creates, lists, updates and deletes a client (happy path)', async ({ request }) => {
    await createBusinessAndLogin(request);

    const create = await request.post('/api/clients', {
      data: { name: 'Maria E2E', phone: randomPhone() },
    });
    expect(create.status()).toBe(201);
    const client = (await create.json()).data;

    const list = await request.get('/api/clients');
    expect(list.status()).toBe(200);
    const listBody = await list.json();
    expect(listBody.data.some((c: { id: string }) => c.id === client.id)).toBe(true);

    const getOne = await request.get(`/api/clients/${client.id}`);
    expect(getOne.status()).toBe(200);

    const update = await request.put(`/api/clients/${client.id}`, {
      data: { name: 'Maria Atualizada' },
    });
    expect(update.status()).toBe(200);
    expect((await update.json()).data.name).toBe('Maria Atualizada');

    const del = await request.delete(`/api/clients/${client.id}`);
    expect(del.status()).toBe(200);

    const getAfterDelete = await request.get(`/api/clients/${client.id}`);
    expect(getAfterDelete.status()).toBe(404);
  });

  test('rejects a client with an invalid phone with 400', async ({ request }) => {
    await createBusinessAndLogin(request);

    const res = await request.post('/api/clients', { data: { name: 'Maria', phone: '123' } });
    expect(res.status()).toBe(400);
  });

  test('cannot read or edit a client belonging to another business (IDOR)', async ({ request }) => {
    await createBusinessAndLogin(request);
    const create = await request.post('/api/clients', {
      data: { name: 'Maria E2E', phone: randomPhone() },
    });
    const client = (await create.json()).data;

    const otherBusiness = await pwRequest.newContext({ baseURL: API_URL });
    await createBusinessAndLogin(otherBusiness);

    const getForeign = await otherBusiness.get(`/api/clients/${client.id}`);
    expect(getForeign.status()).toBe(404);

    const updateForeign = await otherBusiness.put(`/api/clients/${client.id}`, {
      data: { name: 'Hackeado' },
    });
    expect(updateForeign.status()).toBe(404);

    const deleteForeign = await otherBusiness.delete(`/api/clients/${client.id}`);
    expect(deleteForeign.status()).toBe(404);

    await otherBusiness.dispose();
  });
});
