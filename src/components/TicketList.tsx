import React, { useState } from 'react';
import { 
  Search, 
  Printer, 
  MessageSquare, 
  Filter,
  CheckCircle2,
  Clock,
  Laptop,
  Smartphone,
  Gamepad2,
  Tablet,
  Monitor,
  Pencil,
  Trash2,
  Plus
} from 'lucide-react';
import { Employee, Ticket, TicketStage, DeviceType } from '../types';
import { 
  STAGE_CONFIG, 
  formatCurrency, 
  formatDate, 
  getPriorityBadge, 
  calculateTicketTotals, 
  generateWhatsAppLink 
} from '../utils/helpers';

interface TicketListProps {
  tickets: Ticket[];
  employees: Employee[];
  onSelectTicket: (ticket: Ticket) => void;
  onEditTicket: (ticket: Ticket) => void;
  onDeleteTicket: (ticket: Ticket) => void;
  onPrintTicket: (ticket: Ticket) => void;
  onOpenNewTicket: () => void;
}

export const TicketList: React.FC<TicketListProps> = ({
  tickets,
  employees,
  onSelectTicket,
  onEditTicket,
  onDeleteTicket,
  onPrintTicket,
  onOpenNewTicket,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'total'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filtered = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.phone.includes(searchTerm) ||
      ticket.device.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = stageFilter === 'all' || ticket.stage === stageFilter;

    return matchesSearch && matchesStage;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'date') {
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return sortOrder === 'desc' ? diff : -diff;
    }
    if (sortBy === 'total') {
      const totA = calculateTicketTotals(a).total;
      const totB = calculateTicketTotals(b).total;
      return sortOrder === 'desc' ? totB - totA : totA - totB;
    }
    const priorityWeights = { urgente: 4, alta: 3, media: 2, baja: 1 };
    const pA = priorityWeights[a.priority];
    const pB = priorityWeights[b.priority];
    return sortOrder === 'desc' ? pB - pA : pA - pB;
  });

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'laptop': return <Laptop className="w-3.5 h-3.5 text-blue-600" />;
      case 'smartphone': return <Smartphone className="w-3.5 h-3.5 text-emerald-600" />;
      case 'consola': return <Gamepad2 className="w-3.5 h-3.5 text-purple-600" />;
      case 'pc': return <Monitor className="w-3.5 h-3.5 text-amber-600" />;
      case 'tablet': return <Tablet className="w-3.5 h-3.5 text-teal-600" />;
      default: return <Laptop className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Directorio Tabular de Órdenes Técnicas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Vista completa con acciones de edición completa, eliminación, impresión y WhatsApp.
          </p>
        </div>

        <button
          onClick={onOpenNewTicket}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Orden</span>
        </button>
      </div>

      {/* Filters and search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, teléfono, serie, orden..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium"
            >
              <option value="all">Todas las etapas</option>
              <option value="entrada">01. Entrada</option>
              <option value="desarmado">02. Desarmado</option>
              <option value="recomposicion">03. Recomposición</option>
              <option value="salida">04. Salida</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <span>Ordenar:</span>
          <button
            onClick={() => {
              if (sortBy === 'date') setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
              else { setSortBy('date'); setSortOrder('desc'); }
            }}
            className={`px-2.5 py-1 rounded-lg border transition-colors ${sortBy === 'date' ? 'bg-slate-900 border-slate-900 font-bold text-white' : 'border-slate-200 text-slate-700'}`}
          >
            Fecha {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => {
              if (sortBy === 'priority') setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
              else { setSortBy('priority'); setSortOrder('desc'); }
            }}
            className={`px-2.5 py-1 rounded-lg border transition-colors ${sortBy === 'priority' ? 'bg-slate-900 border-slate-900 font-bold text-white' : 'border-slate-200 text-slate-700'}`}
          >
            Prioridad {sortBy === 'priority' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => {
              if (sortBy === 'total') setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
              else { setSortBy('total'); setSortOrder('desc'); }
            }}
            className={`px-2.5 py-1 rounded-lg border transition-colors ${sortBy === 'total' ? 'bg-slate-900 border-slate-900 font-bold text-white' : 'border-slate-200 text-slate-700'}`}
          >
            Monto {sortBy === 'total' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Orden</th>
                <th className="py-3 px-4">Cliente & Contacto</th>
                <th className="py-3 px-4">Dispositivo</th>
                <th className="py-3 px-4">Etapa Actual</th>
                <th className="py-3 px-4">Técnico Responsable</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No se encontraron órdenes con los filtros actuales.
                  </td>
                </tr>
              ) : (
                sorted.map((ticket) => {
                  const tech = employees.find(e => e.id === ticket.assignedTechnicianId);
                  const prio = getPriorityBadge(ticket.priority);
                  const totals = calculateTicketTotals(ticket);
                  const stg = STAGE_CONFIG[ticket.stage];
                  const whatsappUrl = generateWhatsAppLink(ticket);

                  return (
                    <tr 
                      key={ticket.id} 
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      onClick={() => onSelectTicket(ticket)}
                    >
                      {/* Code & Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 font-mono text-xs">
                          {ticket.code}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[10px] font-semibold px-1 rounded ${prio.className}`}>
                            {prio.label}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {formatDate(ticket.createdAt)}
                          </span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 truncate max-w-[160px]">
                          {ticket.customer.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {ticket.customer.phone}
                        </div>
                      </td>

                      {/* Device */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          {getDeviceIcon(ticket.device.type)}
                          <span className="truncate max-w-[180px]">
                            {ticket.device.brand} {ticket.device.model}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]">
                          S/N: {ticket.device.serialNumber}
                        </div>
                      </td>

                      {/* Stage */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                            {stg.step}
                          </span>
                          <span className="font-bold text-slate-900 text-xs">
                            {stg.name}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {stg.shortDesc}
                        </div>
                      </td>

                      {/* Technician */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {tech ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={tech.avatar}
                              alt={tech.name}
                              className="w-6 h-6 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-800 text-xs">
                                {tech.name}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                                {tech.specialty.split(',')[0]}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-rose-500 italic text-[11px]">Sin asignar</span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 font-mono tabular-nums text-xs">
                          {formatCurrency(totals.total)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {ticket.isPaid ? (
                            <span className="text-emerald-700 font-bold">Pagado</span>
                          ) : (
                            <span className="text-amber-700 font-bold">Pendiente</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Notificar por WhatsApp"
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => onPrintTicket(ticket)}
                            title="Imprimir Orden"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onEditTicket(ticket)}
                            title="Editar Datos de la Orden"
                            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteTicket(ticket)}
                            title="Eliminar Orden"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onSelectTicket(ticket)}
                            className="ml-1 px-2.5 py-1 bg-slate-900 hover:bg-blue-600 text-white rounded-lg font-bold text-xs transition-colors"
                          >
                            Ver Ficha
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

    </div>
  );
};
