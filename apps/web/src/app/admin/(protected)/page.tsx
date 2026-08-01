'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi, type BusinessSummary } from '@/lib/admin-api';

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminApi
      .listBusinesses()
      .then(setBusinesses)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Negocios da Plataforma</h1>

      {isLoading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 font-semibold">
            {businesses.length} negocios cadastrados
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 px-6">Nome</th>
                  <th className="py-2 px-6">Slug</th>
                  <th className="py-2 px-6">Tipo</th>
                  <th className="py-2 px-6">Usuarios</th>
                  <th className="py-2 px-6">Clientes</th>
                  <th className="py-2 px-6">Agendamentos</th>
                  <th className="py-2 px-6">Criado em</th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((b) => (
                  <tr key={b.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-6">
                      <Link href={`/admin/${b.id}`} className="text-primary hover:underline font-medium">
                        {b.name}
                      </Link>
                    </td>
                    <td className="py-3 px-6 text-gray-500">{b.slug}</td>
                    <td className="py-3 px-6">{b.type}</td>
                    <td className="py-3 px-6">{b._count.users}</td>
                    <td className="py-3 px-6">{b._count.clients}</td>
                    <td className="py-3 px-6">{b._count.appointments}</td>
                    <td className="py-3 px-6 text-gray-500">
                      {new Date(b.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
