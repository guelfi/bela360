'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Banknote,
  QrCode,
  Calendar,
  Users,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { ExportButton } from '@/components/ExportButton';
import { exportData, ExportFormat } from '@/lib/export';
import { financeApi, FinancialSummary, PaymentMethodStats, Commission } from '@/lib/api';

export default function FinanceiroPage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [byMethod, setByMethod] = useState<PaymentMethodStats[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('month');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCloseCashModal, setShowCloseCashModal] = useState(false);
  const [showCommissionsModal, setShowCommissionsModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    clientId: '',
    clientName: '',
    amount: 0,
    method: 'PIX',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const periodDates = getPeriodDates(period);
      const [summaryData, methodsData, commissionsData] = await Promise.all([
        financeApi.getSummary(periodDates),
        financeApi.getByMethod(periodDates),
        financeApi.getCommissions({ status: 'PENDING' }),
      ]);
      setSummary(summaryData);
      setByMethod(methodsData);
      setCommissions(commissionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getPeriodDates = (p: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let startDate: Date;
    let endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    switch (p) {
      case 'today':
        startDate = today;
        break;
      case 'week':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const methodIcons: Record<string, typeof DollarSign> = {
    PIX: QrCode,
    CREDIT_CARD: CreditCard,
    DEBIT_CARD: CreditCard,
    CASH: Banknote,
  };

  const methodLabels: Record<string, string> = {
    PIX: 'PIX',
    CREDIT_CARD: 'Cartão Crédito',
    DEBIT_CARD: 'Cartão Débito',
    CASH: 'Dinheiro',
  };

  const handleCloseModals = () => {
    setShowPaymentModal(false);
    setShowCloseCashModal(false);
    setShowCommissionsModal(false);
    setPaymentData({ clientId: '', clientName: '', amount: 0, method: 'PIX', description: '' });
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentData.clientName || paymentData.amount <= 0) {
      alert('Cliente e valor são obrigatórios');
      return;
    }

    setSaving(true);
    try {
      await financeApi.registerPayment({
        clientId: paymentData.clientId || undefined,
        clientName: paymentData.clientName,
        amount: paymentData.amount,
        method: paymentData.method as 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH',
        description: paymentData.description || undefined,
      });
      handleCloseModals();
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao registrar pagamento');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseCash = async () => {
    setSaving(true);
    try {
      await financeApi.closeCash();
      handleCloseModals();
      await loadData();
      alert('Caixa fechado com sucesso! Relatório gerado.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao fechar caixa');
    } finally {
      setSaving(false);
    }
  };

  const handlePayCommission = async (commissionId: string) => {
    try {
      await financeApi.payCommission(commissionId);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao pagar comissão');
    }
  };

  const [exporting, setExporting] = useState(false);

  const handleExportReport = (format: ExportFormat) => {
    setExporting(true);
    try {
      const periodLabel = {
        today: 'Hoje',
        week: 'Esta Semana',
        month: 'Este Mês',
        year: 'Este Ano',
      }[period] || period;

      const data = {
        headers: ['Categoria', 'Métrica', 'Valor'],
        rows: [
          ['Resumo', 'Receita Total', formatCurrency(summary?.totalRevenue || 0)],
          ['Resumo', 'Comissões', formatCurrency(summary?.totalCommissions || 0)],
          ['Resumo', 'Lucro do Salão', formatCurrency(summary?.businessProfit || 0)],
          ['Resumo', 'Transações', summary?.transactionCount || 0],
          ['Resumo', 'Ticket Médio', formatCurrency(summary?.averageTicket || 0)],
          ...byMethod.map(m => [
            'Forma de Pagamento',
            methodLabels[m.method] || m.method,
            `${formatCurrency(m.total)} (${m.count} transações)`,
          ]),
        ],
      };

      exportData(data, format, {
        filename: `financeiro-${period}-${new Date().toISOString().split('T')[0]}`,
        title: 'Relatório Financeiro',
        subtitle: `Período: ${periodLabel}`,
      });
    } finally {
      setExporting(false);
    }
  };

  const totalPendingCommissions = commissions.reduce((sum, c) => sum + c.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-500" />
            Financeiro
          </h1>
          <p className="text-muted-foreground">
            Controle de receitas, comissões e fechamento de caixa
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 bg-card border rounded-lg hover:bg-muted disabled:opacity-50"
            title="Atualizar dados"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 bg-card border rounded-lg text-sm"
          >
            <option value="today">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="year">Este Ano</option>
          </select>
          <ExportButton onExport={handleExportReport} loading={exporting} />
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Receita Total</p>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-500">
            {formatCurrency(summary?.totalRevenue || 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {summary?.transactionCount || 0} transações
          </p>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Comissões</p>
            <Users className="h-4 w-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-orange-500">
            {formatCurrency(summary?.totalCommissions || 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {((summary?.totalCommissions || 0) / (summary?.totalRevenue || 1) * 100).toFixed(1)}% da receita
          </p>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Lucro do Salão</p>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-500">
            {formatCurrency(summary?.businessProfit || 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {((summary?.businessProfit || 0) / (summary?.totalRevenue || 1) * 100).toFixed(1)}% da receita
          </p>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Ticket Médio</p>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-500">
            {formatCurrency(summary?.averageTicket || 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            por atendimento
          </p>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Por Forma de Pagamento</h2>
          {byMethod.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum pagamento registrado no período
            </p>
          ) : (
            <div className="space-y-4">
              {byMethod.map((method) => {
                const Icon = methodIcons[method.method] || DollarSign;
                const percentage = (method.total / (summary?.totalRevenue || 1)) * 100;

                return (
                  <div key={method.method} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {methodLabels[method.method] || method.method}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(method.total)}</p>
                        <p className="text-xs text-muted-foreground">{method.count} transações</p>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
          <div className="grid gap-3">
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-left"
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Registrar Pagamento</p>
                <p className="text-sm text-muted-foreground">Adicionar novo pagamento</p>
              </div>
            </button>

            <button
              onClick={() => setShowCloseCashModal(true)}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-left"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Fechar Caixa</p>
                <p className="text-sm text-muted-foreground">Finalizar o dia</p>
              </div>
            </button>

            <button
              onClick={() => setShowCommissionsModal(true)}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-left"
            >
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Comissões Pendentes</p>
                <p className="text-sm text-muted-foreground">Ver repasses</p>
              </div>
              {commissions.length > 0 && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {commissions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleExportReport('xlsx')}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-left"
            >
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">Relatório Completo</p>
                <p className="text-sm text-muted-foreground">Exportar Excel</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Register Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Registrar Pagamento</h2>
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cliente *</label>
                <input
                  type="text"
                  value={paymentData.clientName}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Nome do cliente"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valor (R$) *</label>
                <input
                  type="number"
                  value={paymentData.amount || ''}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Forma de Pagamento</label>
                <select
                  value={paymentData.method}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, method: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="PIX">PIX</option>
                  <option value="CREDIT_CARD">Cartão de Crédito</option>
                  <option value="DEBIT_CARD">Cartão de Débito</option>
                  <option value="CASH">Dinheiro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <input
                  type="text"
                  value={paymentData.description}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ex: Corte + Escova"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModals}
                  disabled={saving}
                  className="flex-1 px-4 py-2 border text-muted-foreground rounded-lg hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Cash Modal */}
      {showCloseCashModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Fechar Caixa</h2>
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Resumo do Dia</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Receita Total:</span>
                    <span className="font-bold text-green-600">{formatCurrency(summary?.totalRevenue || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Comissões:</span>
                    <span className="font-bold text-orange-600">{formatCurrency(summary?.totalCommissions || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Lucro do Salão:</span>
                    <span className="font-bold text-blue-600">{formatCurrency(summary?.businessProfit || 0)}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Ao fechar o caixa, um relatório será gerado automaticamente e as comissões serão calculadas.
              </p>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleCloseModals}
                  disabled={saving}
                  className="flex-1 px-4 py-2 border text-muted-foreground rounded-lg hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCloseCash}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Fechando...' : 'Confirmar Fechamento'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Commissions Modal */}
      {showCommissionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Comissões Pendentes</h2>
              <button onClick={handleCloseModals} className="text-muted-foreground hover:text-foreground">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {commissions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma comissão pendente
              </p>
            ) : (
              <div className="space-y-3">
                {commissions.map((commission) => (
                  <div key={commission.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{commission.professionalName}</p>
                      <p className="text-sm text-muted-foreground">
                        {commission.appointmentCount} atendimento{commission.appointmentCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-purple-600">{formatCurrency(commission.amount)}</p>
                      <button
                        onClick={() => handlePayCommission(commission.id)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200"
                      >
                        Pagar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between font-bold">
                <span>Total Pendente:</span>
                <span className="text-purple-600">{formatCurrency(totalPendingCommissions)}</span>
              </div>
            </div>
            <button
              onClick={handleCloseModals}
              className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
