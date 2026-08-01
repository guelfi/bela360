'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { adminApi, type BusinessDetail } from '@/lib/admin-api';

export default function AdminBusinessDetailPage() {
  const params = useParams<{ id: string }>();
  const [business, setBusiness] = useState<BusinessDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getBusiness(params.id)
      .then(setBusiness)
      .finally(() => setIsLoading(false));
  }, [params.id]);

  if (isLoading) return <p className="text-gray-500">Carregando...</p>;
  if (!business) return <p className="text-gray-500">Negocio nao encontrado.</p>;

  return (
    <div>
      <Link href="/admin" className="text-sm text-primary hover:underline mb-4 inline-block">
        &larr; Voltar
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{business.name}</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">Dados do negocio</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500">Slug:</span> {business.slug}</p>
            <p><span className="text-gray-500">Email:</span> {business.email || '-'}</p>
            <p><span className="text-gray-500">Telefone:</span> {business.phone}</p>
            <p><span className="text-gray-500">Tipo:</span> {business.type}</p>
            <p><span className="text-gray-500">Status:</span> {business.status}</p>
            <p><span className="text-gray-500">Cidade:</span> {business.city || '-'} / {business.state || '-'}</p>
            <p><span className="text-gray-500">Criado em:</span> {new Date(business.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">Volumetria</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500 block">Usuarios</span>{business._count.users}</div>
            <div><span className="text-gray-500 block">Clientes</span>{business._count.clients}</div>
            <div><span className="text-gray-500 block">Agendamentos</span>{business._count.appointments}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
        <h2 className="font-semibold mb-4">Usuarios ({business.users.length})</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2 pr-4">Nome</th>
              <th className="pb-2 pr-4">Email</th>
              <th className="pb-2 pr-4">Papel</th>
              <th className="pb-2 pr-4">Ativo</th>
            </tr>
          </thead>
          <tbody>
            {business.users.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="py-2 pr-4">{u.name}</td>
                <td className="py-2 pr-4 text-gray-500">{u.email || '-'}</td>
                <td className="py-2 pr-4">{u.role}</td>
                <td className="py-2 pr-4">{u.isActive ? 'Sim' : 'Nao'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
