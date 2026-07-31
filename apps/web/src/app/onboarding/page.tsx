'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { businessApi } from '@/lib/api';

const BUSINESS_TYPES = [
  { value: 'SALON', label: 'Salao de beleza' },
  { value: 'BARBERSHOP', label: 'Barbearia' },
  { value: 'AESTHETICS', label: 'Estetica' },
  { value: 'SPA', label: 'Spa' },
  { value: 'OTHER', label: 'Outro' },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessType, setBusinessType] = useState<(typeof BUSINESS_TYPES)[number]['value']>('SALON');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await businessApi.onboard({
        name: businessName,
        phone: businessPhone.replace(/\D/g, ''),
        email: businessEmail || undefined,
        type: businessType,
        ownerName,
        ownerPhone: ownerPhone.replace(/\D/g, ''),
        ownerEmail: ownerEmail || undefined,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar negocio');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Negocio cadastrado!</h2>
            <p className="text-gray-600 mb-6">
              Agora e so entrar usando o telefone do proprietario ({formatPhone(ownerPhone)}) - vamos
              enviar um codigo por SMS/WhatsApp.
            </p>
            <Link
              href="/"
              className="inline-block w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Ir para o login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">bela360</h1>
          <p className="text-purple-100">Cadastre seu negocio</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Dados do negocio</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do negocio</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Salao da Ana"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  minLength={2}
                  maxLength={100}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone do negocio</label>
                <input
                  type="tel"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={15}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail do negocio (opcional)
                </label>
                <input
                  type="email"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  placeholder="contato@salaodaana.com.br"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de negocio</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as typeof businessType)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {BUSINESS_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pt-4">Dados do proprietario</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Seu nome</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Ana Silva"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  minLength={2}
                  maxLength={100}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seu telefone (usado pra entrar no sistema)
                </label>
                <input
                  type="tel"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(formatPhone(e.target.value))}
                  placeholder="(11) 98888-8888"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={15}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seu e-mail (opcional)
                </label>
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="ana@exemplo.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={
                loading ||
                businessName.trim().length < 2 ||
                businessPhone.replace(/\D/g, '').length < 10 ||
                ownerName.trim().length < 2 ||
                ownerPhone.replace(/\D/g, '').length < 10
              }
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar negocio'}
            </button>
          </form>
        </div>

        <p className="text-center text-purple-100 text-sm mt-8">
          Ja tem conta?{' '}
          <Link href="/" className="text-white font-medium hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </main>
  );
}
