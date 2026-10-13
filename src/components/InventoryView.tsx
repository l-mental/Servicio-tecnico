import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  Minus, 
  Pencil, 
  Trash2, 
  Filter 
} from 'lucide-react';
import { InventoryItem } from '../types';
import { formatCurrency } from '../utils/helpers';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onUpdateInventory: (items: InventoryItem[]) => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (item: InventoryItem) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  onUpdateInventory,
  onEditItem,
  onDeleteItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Pantallas');
  const [compatibleWith, setCompatibleWith] = useState('');
  const [stock, setStock] = useState<number>(5);
  const [minStock, setMinStock] = useState<number>(2);
  const [cost, setCost] = useState<number>(20);
  const [price, setPrice] = useState<number>(45);

  const categories = Array.from(new Set(inventory.map(i => i.category)));

  const filtered = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.compatibleWith.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const lowStockItems = inventory.filter(i => i.stock <= i.minStock);
  const totalCostValued = inventory.reduce((acc, i) => acc + i.cost * i.stock, 0);
  const totalPriceValued = inventory.reduce((acc, i) => acc + i.price * i.stock, 0);

  const handleAdjustStock = (itemId: string, delta: number) => {
    const updated = inventory.map(item => {
      if (item.id === itemId) {
        const newStock = Math.max(0, item.stock + delta);
        return { ...item, stock: newStock };
      }
      return item;
    });
    onUpdateInventory(updated);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      sku: sku.trim() || `REP-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      name: name.trim(),
      category: category.trim(),
      compatibleWith: compatibleWith.trim() || 'Dispositivos varios',
      stock: Number(stock) || 0,
      minStock: Number(minStock) || 1,
      cost: Number(cost) || 0,
      price: Number(price) || 0,
    };

    onUpdateInventory([newItem, ...inventory]);
    setShowAddModal(false);
    setSku('');
    setName('');
    setCompatibleWith('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Inventario de Repuestos, Módulos & Insumos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión completa de stock, edición de precios de venta, costos y alertas automáticas de reposición.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Registrar Nuevo Repuesto</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-xs block">Artículos en Catálogo</span>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {inventory.length}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {inventory.reduce((a, b) => a + b.stock, 0)} unidades físicas
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-xs block">Valor Costo Almacén</span>
          <span className="text-2xl font-bold text-slate-800 font-mono tabular-nums">
            {formatCurrency(totalCostValued)}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Capital en inventario
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-xs block">Valor Venta Estimado</span>
          <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {formatCurrency(totalPriceValued)}
          </span>
          <span className="text-[11px] text-emerald-600 block mt-0.5 font-medium">
            Retorno potencial {totalCostValued > 0 ? `+${Math.round(((totalPriceValued - totalCostValued) / totalCostValued) * 100)}%` : '0%'}
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-xs block">Alertas Stock Mínimo</span>
          <span className="text-2xl font-bold text-rose-600 font-mono tabular-nums flex items-center gap-1.5">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            {lowStockItems.length}
          </span>
          <span className="text-[11px] text-rose-600 block mt-0.5">
            Requieren reposición
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por repuesto, SKU, compatibilidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table with Edit & Delete */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Nombre del Componente</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Compatibilidad</th>
                <th className="py-3 px-4 text-center">Stock Actual</th>
                <th className="py-3 px-4 text-right">Costo</th>
                <th className="py-3 px-4 text-right">Precio Venta</th>
                <th className="py-3 px-4 text-center">Ajuste Rápido</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No se encontraron repuestos con los criterios indicados.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isLow = item.stock <= item.minStock;
                  const marginPct = item.cost > 0 ? Math.round(((item.price - item.cost) / item.cost) * 100) : 100;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      
                      {/* SKU */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-slate-900 text-[11px]">
                        {item.sku}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-xs">
                          {item.name}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {item.category}
                        </span>
                      </td>

                      {/* Compatibility */}
                      <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate text-[11px]">
                        {item.compatibleWith}
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                          isLow
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {item.stock} un.
                        </span>
                        {isLow && (
                          <span className="block text-[10px] text-rose-600 mt-0.5 font-bold">
                            Mín: {item.minStock}
                          </span>
                        )}
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                        {formatCurrency(item.cost)}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                        {formatCurrency(item.price)}
                        <span className="block text-[10px] text-emerald-600 font-normal">
                          +{marginPct}%
                        </span>
                      </td>

                      {/* Quick adjust */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleAdjustStock(item.id, -1)}
                            disabled={item.stock <= 0}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30"
                            title="Restar 1 unidad"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleAdjustStock(item.id, 1)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                            title="Sumar 1 unidad"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditItem(item)}
                            title="Editar Repuesto"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteItem(item)}
                            title="Eliminar Repuesto"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="font-bold text-slate-900 text-base">
              Registrar Repuesto en Inventario
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="text-slate-600 block mb-1 font-medium">SKU / Código</label>
                <input
                  type="text"
                  placeholder="Ej. PNT-SAM-S23U"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">Descripción del Repuesto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Pantalla OLED iPhone 15 Pro Original"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Categoría</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Compatibilidad</label>
                  <input
                    type="text"
                    placeholder="Ej. iPhone 15 Pro / Max"
                    value={compatibleWith}
                    onChange={(e) => setCompatibleWith(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Stock Inicial</label>
                  <input
                    type="number"
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Stock Mínimo Alerta</label>
                  <input
                    type="number"
                    min={1}
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Costo de Compra ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Precio Venta Cliente ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold"
                >
                  Guardar en Inventario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
