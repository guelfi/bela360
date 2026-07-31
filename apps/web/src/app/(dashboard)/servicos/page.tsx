'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExportButton } from '@/components/ExportButton';
import { exportData, ExportFormat } from '@/lib/export';
import { servicesApi, professionalsApi, Service } from '@/lib/api';

const serviceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  description: z.string().max(500).optional(),
  duration: z.coerce.number().min(5, 'Duracao minima de 5 minutos').max(480, 'Duracao maxima de 8 horas'),
  price: z.coerce.number().min(0, 'Preco nao pode ser negativo'),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export default function ServicosPage() {
  const queryClient = useQueryClient();
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [selectedProfessionalIds, setSelectedProfessionalIds] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);

  const { data: services = [], isLoading, isError } = useQuery({
    queryKey: ['services', showInactive],
    queryFn: () => servicesApi.getServices(showInactive ? undefined : { active: true }),
  });

  const { data: professionals = [] } = useQuery({
    queryKey: ['professionals'],
    queryFn: () => professionalsApi.getProfessionals({ active: true }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: '', description: '', duration: 60, price: 0 },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: ServiceFormData) => {
      const created = await servicesApi.createService({
        name: formData.name,
        description: formData.description || undefined,
        duration: formData.duration,
        price: formData.price,
      });
      await Promise.all(
        selectedProfessionalIds.map(profId => servicesApi.assignProfessional(created.id, profId))
      );
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      handleCloseModals();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (formData: ServiceFormData) => {
      if (!selectedService) return;
      await servicesApi.updateService(selectedService.id, {
        name: formData.name,
        description: formData.description || undefined,
        duration: formData.duration,
        price: formData.price,
      });

      const currentIds = (selectedService.professionals ?? []).map(p => p.id);
      const toAdd = selectedProfessionalIds.filter(id => !currentIds.includes(id));
      const toRemove = currentIds.filter(id => !selectedProfessionalIds.includes(id));

      await Promise.all([
        ...toAdd.map(id => servicesApi.assignProfessional(selectedService.id, id)),
        ...toRemove.map(id => servicesApi.removeProfessional(selectedService.id, id)),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      handleCloseModals();
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (service: Service) => servicesApi.updateService(service.id, { isActive: !service.isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });

  const activeCount = services.filter(s => s.isActive).length;

  const handleExport = (format: ExportFormat) => {
    setExporting(true);
    try {
      const data = {
        headers: ['Nome', 'Descrição', 'Duração', 'Preço', 'Profissionais', 'Status'],
        rows: services.map(s => [
          s.name,
          s.description || '-',
          formatDuration(s.duration),
          formatCurrency(s.price),
          (s.professionals ?? []).map(p => p.name).join(', '),
          s.isActive ? 'Ativo' : 'Inativo',
        ]),
      };

      exportData(data, format, {
        filename: `servicos-${new Date().toISOString().split('T')[0]}`,
        title: 'Lista de Serviços',
        subtitle: `${services.length} serviços`,
      });
    } finally {
      setExporting(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}min`;
    if (hours > 0) return `${hours}h`;
    return `${mins}min`;
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleCloseModals = () => {
    setShowNewModal(false);
    setSelectedService(null);
    setSelectedProfessionalIds([]);
    reset();
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setSelectedProfessionalIds((service.professionals ?? []).map(p => p.id));
    reset({
      name: service.name,
      description: service.description || '',
      duration: service.duration,
      price: service.price,
    });
  };

  const handleProfessionalToggle = (profId: string) => {
    setSelectedProfessionalIds(prev =>
      prev.includes(profId) ? prev.filter(id => id !== profId) : [...prev, profId]
    );
  };

  const onSubmitNew = (formData: ServiceFormData) => createMutation.mutate(formData);
  const onSubmitEdit = (formData: ServiceFormData) => updateMutation.mutate(formData);

  const activeMutation = selectedService ? updateMutation : createMutation;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Servicos</h1>
          <p className="text-gray-600">{activeCount} servicos ativos</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            Mostrar inativos
          </label>
          <ExportButton onExport={handleExport} loading={exporting} />
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            + Novo Servico
          </button>
        </div>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Erro ao carregar serviços. Tente novamente.
        </div>
      )}

      {isLoading && <p className="text-gray-500">Carregando...</p>}

      {!isLoading && services.length === 0 && (
        <p className="text-gray-500">Nenhum serviço cadastrado</p>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className={`bg-white rounded-lg border p-6 ${
              service.isActive ? 'border-gray-200' : 'border-gray-200 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">{service.name}</h3>
                <p className="text-sm text-gray-500">{formatDuration(service.duration)}</p>
              </div>
              <span className="text-lg font-bold text-purple-600">
                {formatCurrency(service.price)}
              </span>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Profissionais:</p>
              <div className="flex flex-wrap gap-2">
                {(service.professionals ?? []).length === 0 && (
                  <span className="text-xs text-gray-400">Nenhum vinculado</span>
                )}
                {(service.professionals ?? []).map((prof) => (
                  <span
                    key={prof.id}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {prof.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                onClick={() => toggleActiveMutation.mutate(service)}
                disabled={toggleActiveMutation.isPending}
                className={`text-xs font-medium cursor-pointer hover:underline ${
                  service.isActive ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {service.isActive ? 'Ativo' : 'Inativo'}
              </button>
              <button
                onClick={() => handleEdit(service)}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
              >
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New/Edit Service Modal */}
      {(showNewModal || selectedService) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{selectedService ? 'Editar Servico' : 'Novo Servico'}</h2>
            {activeMutation.isError && (
              <p className="text-red-500 text-sm mb-4">
                {activeMutation.error instanceof Error ? activeMutation.error.message : 'Erro ao salvar serviço'}
              </p>
            )}
            <form onSubmit={handleSubmit(selectedService ? onSubmitEdit : onSubmitNew)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do servico *</label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="Ex: Corte Feminino"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descricao (opcional)</label>
                <textarea
                  {...register('description')}
                  placeholder="Descricao do servico..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duracao (minutos)</label>
                  <input
                    type="number"
                    {...register('duration')}
                    min="5"
                    step="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preco (R$) *</label>
                  <input
                    type="number"
                    {...register('price')}
                    placeholder="80.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profissionais que realizam</label>
                <div className="space-y-2">
                  {professionals.length === 0 && (
                    <p className="text-xs text-gray-400">Nenhum profissional cadastrado</p>
                  )}
                  {professionals.map((prof) => (
                    <label key={prof.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProfessionalIds.includes(prof.id)}
                        onChange={() => handleProfessionalToggle(prof.id)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">{prof.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModals}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : selectedService ? 'Salvar Alteracoes' : 'Criar Servico'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
