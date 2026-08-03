'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  appointmentsApi,
  servicesApi,
  professionalsApi,
  clientsApi,
  Appointment,
} from '@/lib/api';
import { DateInput } from '@/components/DateInput';

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00',
];

const appointmentSchema = z.object({
  clientPhone: z.string().min(10, 'Telefone invalido').max(15),
  clientName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  serviceId: z.string().min(1, 'Selecione um servico'),
  professionalId: z.string().min(1, 'Selecione um profissional'),
  date: z.string().min(1),
  time: z.string().min(1),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

function timeOf(startTime: string) {
  return new Date(startTime).toTimeString().slice(0, 5);
}

const statusLabels: Record<Appointment['status'], string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Concluido',
  NO_SHOW: 'Nao compareceu',
};

const statusColors: Record<Appointment['status'], string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  NO_SHOW: 'bg-gray-200 text-gray-700',
};

export default function AgendaPage() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const { data: appointments = [], isLoading, isError } = useQuery({
    queryKey: ['appointments', selectedDate],
    queryFn: () => appointmentsApi.getAppointments({ date: selectedDate }),
  });

  const { data: professionals = [] } = useQuery({
    queryKey: ['professionals'],
    queryFn: () => professionalsApi.getProfessionals({ active: true }),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services', false],
    queryFn: () => servicesApi.getServices({ active: true }),
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      clientPhone: '',
      clientName: '',
      serviceId: '',
      professionalId: '',
      date: selectedDate,
      time: '09:00',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: AppointmentFormData) => {
      // POST /clients ja faz find-or-get por telefone no backend (createOrGet)
      const client = await clientsApi.createClient({
        phone: formData.clientPhone.replace(/\D/g, ''),
        name: formData.clientName,
      });
      const startTime = new Date(`${formData.date}T${formData.time}:00`).toISOString();
      return appointmentsApi.createAppointment({
        clientId: client.id,
        professionalId: formData.professionalId,
        serviceId: formData.serviceId,
        startTime,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      handleCloseModals();
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => appointmentsApi.confirmAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      handleCloseModals();
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => appointmentsApi.cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      handleCloseModals();
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => appointmentsApi.completeAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      handleCloseModals();
    },
  });

  const getAppointmentForSlot = (professionalId: string, time: string) => {
    return appointments.find(
      apt => apt.professionalId === professionalId && timeOf(apt.startTime) === time && apt.status !== 'CANCELLED'
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const handleCloseModals = () => {
    setShowNewModal(false);
    setSelectedAppointment(null);
    reset({ clientPhone: '', clientName: '', serviceId: '', professionalId: '', date: selectedDate, time: '09:00' });
  };

  const handleSlotClick = (professionalId: string, time: string) => {
    const existing = getAppointmentForSlot(professionalId, time);
    if (existing) {
      setSelectedAppointment(existing);
    } else {
      reset({ clientPhone: '', clientName: '', serviceId: '', professionalId, date: selectedDate, time });
      setShowNewModal(true);
    }
  };

  const onSubmit = (formData: AppointmentFormData) => createMutation.mutate(formData);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Agenda</h1>
          <p className="text-gray-600 capitalize">{formatDate(selectedDate)}</p>
        </div>
        <div className="flex items-center gap-4">
          <DateInput
            value={selectedDate}
            onChange={setSelectedDate}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={() => {
              reset({ clientPhone: '', clientName: '', serviceId: '', professionalId: '', date: selectedDate, time: '09:00' });
              setShowNewModal(true);
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            + Novo Agendamento
          </button>
        </div>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Erro ao carregar agendamentos. Tente novamente.
        </div>
      )}

      {professionals.length === 0 && !isLoading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
          Nenhum profissional ativo cadastrado. Cadastre profissionais em Configurações para poder agendar.
        </div>
      )}

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden overflow-x-auto">
        <div
          className="grid border-b border-gray-200 min-w-[600px]"
          style={{ gridTemplateColumns: `80px repeat(${Math.max(professionals.length, 1)}, 1fr)` }}
        >
          <div className="p-4 bg-gray-50" />
          {professionals.map((prof) => (
            <div
              key={prof.id}
              className="p-4 text-center font-medium border-l border-gray-200"
              style={{ backgroundColor: `${prof.color || '#7C3AED'}10` }}
            >
              <div
                className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: prof.color || '#7C3AED' }}
              >
                {prof.name[0]}
              </div>
              {prof.name}
            </div>
          ))}
        </div>

        <div className="max-h-[600px] overflow-y-auto min-w-[600px]">
          {timeSlots.map((time) => (
            <div
              key={time}
              className="grid border-b border-gray-100"
              style={{ gridTemplateColumns: `80px repeat(${Math.max(professionals.length, 1)}, 1fr)` }}
            >
              <div className="p-2 text-sm text-gray-500 text-right pr-4 bg-gray-50">{time}</div>
              {professionals.map((prof) => {
                const appointment = getAppointmentForSlot(prof.id, time);
                return (
                  <div
                    key={`${prof.id}-${time}`}
                    onClick={() => handleSlotClick(prof.id, time)}
                    className="p-1 min-h-[50px] border-l border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {appointment && (
                      <div className={`p-2 rounded text-xs ${statusColors[appointment.status]}`}>
                        <p className="font-medium truncate">{appointment.client?.name}</p>
                        <p className="truncate">{appointment.service?.name}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 rounded" />
          <span className="text-gray-600">Confirmado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 rounded" />
          <span className="text-gray-600">Pendente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 rounded" />
          <span className="text-gray-600">Concluido</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 rounded" />
          <span className="text-gray-600">Cancelado</span>
        </div>
      </div>

      {/* New Appointment Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Novo Agendamento</h2>
            {createMutation.isError && (
              <p className="text-red-500 text-sm mb-4">
                {createMutation.error instanceof Error ? createMutation.error.message : 'Erro ao criar agendamento'}
              </p>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone do cliente *</label>
                <input
                  type="tel"
                  {...register('clientPhone')}
                  placeholder="11999999999"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {errors.clientPhone && <p className="text-red-500 text-xs mt-1">{errors.clientPhone.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do cliente *</label>
                <input
                  type="text"
                  {...register('clientName')}
                  placeholder="Nome do cliente..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName.message}</p>}
                <p className="text-xs text-gray-400 mt-1">Se o telefone ja estiver cadastrado, o cliente existente sera usado.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Servico *</label>
                <select
                  {...register('serviceId')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Selecione um servico</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.duration}min)</option>
                  ))}
                </select>
                {errors.serviceId && <p className="text-red-500 text-xs mt-1">{errors.serviceId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profissional *</label>
                <select
                  {...register('professionalId')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Selecione um profissional</option>
                  {professionals.map((prof) => (
                    <option key={prof.id} value={prof.id}>{prof.name}</option>
                  ))}
                </select>
                {errors.professionalId && <p className="text-red-500 text-xs mt-1">{errors.professionalId.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <Controller
                    name="date"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horario</label>
                  <select
                    {...register('time')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
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
                  {isSubmitting ? 'Salvando...' : 'Agendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Detalhes do Agendamento</h2>
              <button onClick={handleCloseModals} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Cliente</span>
                <span className="font-medium">{selectedAppointment.client?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Servico</span>
                <span>{selectedAppointment.service?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Profissional</span>
                <span>{selectedAppointment.professional?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Horario</span>
                <span>{timeOf(selectedAppointment.startTime)} ({selectedAppointment.service?.duration}min)</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-1 rounded text-sm ${statusColors[selectedAppointment.status]}`}>
                  {statusLabels[selectedAppointment.status]}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {selectedAppointment.status !== 'CANCELLED' && selectedAppointment.status !== 'COMPLETED' && (
                <button
                  onClick={() => cancelMutation.mutate(selectedAppointment.id)}
                  disabled={cancelMutation.isPending}
                  className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
              )}
              {selectedAppointment.status === 'PENDING' && (
                <button
                  onClick={() => confirmMutation.mutate(selectedAppointment.id)}
                  disabled={confirmMutation.isPending}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Confirmar
                </button>
              )}
              {selectedAppointment.status === 'CONFIRMED' && (
                <button
                  onClick={() => completeMutation.mutate(selectedAppointment.id)}
                  disabled={completeMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Concluir
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
