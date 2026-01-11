'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Plus,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Boxes,
  RefreshCw,
} from 'lucide-react';
import { ExportButton } from '@/components/ExportButton';
import { exportData, ExportFormat } from '@/lib/export';
import { inventoryApi, Product, StockMovement, InventoryStats } from '@/lib/api';

export default function EstoquePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    sku: '',
    category: 'INTERNAL_USE' as 'INTERNAL_USE' | 'FOR_SALE' | 'BOTH',
    costPrice: 0,
    minStock: 0,
    initialStock: 0,
    unit: 'un',
  });
  const [movementData, setMovementData] = useState({
    type: 'PURCHASE',
    quantity: 0,
    unitCost: 0,
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsData, statsData, movementsData] = await Promise.all([
        inventoryApi.getProducts(),
        inventoryApi.getStats(),
        inventoryApi.getMovements({ limit: 10 }),
      ]);
      setProducts(productsData);
      setStats(statsData);
      setMovements(movementsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = (format: ExportFormat) => {
    setExporting(true);
    try {
      const data = {
        headers: ['Nome', 'Marca', 'SKU', 'Categoria', 'Estoque Atual', 'Estoque Minimo', 'Preco Custo', 'Unidade', 'Status'],
        rows: filteredProducts.map(p => [
          p.name,
          p.brand || '',
          p.sku || '',
          categoryLabels[p.category] || p.category,
          p.currentStock,
          p.minStock,
          formatCurrency(p.costPrice),
          p.unit,
          isLowStock(p) ? 'Baixo' : 'OK',
        ]),
      };

      exportData(data, format, {
        filename: `estoque-${new Date().toISOString().split('T')[0]}`,
        title: 'Controle de Estoque',
        subtitle: `${filteredProducts.length} produtos`,
      });
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const categoryLabels: Record<string, string> = {
    INTERNAL_USE: 'Uso Interno',
    FOR_SALE: 'Revenda',
    BOTH: 'Ambos',
  };

  const movementTypeLabels: Record<string, string> = {
    PURCHASE: 'Compra',
    SERVICE_USE: 'Uso em Servico',
    SALE: 'Venda',
    ADJUSTMENT: 'Ajuste',
    LOSS: 'Perda',
    RETURN: 'Devolucao',
    EXPIRED: 'Vencido',
  };

  const isLowStock = (product: Product) => product.currentStock <= product.minStock;

  const handleCloseModals = () => {
    setShowNewModal(false);
    setShowMovementModal(false);
    setSelectedProduct(null);
    setFormData({ name: '', brand: '', sku: '', category: 'INTERNAL_USE', costPrice: 0, minStock: 0, initialStock: 0, unit: 'un' });
    setMovementData({ type: 'PURCHASE', quantity: 0, unitCost: 0, notes: '' });
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setMovementData(prev => ({ ...prev, unitCost: product.costPrice }));
    setShowMovementModal(true);
  };

  const handleSubmitNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.costPrice <= 0) {
      alert('Nome e preco de custo sao obrigatorios');
      return;
    }

    setSaving(true);
    try {
      await inventoryApi.createProduct({
        name: formData.name,
        brand: formData.brand || undefined,
        sku: formData.sku || undefined,
        category: formData.category,
        costPrice: formData.costPrice,
        minStock: formData.minStock,
        unit: formData.unit,
        initialStock: formData.initialStock,
      });
      handleCloseModals();
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar produto');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || movementData.quantity === 0) {
      alert('Quantidade deve ser diferente de zero');
      return;
    }

    setSaving(true);
    try {
      await inventoryApi.createMovement(selectedProduct.id, {
        type: movementData.type,
        quantity: movementData.quantity,
        unitCost: movementData.unitCost || undefined,
        notes: movementData.notes || undefined,
      });
      handleCloseModals();
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao registrar movimentacao');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand?.toLowerCase().includes(search.toLowerCase())) ||
      (p.sku?.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === 'all' ||
      (filter === 'low' && isLowStock(p)) ||
      (filter === p.category);
    return matchesSearch && matchesFilter;
  });

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
        <p className="text-red-500">{error}</p>
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          <RefreshCw className="h-4 w-4" />
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
            <Package className="h-6 w-6 text-blue-500" />
            Controle de Estoque
          </h1>
          <p className="text-muted-foreground">
            Gerencie produtos, movimentacoes e alertas de estoque
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={loadData} className="p-2 border rounded-lg hover:bg-muted" title="Atualizar">
            <RefreshCw className="h-4 w-4" />
          </button>
          <ExportButton onExport={handleExport} loading={exporting} />
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Produtos</p>
            <Boxes className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">{stats?.totalProducts || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">itens cadastrados</p>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Estoque Baixo</p>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-500">{stats?.lowStockCount || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">precisam reposicao</p>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Valor em Estoque</p>
            <Package className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(stats?.totalStockValue || 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">custo total</p>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Compras (Mes)</p>
            <ArrowUpRight className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats?.monthlyPurchases || 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">investido</p>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Consumo (Mes)</p>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats?.monthlyUsage || 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">utilizado</p>
        </div>
      </div>

      {/* Alerts */}
      {stats && stats.lowStockCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Atencao: Produtos com Estoque Baixo</p>
            <p className="text-sm text-red-600">
              {stats.lowStockCount} produtos estao abaixo do nivel minimo e precisam de reposicao.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Products List */}
        <div className="lg:col-span-2 bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Produtos ({filteredProducts.length})</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border rounded-lg text-sm w-48"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">Todos</option>
                <option value="low">Estoque Baixo</option>
                <option value="INTERNAL_USE">Uso Interno</option>
                <option value="FOR_SALE">Revenda</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum produto encontrado</p>
              {products.length === 0 && (
                <button
                  onClick={() => setShowNewModal(true)}
                  className="mt-4 text-primary hover:underline"
                >
                  Cadastrar primeiro produto
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors hover:opacity-80 ${
                    isLowStock(product) ? 'bg-red-50 border border-red-200' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isLowStock(product) ? 'bg-red-100' : 'bg-blue-100'}`}>
                      <Package className={`h-5 w-5 ${isLowStock(product) ? 'text-red-600' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.brand || 'Sem marca'} - {product.sku || 'Sem SKU'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${isLowStock(product) ? 'text-red-600' : ''}`}>
                      {product.currentStock} {product.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Min: {product.minStock} | {formatCurrency(product.costPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Movements */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Movimentacoes Recentes
          </h2>
          {movements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma movimentacao</p>
            </div>
          ) : (
            <div className="space-y-3">
              {movements.map((movement) => (
                <div key={movement.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className={`p-2 rounded-lg ${movement.quantity > 0 ? 'bg-green-100' : 'bg-orange-100'}`}>
                    {movement.quantity > 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{movement.product?.name || 'Produto'}</p>
                    <p className="text-xs text-muted-foreground">
                      {movementTypeLabels[movement.type] || movement.type} {movement.user?.name ? `por ${movement.user.name}` : ''}
                    </p>
                  </div>
                  <p className={`font-bold text-sm ${movement.quantity > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Product Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Novo Produto</h2>
            <form onSubmit={handleSubmitNewProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do produto *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Shampoo Profissional 1L"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Marca</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="Ex: LOreal"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="Codigo interno"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'INTERNAL_USE' | 'FOR_SALE' | 'BOTH' }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="INTERNAL_USE">Uso Interno</option>
                  <option value="FOR_SALE">Revenda</option>
                  <option value="BOTH">Ambos</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Preco de Custo (R$) *</label>
                  <input
                    type="number"
                    value={formData.costPrice || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, costPrice: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unidade</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="un">Unidade</option>
                    <option value="ml">Mililitros</option>
                    <option value="g">Gramas</option>
                    <option value="kg">Quilogramas</option>
                    <option value="L">Litros</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Estoque Inicial</label>
                  <input
                    type="number"
                    value={formData.initialStock || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, initialStock: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estoque Minimo</label>
                  <input
                    type="number"
                    value={formData.minStock || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, minStock: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
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
                  {saving ? 'Salvando...' : 'Criar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Movement Modal */}
      {showMovementModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">Movimentacao de Estoque</h2>
                <p className="text-sm text-muted-foreground">{selectedProduct.name}</p>
              </div>
              <button onClick={handleCloseModals} className="text-muted-foreground hover:text-foreground">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estoque Atual:</span>
                <span className="font-bold">{selectedProduct.currentStock} {selectedProduct.unit}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estoque Minimo:</span>
                <span>{selectedProduct.minStock} {selectedProduct.unit}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitMovement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Movimentacao</label>
                <select
                  value={movementData.type}
                  onChange={(e) => setMovementData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="PURCHASE">Compra (Entrada)</option>
                  <option value="SERVICE_USE">Uso em Servico (Saida)</option>
                  <option value="SALE">Venda (Saida)</option>
                  <option value="ADJUSTMENT">Ajuste</option>
                  <option value="LOSS">Perda (Saida)</option>
                  <option value="RETURN">Devolucao (Entrada)</option>
                  <option value="EXPIRED">Vencido (Saida)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantidade *</label>
                <input
                  type="number"
                  value={movementData.quantity || ''}
                  onChange={(e) => setMovementData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  min="1"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {['PURCHASE', 'RETURN'].includes(movementData.type)
                    ? 'Quantidade a adicionar ao estoque'
                    : 'Quantidade a remover do estoque'}
                </p>
              </div>
              {movementData.type === 'PURCHASE' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Custo Unitario (R$)</label>
                  <input
                    type="number"
                    value={movementData.unitCost || ''}
                    onChange={(e) => setMovementData(prev => ({ ...prev, unitCost: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Observacoes</label>
                <textarea
                  value={movementData.notes}
                  onChange={(e) => setMovementData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Motivo ou detalhes da movimentacao..."
                  rows={2}
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
    </div>
  );
}
