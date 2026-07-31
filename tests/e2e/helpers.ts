import type { APIRequestContext } from '@playwright/test';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: 3,
});

export const WEB_URL = process.env.WEB_URL || 'http://127.0.0.1:3000/bela360';
export const API_URL = process.env.BASE_URL || 'http://127.0.0.1:3001';

export function randomPhone(): string {
  return '11' + Math.floor(100_000_000 + Math.random() * 899_999_999).toString();
}

// Sufixo unico por chamada (nao so por timestamp) para evitar colisao de
// slug quando testes rodam em paralelo e caem no mesmo milissegundo.
export function uniqueSuffix(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// O backend guarda o codigo em texto puro no Redis (fallback documentado
// "para verificacao manual durante testes") - e como os testes E2E leem
// o codigo real enviado, sem depender do WhatsApp de verdade.
export async function getOtp(phone: string): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const code = await redis.get(`otp:${phone}`);
    if (code) return code;
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  throw new Error(`OTP nao encontrado no Redis para o telefone ${phone}`);
}

interface TestBusiness {
  business: { id: string; name: string; slug: string };
  user: { id: string; name: string; phone: string; role: string };
  ownerPhone: string;
}

/**
 * Cria um negocio + dono novos via onboarding publico e autentica via
 * OTP, deixando os cookies httpOnly ja setados no APIRequestContext
 * recebido. Cada chamada gera dados isolados (telefones aleatorios),
 * entao os specs nao interferem uns nos outros mesmo rodando em paralelo.
 */
export async function createBusinessAndLogin(request: APIRequestContext): Promise<TestBusiness> {
  const businessPhone = randomPhone();
  const ownerPhone = randomPhone();

  const onboardingRes = await request.post('/api/business/onboarding', {
    data: {
      name: `Salao E2E ${uniqueSuffix()}`,
      phone: businessPhone,
      ownerName: 'Dono E2E',
      ownerPhone,
    },
  });
  if (onboardingRes.status() !== 201) {
    throw new Error(`onboarding falhou: ${onboardingRes.status()} ${await onboardingRes.text()}`);
  }
  const business = (await onboardingRes.json()).data;

  await request.post('/api/auth/otp/request', { data: { phone: ownerPhone } });
  const otp = await getOtp(ownerPhone);

  const verifyRes = await request.post('/api/auth/otp/verify', {
    data: { phone: ownerPhone, otp },
  });
  if (verifyRes.status() !== 200) {
    throw new Error(`verify falhou: ${verifyRes.status()} ${await verifyRes.text()}`);
  }
  const { user } = (await verifyRes.json()).data;

  return { business, user, ownerPhone };
}
