'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExportButton } from '@/components/ExportButton';
import { exportData, ExportFormat, prepareClientExport } from '@/lib/export';
import { clientsApi, Client, ClientDetails } from '@/lib/api';
import { DateInput } from '@/components/DateInput';

const clientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  phone: z.string().min(10, 'Telefone invalido').max(15),
  email: z.string().email('Email invalido').optional().or(z.literal('')),
  birthDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

const PAGE_SIZE = 20;

export default function ClientesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showNewModal, setShowNewModal] = useState(false);
  const [profileClientId, setProfileClientId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['clients', debouncedSearch, page],
    queryFn: () => clientsApi.getClients({ search: debouncedSearch || undefined, page, limit: PAGE_SIZE }),
  });

  const { data: profileClient } = useQuery({
    queryKey: ['client', profileClientId],
    queryFn: () => clientsApi.getClient(profileClientId as string),
    enabled: !!profileClientId,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: '', phone: '', email: '', birthDate: '', notes: '' },
  });

  const createMutation = useMutation({
    mutationFn: (formData: ClientFormData) =>
      clientsApi.createClient({
        name: formData.name,
        phone: formData.phone.replace(/\D/g, ''),
        email: formData.email || undefined,
        birthDate: formData.birthDate ? new Date(`${formData.birthDate}T00:00:00`).toISOString() : undefined,
        notes: formData.notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      handleCloseModals();
    },
  });

  const clients = data?.clients ?? [];
  const totalPages = data?.pages ?? 1;

  const handleExport = (format: ExportFormat) => {
    setExporting(true);
    try {
      const clientsForExport = clients.map(c => ({
        name: c.name,
        phone: formatPhone(c.phone),
        email: c.email || undefined,
        lastVisitAt: c.lastVisitAt,
        totalAppointments: c.totalAppointments,
        totalSpent: c.totalSpent,
      }));

      const exportPayload = prepareClientExport(clientsForExport);
      exportData(exportPayload, format, {
        filename: `clientes-${new Date().toISOString().split('T')[0]}`,
        title: 'Lista de Clientes',
        subtitle: `${clients.length} clientes`,
      });
    } finally {
      setExporting(false);
    }
  };

  const handleCloseModals = () => {
    setShowNewModal(false);
    setProfileClientId(null);
    reset();
  };

  const onSubmit = (formData: ClientFormData) => {
    createMutation.mutate(formData);
  };

  const formatPhone = (phone: string) => {
    if (phone.length <= 11) {
      return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
    }
    return phone;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
          <p className="text-gray-600">{data?.total ?? 0} clientes cadastrados</p>
        </div>
        <div className="flex gap-2">
          <ExportButton onExport={handleExport} loading={exporting} />
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            + Novo Cliente
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, telefone ou email..."
          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Erro ao carregar clientes. Tente novamente.
        </div>
      )}

      {/* Clients Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ultima Visita</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Visitas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Gasto</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Carregando...</td>
              </tr>
            )}
            {!isLoading && clients.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Nenhum cliente encontrado</td>
              </tr>
            )}
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-medium">
                      {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{client.name}</p>
                      <p className="text-sm text-gray-500">{client.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{formatPhone(client.phone)}</td>
                <td className="px-6 py-4 text-gray-600">{formatDate(client.lastVisitAt)}</td>
                <td className="px-6 py-4 text-gray-600">{client.totalAppointments}</td>
                <td className="px-6 py-4 text-gray-600">{formatCurrency(client.totalSpent)}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setProfileClientId(client.id)}
                    className="text-purple-600 hover:text-purple-800 font-medium text-sm"
                  >
                    Ver perfil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600">Pagina {page} de {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Proxima
            </button>
          </div>
        )}
      </div>

      {/* New Client Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Novo Cliente</h2>
            {createMutation.isError && (
              <p className="text-red-500 text-sm mb-4">
                {createMutation.error instanceof Error ? createMutation.error.message : 'Erro ao criar cliente'}
              </p>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="Nome do cliente"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="11999999999"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (opcional)</label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="email@exemplo.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento (opcional)</label>
                <Controller
                  name="birthDate"
                  control={control}
                  render={({ field }) => (
                    <DateInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observacoes</label>
                <textarea
                  {...register('notes')}
                  placeholder="Observacoes sobre o cliente..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModals}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Profile Modal */}
      {profileClientId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            {!profileClient ? (
              <p className="text-center text-gray-500 py-8">Carregando...</p>
            ) : (
              <ClientProfileContent client={profileClient} onClose={handleCloseModals} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ClientProfileContent({ client, onClose }: { client: ClientDetails; onClose: () => void }) {
  const formatPhone = (phone: string) => {
    if (phone.length <= 11) {
      return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
    }
    return phone;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xl font-bold">
            {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <h2 className="text-xl font-bold">{client.name}</h2>
            <p className="text-gray-500">{formatPhone(client.phone)}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{client.totalAppointments}</p>
          <p className="text-sm text-gray-500">Visitas</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{formatCurrency(client.totalSpent)}</p>
          <p className="text-sm text-gray-500">Total Gasto</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-500">Email</span>
          <span>{client.email || '-'}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-500">Ultima Visita</span>
          <span>{formatDate(client.lastVisitAt)}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-500">Aniversario</span>
          <span>{client.birthDate ? formatDate(client.birthDate) : '-'}</span>
        </div>
      </div>

      {client.appointments && client.appointments.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Ultimos agendamentos</p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {client.appointments.slice(0, 5).map((apt) => (
              <div key={apt.id} className="flex justify-between text-sm py-1.5 border-b border-gray-100">
                <span className="text-gray-700">{apt.service?.name}</span>
                <span className="text-gray-500">{formatDate(apt.startTime)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => window.open(`https://wa.me/55${client.phone}`, '_blank')}
          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </button>
      </div>
    </>
  );
}
