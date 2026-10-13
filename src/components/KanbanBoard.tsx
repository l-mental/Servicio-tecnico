import React, { useState } from 'react';
import { 
  Laptop, 
  Smartphone, 
  Gamepad2, 
  Monitor, 
  Tablet, 
  Watch, 
  Search, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  CheckSquare,
  AlertTriangle,
  Pencil,
  Trash2,
  MessageSquare,
  Sparkles,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Employee, Priority, Ticket, TicketStage, DeviceType } from '../types';
import { STAGE_CONFIG, formatCurrency, getPriorityBadge, calculateTicketTotals, generateWhatsAppLink } from '../utils/helpers';

interface KanbanBoardProps {
  tickets: Ticket[];
  employees: Employee[];
  onSelectTicket: (ticket: Ticket) => void;
  onEditTicket: (ticket: Ticket) => void;
  onDeleteTicket: (ticket: Ticket) => void;
  onMoveTicketStage: (ticketId: string, newStage: TicketStage) => void;
  onOpenNewTicket: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tickets,
  employees,
  onSelectTicket,
  onEditTicket,
  onDeleteTicket,
  onMoveTicketStage,
  onOpenNewTicket,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTech, setSelectedTech] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('all');

  // Filter logic
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.device.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.problemReported.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTech = selectedTech === 'all' || ticket.assignedTechnicianId === selectedTech;
    const matchesPriority = selectedPriority === 'all' || ticket.priority === selectedPriority;
    const matchesDevice = selectedDeviceType === 'all' || ticket.device.type === selectedDeviceType;

    return matchesSearch && matchesTech && matchesPriority && matchesDevice;
  });

  const stages: TicketStage[] = ['entrada', 'desarmado', 'recomposicion', 'salida'];

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'laptop': return <Laptop className="w-4 h-4 text-sky-400" />;
      case 'smartphone': return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'consola': return <Gamepad2 className="w-4 h-4 text-purple-400" />;
      case 'pc': return <Monitor className="w-4 h-4 text-amber-400" />;
      case 'tablet': return <Tablet className="w-4 h-4 text-teal-400" />;
      case 'smartwatch': return <Watch className="w-4 h-4 text-indigo-400" />;
      default: return <Laptop className="w-4 h-4 text-slate-400" />;
    }
  };

  const getNextStage = (current: TicketStage): TicketStage | null => {
    switch (current) {
      case 'entrada': return 'desarmado';
      case 'desarmado': return 'recomposicion';
      case 'recomposicion': return 'salida';
      case 'salida': return null;
    }
  };

  const getPrevStage = (current: TicketStage): TicketStage | null => {
    switch (current) {
      case 'entrada': return null;
      case 'desarmado': return 'entrada';
      case 'recomposicion': return 'desarmado';
      case 'salida': return 'recomposicion';
    }
  };

  const stageGlowStyles = {
    entrada: 'border-t-blue-500 shadow-blue-500/5',
    desarmado: 'border-t-amber-500 shadow-amber-500/5',
    recomposicion: 'border-t-indigo-500 shadow-indigo-500/5',
    salida: 'border-t-emerald-500 shadow-emerald-500/5',
  };

  // Quick stats
  const totalValue = tickets.reduce((acc, t) => acc + calculateTicketTotals(t).total, 0);
  const urgentCount = tickets.filter(t => t.priority === 'urgente' && t.stage !== 'salida').length;
  const readyForPickup = tickets.filter(t => t.stage === 'salida' && t.status !== 'entregado').length;

  return (
    <div className="space-y-6">
      
      {/* High-Impact Hero Showcase Banner (Commercial Grade) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 p-6 text-white shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-400" />
                Pipeline de Laboratorio
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-slate-300 text-xs font-mono">4 Etapas Certificadas</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
              Control de Servicio Técnico & Tareas
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Monitoreo en vivo de equipos desde <strong className="text-blue-400">Entrada</strong>, <strong className="text-amber-400">Desarmado</strong>, <strong className="text-indigo-400">Recomposición</strong> hasta <strong className="text-emerald-400">Salida y Control de Calidad</strong>.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 backdrop-blur-md">
            <div className="px-3 border-r border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Equipos Activos</span>
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {tickets.length}
              </span>
            </div>

            <div className="px-3 border-r border-slate-800">
              <span className="text-[11px] text-rose-400 block font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Urgencias
              </span>
              <span className="text-xl font-bold font-mono text-rose-400 tabular-nums">
                {urgentCount}
              </span>
            </div>

            <div className="px-3 border-r border-slate-800">
              <span className="text-[11px] text-emerald-400 block font-medium">Listos p/ Retiro</span>
              <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                {readyForPickup}
              </span>
            </div>

            <div className="px-3">
              <span className="text-[11px] text-slate-400 block font-medium">Valor en Taller</span>
              <span className="text-xl font-bold font-mono text-emerald-300 tabular-nums">
                {formatCurrency(totalValue)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código, cliente, modelo, serie o falla..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Technician Filter */}
        <select
          value={selectedTech}
          onChange={(e) => setSelectedTech(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-hidden focus:border-blue-500 font-medium"
        >
          <option value="all">Todos los técnicos ({employees.length})</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.name} ({emp.activeTicketsCount} tareas)
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-hidden focus:border-blue-500 font-medium"
        >
          <option value="all">Todas las prioridades</option>
          <option value="urgente">Urgente</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>

        {/* Device Type Filter */}
        <select
          value={selectedDeviceType}
          onChange={(e) => setSelectedDeviceType(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-hidden focus:border-blue-500 font-medium"
        >
          <option value="all">Todos los dispositivos</option>
          <option value="laptop">Laptops</option>
          <option value="smartphone">Smartphones</option>
          <option value="consola">Consolas</option>
          <option value="pc">PCs de escritorio</option>
          <option value="tablet">Tablets</option>
        </select>

        <button
          onClick={onOpenNewTicket}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs shadow-xs transition-colors shrink-0 ml-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Orden</span>
        </button>
      </div>

      {/* The 4 Stage Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {stages.map((stage) => {
          const cfg = STAGE_CONFIG[stage];
          const stageTickets = filteredTickets.filter(t => t.stage === stage);
          const stageSubtotal = stageTickets.reduce((acc, t) => acc + calculateTicketTotals(t).total, 0);

          return (
            <div 
              key={stage} 
              className={`bg-slate-100/90 border border-slate-200/90 border-t-4 ${stageGlowStyles[stage]} rounded-xl p-3 flex flex-col min-h-[580px] shadow-sm`}
            >
              {/* Column Header */}
              <div className="pb-3 border-b border-slate-200 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center font-mono">
                      0{cfg.step}
                    </span>
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                      {cfg.name}
                    </h2>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 shadow-2xs font-mono">
                    {stageTickets.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                  <span className="truncate pr-1">{cfg.shortDesc}</span>
                  <span className="font-mono tabular-nums shrink-0 font-bold text-slate-800">
                    {formatCurrency(stageSubtotal)}
                  </span>
                </div>
              </div>

              {/* Tickets Stack */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                {stageTickets.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg bg-white/50">
                    No hay equipos en {cfg.name.toLowerCase()}
                  </div>
                ) : (
                  stageTickets.map((ticket) => {
                    const tech = employees.find(e => e.id === ticket.assignedTechnicianId);
                    const prio = getPriorityBadge(ticket.priority);
                    const totals = calculateTicketTotals(ticket);
                    const currentStageChecklist = ticket.checklists[ticket.stage] || [];
                    const checkedCount = currentStageChecklist.filter(c => c.checked).length;
                    const nextStage = getNextStage(stage);
                    const prevStage = getPrevStage(stage);

                    return (
                      <div
                        key={ticket.id}
                        className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all p-3 text-xs space-y-2.5 relative group"
                      >
                        {/* Top: Code, Priority, and Quick Edit/Delete Icons */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 font-mono tracking-tight text-[11px]">
                              {ticket.code}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="text-[11px] text-slate-500 truncate max-w-[85px]">
                              {ticket.customer.name.split(' ')[0]}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${prio.className}`}>
                              {prio.label}
                            </span>

                            {/* Action Buttons: Edit and Delete */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditTicket(ticket);
                              }}
                              title="Editar Orden Completa"
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTicket(ticket);
                              }}
                              title="Eliminar Orden"
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Device Info */}
                        <div 
                          onClick={() => onSelectTicket(ticket)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            {getDeviceIcon(ticket.device.type)}
                            <span className="truncate hover:text-blue-600 transition-colors">
                              {ticket.device.brand} {ticket.device.model}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                            {ticket.problemReported}
                          </p>
                        </div>

                        {/* Checklist progress bar */}
                        {currentStageChecklist.length > 0 && (
                          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                              Checklist ({checkedCount}/{currentStageChecklist.length})
                            </span>
                            <span className="font-mono tabular-nums text-slate-700 font-semibold">
                              {Math.round((checkedCount / currentStageChecklist.length) * 100)}%
                            </span>
                          </div>
                        )}

                        {/* Footer: Technician & Price */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          {tech ? (
                            <div className="flex items-center gap-1.5 min-w-0" title={`Asignado a: ${tech.name}`}>
                              <img
                                src={tech.avatar}
                                alt={tech.name}
                                className="w-5 h-5 rounded-full object-cover shrink-0 border border-slate-200"
                              />
                              <span className="text-[11px] text-slate-700 truncate font-medium">
                                {tech.name.split(' ')[0]}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-rose-500 italic">
                              Sin técnico
                            </span>
                          )}

                          <span className="font-bold text-slate-900 font-mono tabular-nums shrink-0 text-xs">
                            {formatCurrency(totals.total)}
                          </span>
                        </div>

                        {/* Fast Advancement Controls */}
                        <div className="pt-1.5 flex items-center justify-between gap-1 border-t border-slate-100 text-[11px]">
                          {prevStage ? (
                            <button
                              onClick={() => onMoveTicketStage(ticket.id, prevStage)}
                              title={`Retroceder a ${STAGE_CONFIG[prevStage].name}`}
                              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </button>
                          ) : <div />}

                          <button
                            onClick={() => onSelectTicket(ticket)}
                            className="text-blue-600 hover:text-blue-800 font-bold px-2 py-0.5 hover:bg-blue-50 rounded transition-colors"
                          >
                            Ver Ficha 360°
                          </button>

                          {nextStage ? (
                            <button
                              onClick={() => onMoveTicketStage(ticket.id, nextStage)}
                              title={`Avanzar a ${STAGE_CONFIG[nextStage].name}`}
                              className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-blue-600 text-white rounded-md font-semibold transition-colors shadow-2xs"
                            >
                              <span>{STAGE_CONFIG[nextStage].name}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            ticket.status !== 'entregado' ? (
                              <button
                                onClick={() => onSelectTicket(ticket)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold"
                              >
                                Entregar
                              </button>
                            ) : (
                              <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Entregado
                              </span>
                            )
                          )}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

              {/* Add Ticket Shortcut in Stage 1 */}
              {stage === 'entrada' && (
                <button
                  onClick={onOpenNewTicket}
                  className="mt-3 w-full py-2.5 border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 rounded-xl text-slate-600 hover:text-blue-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                  <span>Ingresar equipo en Entrada</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
