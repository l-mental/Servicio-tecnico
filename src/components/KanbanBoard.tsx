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
  AlertTriangle, 
  Pencil, 
  Trash2, 
  Sparkles, 
  Plus, 
  TrendingUp, 
  CheckSquare, 
  Award, 
  Users, 
  Package, 
  Layers,
  Wrench
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

  const stages: TicketStage[] = ['por_asignar', 'en_reparacion', 'en_prueba', 'entregado'];

  const getCanonicalStage = (stg: TicketStage): 'por_asignar' | 'en_reparacion' | 'en_prueba' | 'entregado' => {
    if (stg === 'entrada') return 'por_asignar';
    if (stg === 'desarmado') return 'en_reparacion';
    if (stg === 'recomposicion') return 'en_prueba';
    if (stg === 'salida') return 'entregado';
    return stg as 'por_asignar' | 'en_reparacion' | 'en_prueba' | 'entregado';
  };

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'laptop': return <Laptop className="w-4 h-4 text-sky-500" />;
      case 'smartphone': return <Smartphone className="w-4 h-4 text-emerald-500" />;
      case 'consola': return <Gamepad2 className="w-4 h-4 text-purple-500" />;
      case 'pc': return <Monitor className="w-4 h-4 text-amber-500" />;
      case 'tablet': return <Tablet className="w-4 h-4 text-teal-500" />;
      case 'smartwatch': return <Watch className="w-4 h-4 text-indigo-500" />;
      default: return <Laptop className="w-4 h-4 text-slate-500" />;
    }
  };

  const getNextStage = (current: TicketStage): TicketStage | null => {
    const c = getCanonicalStage(current);
    switch (c) {
      case 'por_asignar': return 'en_reparacion';
      case 'en_reparacion': return 'en_prueba';
      case 'en_prueba': return 'entregado';
      case 'entregado': return null;
    }
  };

  const getPrevStage = (current: TicketStage): TicketStage | null => {
    const c = getCanonicalStage(current);
    switch (c) {
      case 'por_asignar': return null;
      case 'en_reparacion': return 'por_asignar';
      case 'en_prueba': return 'en_reparacion';
      case 'entregado': return 'en_prueba';
    }
  };

  // Aggregated workshop metrics
  const totalValue = tickets.reduce((acc, t) => acc + calculateTicketTotals(t).total, 0);
  const totalLabor = tickets.reduce((acc, t) => acc + t.laborCost, 0);
  const totalParts = tickets.reduce((acc, t) => acc + calculateTicketTotals(t).partsTotal, 0);
  const urgentCount = tickets.filter(t => t.priority === 'urgente' && t.stage !== 'salida').length;
  const readyForPickup = tickets.filter(t => t.stage === 'salida' && t.status !== 'entregado').length;
  const uniqueCustomersCount = new Set(tickets.map(t => t.customer.phone || t.customer.name)).size;
  const resolvedCount = tickets.filter(t => t.stage === 'salida').length;
  const resolutionPercentage = tickets.length > 0 ? Math.round((resolvedCount / tickets.length) * 100) : 0;

  return (
    <div className="space-y-6" style={{ fontFamily: 'Arial, sans-serif' }}>
      
      {/* ========================================================= */}
      {/* TOP ROW: 3 ICONIC MATERIO BOOTSTRAP 5 HERO CARDS          */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Card 1: Congratulations John! Style (Materio Primary Hero) */}
        <div className="md:col-span-12 lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_18px_0_rgba(76,78,100,0.08)] relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1 relative z-10">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              ¡Rendimiento del Taller! <span className="text-lg">🎉</span>
            </h3>
            <p className="text-xs text-slate-500">
              Objetivo mensual de órdenes y facturación en curso
            </p>
          </div>

          <div className="my-4 relative z-10">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#8C57FF] font-mono tracking-tight">
              {formatCurrency(totalValue)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
              <span className="w-4 h-4 rounded-full bg-purple-100 text-[#8C57FF] flex items-center justify-center text-[10px] font-bold">✓</span>
              <span>84% del objetivo mensual alcanzado</span>
            </div>
          </div>

          <div className="pt-2 relative z-10">
            <button
              onClick={onOpenNewTicket}
              className="px-4 py-2 bg-[#8C57FF] hover:bg-[#7E4EE6] text-white text-xs font-bold rounded-lg shadow-md shadow-purple-500/30 transition-all uppercase tracking-wider"
            >
              + Ingresar Equipo
            </button>
          </div>

          {/* Materio Trophy Graphic Illustration on Right */}
          <div className="absolute right-4 bottom-3 opacity-90 pointer-events-none">
            <div className="w-24 h-24 rounded-full bg-amber-100/60 flex items-center justify-center">
              <Award className="w-16 h-16 text-amber-500 drop-shadow-sm" />
            </div>
          </div>
        </div>

        {/* Card 2: Transactions / Transacciones del Mes (Materio 4-Icons Row) */}
        <div className="md:col-span-12 lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_18px_0_rgba(76,78,100,0.08)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Operaciones del Taller
              </h3>
              <p className="text-xs text-slate-500">
                Crecimiento acumulado <strong className="text-emerald-600 font-semibold">+48.5% este mes</strong>
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-[#8C57FF]">
              RESUMEN EN VIVO
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            
            {/* Tile 1: Sales / Mano de Obra */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#8C57FF] flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block font-medium">Mano de Obra</span>
                <span className="text-xs font-bold font-mono text-slate-800 truncate block">
                  {formatCurrency(totalLabor)}
                </span>
              </div>
            </div>

            {/* Tile 2: Customers */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block font-medium">Clientes</span>
                <span className="text-xs font-bold font-mono text-slate-800 block">
                  {uniqueCustomersCount} pers.
                </span>
              </div>
            </div>

            {/* Tile 3: Parts / Repuestos */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block font-medium">Repuestos</span>
                <span className="text-xs font-bold font-mono text-slate-800 truncate block">
                  {formatCurrency(totalParts)}
                </span>
              </div>
            </div>

            {/* Tile 4: Total Revenue */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block font-medium">Facturación</span>
                <span className="text-xs font-bold font-mono text-slate-800 truncate block">
                  {formatCurrency(totalValue)}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Card 3: Total Profit / Beneficio & Eficiencia (Materio Sparkline Card) */}
        <div className="md:col-span-12 lg:col-span-3 bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_18px_0_rgba(76,78,100,0.08)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Tasa de Resolución</span>
              <span className="text-2xl font-black text-slate-900 font-mono">
                {resolutionPercentage}%
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
              +42% QC
            </span>
          </div>

          {/* Materio Sparkline Curve SVG */}
          <div className="py-2">
            <svg className="w-full h-12" viewBox="0 0 200 50" fill="none">
              <path
                d="M5 40 Q 40 10, 80 30 T 140 15 T 195 20"
                stroke="#8C57FF"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="195" cy="20" r="4" fill="#8C57FF" />
            </svg>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
              <span>01 Entrada</span>
              <span>02 Desarm.</span>
              <span>03 Recomp.</span>
              <span>04 Salida</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
            <span>Listos para entrega:</span>
            <span className="font-bold text-emerald-600 font-mono">{readyForPickup} equipos</span>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* FILTER & SEARCH CARD (MATERIO BOOTSTRAP 5 CONTROLS)       */}
      {/* ========================================================= */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_4px_18px_0_rgba(76,78,100,0.06)] flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código de orden, cliente, modelo de equipo o falla..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:border-[#8C57FF] focus:ring-2 focus:ring-purple-500/10 transition-all font-medium text-slate-700"
          />
        </div>

        {/* Technician Filter */}
        <select
          value={selectedTech}
          onChange={(e) => setSelectedTech(e.target.value)}
          className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-[#8C57FF] focus:outline-hidden font-medium"
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
          className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-[#8C57FF] focus:outline-hidden font-medium"
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
          className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:border-[#8C57FF] focus:outline-hidden font-medium"
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
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#9E6CFF] to-[#8C57FF] hover:from-[#9155FD] hover:to-[#7E4EE6] text-white rounded-xl font-bold text-xs shadow-md shadow-purple-500/25 transition-all shrink-0 ml-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Nueva Orden</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 4 STAGE KANBAN COLUMNS (MATERIO BOOTSTRAP 5 FLAVOR)       */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
        {stages.map((stage) => {
          const cfg = STAGE_CONFIG[stage];
          const stageTickets = filteredTickets.filter(t => getCanonicalStage(t.stage) === stage);
          const stageSubtotal = stageTickets.reduce((acc, t) => acc + calculateTicketTotals(t).fixedCost, 0);

          // Color accents per stage
          const stageColorConfig = (
            stage === 'por_asignar' ? { badge: 'bg-blue-100 text-blue-800', bar: 'bg-blue-600', border: 'border-blue-200' } :
            stage === 'en_reparacion' ? { badge: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500', border: 'border-amber-200' } :
            stage === 'en_prueba' ? { badge: 'bg-purple-100 text-purple-800', bar: 'bg-purple-500', border: 'border-purple-200' } :
            { badge: 'bg-emerald-100 text-emerald-800', bar: 'bg-emerald-500', border: 'border-emerald-200' }
          );

          return (
            <div 
              key={stage} 
              className="bg-slate-100/70 border border-slate-200/90 rounded-2xl p-3.5 flex flex-col min-h-[620px] shadow-xs"
            >
              {/* Column Header */}
              <div className="pb-3 border-b border-slate-200 mb-3 bg-white p-3 rounded-xl shadow-2xs border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center font-mono ${stageColorConfig.badge}`}>
                      0{cfg.step}
                    </span>
                    <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">
                      {cfg.name}
                    </h2>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stageColorConfig.badge}`}>
                    {stageTickets.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                  <span className="truncate pr-1">{cfg.shortDesc}</span>
                  <span className="font-mono tabular-nums shrink-0 font-bold text-slate-800">
                    {formatCurrency(stageSubtotal)}
                  </span>
                </div>

                <div className={`w-full h-1 rounded-full mt-2.5 ${stageColorConfig.bar} opacity-80`} />
              </div>

              {/* Tickets Stack */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                {stageTickets.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-xs border border-dashed border-slate-300 rounded-xl bg-white/60">
                    No hay equipos en {cfg.name.toLowerCase()}
                  </div>
                ) : (
                  stageTickets.map((ticket) => {
                    const tech = employees.find(e => e.id === ticket.assignedTechnicianId);
                    const prio = getPriorityBadge(ticket.priority);
                    const totals = calculateTicketTotals(ticket);
                    const checklistKey = (s: TicketStage) => {
                      if (s === 'por_asignar' || s === 'entrada') return 'entrada';
                      if (s === 'en_reparacion' || s === 'desarmado') return 'desarmado';
                      if (s === 'en_prueba' || s === 'recomposicion') return 'recomposicion';
                      return 'salida';
                    };
                    const currentStageChecklist = ticket.checklists[checklistKey(ticket.stage)] || [];
                    const checkedCount = currentStageChecklist.filter((c: any) => c.checked).length;
                    const nextStage = getNextStage(stage);
                    const prevStage = getPrevStage(stage);

                    return (
                      <div
                        key={ticket.id}
                        className="bg-white rounded-xl border border-slate-100 hover:border-[#8C57FF]/50 shadow-[0_2px_8px_0_rgba(76,78,100,0.06)] hover:shadow-[0_4px_16px_0_rgba(140,87,255,0.12)] transition-all p-3.5 text-xs space-y-3 relative group"
                      >
                        {/* Top: Code, Priority, and Quick Actions */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 font-mono tracking-tight text-xs">
                              {ticket.code}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="text-[11px] text-slate-500 truncate max-w-[85px] font-medium">
                              {ticket.customer.name.split(' ')[0]}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${prio.className}`}>
                              {prio.label}
                            </span>

                            {/* Action Buttons */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditTicket(ticket);
                              }}
                              title="Editar Orden Completa"
                              className="p-1 text-slate-400 hover:text-[#8C57FF] hover:bg-purple-50 rounded-lg transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTicket(ticket);
                              }}
                              title="Eliminar Orden"
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
                          <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            {getDeviceIcon(ticket.device.type)}
                            <span className="truncate hover:text-[#8C57FF] transition-colors">
                              {ticket.device.brand} {ticket.device.model}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                            {ticket.problemReported}
                          </p>
                        </div>

                        {/* Checklist progress bar */}
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Protocolo {cfg.name}:</span>
                          <span className="font-mono font-bold text-slate-700">
                            {checkedCount}/{currentStageChecklist.length} checks
                          </span>
                        </div>

                        {/* Assigned Tech & Financial Total */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {tech ? (
                              <>
                                <img
                                  src={tech.avatar}
                                  alt={tech.name}
                                  className="w-5 h-5 rounded-full object-cover border border-purple-200"
                                />
                                <span className="text-slate-600 truncate max-w-[90px] font-medium">
                                  {tech.name.split(' ')[0]}
                                </span>
                              </>
                            ) : (
                              <span className="text-amber-600 italic font-medium">Sin asignar</span>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="font-extrabold text-[#0B3558] font-mono text-xs block">
                              {formatCurrency(totals.fixedCost)}
                            </span>
                            <span className="text-[10px] text-amber-700 font-mono block">
                              Saldo: {formatCurrency(totals.pendingBalance)}
                            </span>
                          </div>
                        </div>

                        {/* Stage Stepper Navigation Buttons */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                          {prevStage ? (
                            <button
                              onClick={() => onMoveTicketStage(ticket.id, prevStage)}
                              title={`Retroceder a ${STAGE_CONFIG[prevStage].name}`}
                              className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center gap-1 transition-colors"
                            >
                              <ArrowLeft className="w-3 h-3" />
                              <span>{STAGE_CONFIG[prevStage].name}</span>
                            </button>
                          ) : <div />}

                          {nextStage ? (
                            <button
                              onClick={() => onMoveTicketStage(ticket.id, nextStage)}
                              title={`Avanzar a ${STAGE_CONFIG[nextStage].name}`}
                              className="px-2 py-1 rounded-lg bg-[#8C57FF] hover:bg-[#7E4EE6] text-white text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors ml-auto"
                            >
                              <span>Avanzar a {STAGE_CONFIG[nextStage].name}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold text-[10px] ml-auto">
                              ✓ Finalizado
                            </span>
                          )}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
