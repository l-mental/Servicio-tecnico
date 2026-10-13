import React, { useState } from 'react';
import { X, Save, Package } from 'lucide-react';
import { InventoryItem } from '../types';

interface EditInventoryModalProps {
  item: InventoryItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: InventoryItem) => void;
}

export const EditInventoryModal: React.FC<EditInventoryModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [sku, setSku] = useState(item.sku);
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState(item.category);
  const [compatibleWith, setCompatibleWith] = useState(item.compatibleWith);
  const [stock, setStock] = useState<number>(item.stock);
  const [minStock, setMinStock] = useState<number>(item.minStock);
  const [cost, setCost] = useState<number>(item.cost);
  const [price, setPrice] = useState<number>(item.price);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: InventoryItem = {
      ...item,
      sku: sku.trim(),
      name: name.trim(),
      category: category.trim(),
      compatibleWith: compatibleWith.trim(),
      stock: Number(stock) || 0,
      minStock: Number(minStock) || 1,
      cost: Number(cost) || 0,
      price: Number(price) || 0,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">
              Editar Repuesto / Insumo
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-slate-400 block mb-1">SKU / Identificador</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Nombre del Componente *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Categoría</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Compatibilidad</label>
              <input
                type="text"
                value={compatibleWith}
                onChange={(e) => setCompatibleWith(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Stock Actual</label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Stock Mínimo (Alerta)</label>
              <input
                type="number"
                min={1}
                value={minStock}
                onChange={(e) => setMinStock(Number(e.target.value))}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Costo Compra ($)</label>
              <input
                type="number"
                min={0}
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Precio Venta Cliente ($)</label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Repuesto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
