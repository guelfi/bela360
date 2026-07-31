import { expect, test, request as pwRequest } from '@playwright/test';
import { API_URL, createBusinessAndLogin, randomPhone } from './helpers';

function futureIso(hoursFromNow: number): string {
  const date = new Date();
  date.setHours(date.getHours() + hoursFromNow, 0, 0, 0);
  return date.toISOString();
}

test.describe('Appointments API', () => {
  test('creates, confirms, completes an appointment (happy path)', async ({ request }) => {
    const { user } = await createBusinessAndLogin(request);

    const client = (
      await (await request.post('/api/clients', { data: { name: 'Cliente E2E', phone: randomPhone() } })).json()
    ).data;
    const service = (
      await (
        await request.post('/api/services', { data: { name: `Servico E2E ${Date.now()}`, duration: 30, price: 50 } })
      ).json()
    ).data;

    const create = await request.post('/api/appointments', {
      data: {
        clientId: client.id,
        professionalId: user.id,
        serviceId: service.id,
        startTime: futureIso(48),
      },
    });
    expect(create.status()).toBe(201);
    const appointment = (await create.json()).data;
    expect(appointment.status).toBe('PENDING');

    const confirm = await request.post(`/api/appointments/${appointment.id}/confirm`);
    expect(confirm.status()).toBe(200);
    expect((await confirm.json()).data.status).toBe('CONFIRMED');

    const complete = await request.post(`/api/appointments/${appointment.id}/complete`);
    expect(complete.status()).toBe(200);
    expect((await complete.json()).data.status).toBe('COMPLETED');
  });

  test('rejects an appointment with an invalid clientId with 400', async ({ request }) => {
    const { user } = await createBusinessAndLogin(request);
    const service = (
      await (
        await request.post('/api/services', { data: { name: `Servico E2E ${Date.now()}`, duration: 30, price: 50 } })
      ).json()
    ).data;

    const res = await request.post('/api/appointments', {
      data: {
        clientId: 'not-a-cuid',
        professionalId: user.id,
        serviceId: service.id,
        startTime: futureIso(48),
      },
    });
    expect(res.status()).toBe(400);
  });

  test('rejects a second appointment that overlaps the same professional with 409', async ({ request }) => {
    const { user } = await createBusinessAndLogin(request);
    const client = (
      await (await request.post('/api/clients', { data: { name: 'Cliente E2E', phone: randomPhone() } })).json()
    ).data;
    const service = (
      await (
        await request.post('/api/services', { data: { name: `Servico E2E ${Date.now()}`, duration: 30, price: 50 } })
      ).json()
    ).data;

    const startTime = futureIso(72);
    const first = await request.post('/api/appointments', {
      data: { clientId: client.id, professionalId: user.id, serviceId: service.id, startTime },
    });
    expect(first.status()).toBe(201);

    const second = await request.post('/api/appointments', {
      data: { clientId: client.id, professionalId: user.id, serviceId: service.id, startTime },
    });
    expect(second.status()).toBe(409);
  });

  test('cannot read, confirm or cancel an appointment belonging to another business (IDOR)', async ({ request }) => {
    const { user } = await createBusinessAndLogin(request);
    const client = (
      await (await request.post('/api/clients', { data: { name: 'Cliente E2E', phone: randomPhone() } })).json()
    ).data;
    const service = (
      await (
        await request.post('/api/services', { data: { name: `Servico E2E ${Date.now()}`, duration: 30, price: 50 } })
      ).json()
    ).data;
    const appointment = (
      await (
        await request.post('/api/appointments', {
          data: { clientId: client.id, professionalId: user.id, serviceId: service.id, startTime: futureIso(96) },
        })
      ).json()
    ).data;

    const otherBusiness = await pwRequest.newContext({ baseURL: API_URL });
    await createBusinessAndLogin(otherBusiness);

    const getForeign = await otherBusiness.get(`/api/appointments/${appointment.id}`);
    expect(getForeign.status()).toBe(404);

    const confirmForeign = await otherBusiness.post(`/api/appointments/${appointment.id}/confirm`);
    expect(confirmForeign.status()).toBe(404);

    const cancelForeign = await otherBusiness.post(`/api/appointments/${appointment.id}/cancel`);
    expect(cancelForeign.status()).toBe(404);

    await otherBusiness.dispose();
  });
});
