import React, { useState } from 'react';
import { 
  Search, 
  Printer, 
  MessageSquare, 
  Filter,
  CheckCircle2,
  Clock,
  Laptop,
  Monitor,
  Volume2,
  Tv,
  Microwave,
  Coffee,
  Smartphone,
  Pencil,
  Trash2,
  Plus,
  ArrowRight,
  UserCheck,
  DollarSign,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Check,
  UserPlus
} from 'lucide-react';
import { Employee, Ticket, TicketStage, EquipmentCategory } from '../types';
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
  onMoveTicketStage?: (ticketId: string, targetStage: TicketStage) => void;
  onLiquidateBalance?: (ticket: Ticket) => void;
  onAssignTechnician?: (ticketId: string, technicianId: string) => void;
}

export const TicketList: React.FC<TicketListProps> = ({
  tickets,
  employees,
  onSelectTicket,
  onEditTicket,
  onDeleteTicket,
  onPrintTicket,
  onOpenNewTicket,
  onMoveTicketStage,
  onLiquidateBalance,
  onAssignTechnician,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | 'por_asignar' | 'en_reparacion' | 'en_prueba' | 'entregado'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'balance' | 'fixedCost'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Count tickets by stage
  const counts = {
    all: tickets.length,
    por_asignar: tickets.filter(t => t.stage === 'por_asignar' || t.stage === 'entrada').length,
    en_reparacion: tickets.filter(t => t.stage === 'en_reparacion' || t.stage === 'desarmado').length,
    en_prueba: tickets.filter(t => t.stage === 'en_prueba' || t.stage === 'recomposicion').length,
    entregado: tickets.filter(t => t.stage === 'entregado' || t.stage === 'salida').length,
  };

  const getCanonicalStage = (stg: TicketStage): 'por_asignar' | 'en_reparacion' | 'en_prueba' | 'entregado' => {
    if (stg === 'entrada') return 'por_asignar';
    if (stg === 'desarmado') return 'en_reparacion';
    if (stg === 'recomposicion') return 'en_prueba';
    if (stg === 'salida') return 'entregado';
    return stg as 'por_asignar' | 'en_reparacion' | 'en_prueba' | 'entregado';
  };

  const filtered = tickets.filter(ticket => {
    const canonical = getCanonicalStage(ticket.stage);
    const matchesStage = stageFilter === 'all' || canonical === stageFilter;

    const query = searchTerm.toLowerCase();
    const matchesSearch = 
      ticket.code.toLowerCase().includes(query) ||
      ticket.customer.name.toLowerCase().includes(query) ||
      ticket.customer.phone.includes(query) ||
      (ticket.customer.refPhone && ticket.customer.refPhone.includes(query)) ||
      (ticket.customer.documentId && ticket.customer.documentId.toLowerCase().includes(query)) ||
      ticket.device.model.toLowerCase().includes(query) ||
      ticket.device.brand.toLowerCase().includes(query) ||
      ticket.device.serialNumber.toLowerCase().includes(query);

    return matchesStage && matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'date') {
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return sortOrder === 'desc' ? diff : -diff;
    }
    if (sortBy === 'balance') {
      const balA = calculateTicketTotals(a).pendingBalance;
      const balB = calculateTicketTotals(b).pendingBalance;
      return sortOrder === 'desc' ? balB - balA : balA - balB;
    }
    if (sortBy === 'fixedCost') {
      const totA = calculateTicketTotals(a).fixedCost;
      const totB = calculateTicketTotals(b).fixedCost;
      return sortOrder === 'desc' ? totB - totA : totA - totB;
    }
    return 0;
  });

  const getEquipmentIcon = (category?: EquipmentCategory, type?: string) => {
    switch (category) {
      case 'laptop':
        return <Laptop className="w-4 h-4 text-blue-600" />;
      case 'pc':
        return <Monitor className="w-4 h-4 text-indigo-600" />;
      case 'equipo_sonido':
        return <Volume2 className="w-4 h-4 text-purple-600" />;
      case 'televisor':
        return <Tv className="w-4 h-4 text-amber-600" />;
      case 'microonda':
        return <Microwave className="w-4 h-4 text-rose-600" />;
      case 'cafeteras':
        return <Coffee className="w-4 h-4 text-emerald-600" />;
      default:
        if (type === 'smartphone') return <Smartphone className="w-4 h-4 text-cyan-600" />;
        return <Laptop className="w-4 h-4 text-slate-600" />;
    }
  };

  const getNextStage = (current: TicketStage): TicketStage | null => {
    const canonical = getCanonicalStage(current);
    if (canonical === 'por_asignar') return 'en_reparacion';
    if (canonical === 'en_reparacion') return 'en_prueba';
    if (canonical === 'en_prueba') return 'entregado';
    return null;
  };

  const stagesList: Array<{ id: 'por_asignar' | 'en_reparacion' | 'en_prueba' | 'entregado'; label: string; step: number }> = [
    { id: 'por_asignar', label: '1. Por asignar', step: 1 },
    { id: 'en_reparacion', label: '2. En reparación', step: 2 },
    { id: 'en_prueba', label: '3. En prueba', step: 3 },
    { id: 'entregado', label: '4. Entregado', step: 4 },
  ];

  return (
    <div className="space-y-5 w-full">
      
      {/* Top Banner & Quick Action */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Directorio de Órdenes de Servicio
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0B3558] border border-blue-200">
              Vista Simplificada por Listas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestione el flujo en 4 etapas (<strong>Por asignar</strong>, <strong>En reparación</strong>, <strong>En prueba</strong>, <strong>Entregado</strong>) con control de costo fijo, anticipo y cobro de saldo.
          </p>
        </div>

        <button
          onClick={onOpenNewTicket}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0B3558] to-[#144d7c] hover:from-[#082742] hover:to-[#0f3c61] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-900/20 transition-all shrink-0 active:scale-98"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Registrar Nueva Orden</span>
        </button>
      </div>

      {/* FILTER TABS: 4 STAGES */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        <button
          onClick={() => setStageFilter('all')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
            stageFilter === 'all'
              ? 'bg-[#0B3558] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>Todas las Órdenes</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${stageFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
            {counts.all}
          </span>
        </button>

        <button
          onClick={() => setStageFilter('por_asignar')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
            stageFilter === 'por_asignar'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-blue-800 hover:bg-blue-50 border border-blue-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>1. Por asignar</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${stageFilter === 'por_asignar' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'}`}>
            {counts.por_asignar}
          </span>
        </button>

        <button
          onClick={() => setStageFilter('en_reparacion')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
            stageFilter === 'en_reparacion'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>2. En reparación</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${stageFilter === 'en_reparacion' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>
            {counts.en_reparacion}
          </span>
        </button>

        <button
          onClick={() => setStageFilter('en_prueba')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
            stageFilter === 'en_prueba'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-purple-800 hover:bg-purple-50 border border-purple-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span>3. En prueba</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${stageFilter === 'en_prueba' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'}`}>
            {counts.en_prueba}
          </span>
        </button>

        <button
          onClick={() => setStageFilter('entregado')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
            stageFilter === 'entregado'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>4. Entregado</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${stageFilter === 'entregado' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
            {counts.entregado}
          </span>
        </button>
      </div>

      {/* SEARCH AND QUICK CONTROLS BAR */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Search input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por orden, cliente, CI, celular, modelo, serie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#0B3558] focus:ring-1 focus:ring-[#0B3558]"
          />
        </div>

        {/* Sorting buttons */}
        <div className="flex items-center gap-2 text-slate-500 font-medium self-end md:self-auto flex-wrap">
          <span className="text-[11px]">Ordenar por:</span>
          <button
            onClick={() => {
              if (sortBy === 'date') setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
              else { setSortBy('date'); setSortOrder('desc'); }
            }}
            className={`px-2.5 py-1 rounded-lg border text-xs transition-colors ${sortBy === 'date' ? 'bg-[#0B3558] border-[#0B3558] font-bold text-white' : 'border-slate-200 text-slate-700 bg-slate-50'}`}
          >
            Fecha {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => {
              if (sortBy === 'balance') setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
              else { setSortBy('balance'); setSortOrder('desc'); }
            }}
            className={`px-2.5 py-1 rounded-lg border text-xs transition-colors ${sortBy === 'balance' ? 'bg-amber-600 border-amber-600 font-bold text-white' : 'border-slate-200 text-slate-700 bg-slate-50'}`}
          >
            Saldo Pendiente {sortBy === 'balance' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => {
              if (sortBy === 'fixedCost') setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
              else { setSortBy('fixedCost'); setSortOrder('desc'); }
            }}
            className={`px-2.5 py-1 rounded-lg border text-xs transition-colors ${sortBy === 'fixedCost' ? 'bg-blue-600 border-blue-600 font-bold text-white' : 'border-slate-200 text-slate-700 bg-slate-50'}`}
          >
            Costo Fijo {sortBy === 'fixedCost' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
        </div>

      </div>

      {/* MAIN LIST TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B3558] text-white font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3.5">Nº Orden & Ingreso</th>
                <th className="py-3 px-3.5">Cliente & Contacto</th>
                <th className="py-3 px-3.5">Equipo & Problema</th>
                <th className="py-3 px-3.5">Etapa Actual (Avance Fácil)</th>
                <th className="py-3 px-3.5">Técnico</th>
                <th className="py-3 px-3.5">Costo / Anticipo / Saldo</th>
                <th className="py-3 px-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-sm text-slate-600">No se encontraron órdenes registradas</p>
                    <p className="text-xs text-slate-400 mt-0.5">Pruebe ajustando los filtros o registre una nueva orden técnica.</p>
                  </td>
                </tr>
              ) : (
                sorted.map((ticket) => {
                  const tech = employees.find(e => e.id === ticket.assignedTechnicianId);
                  const prio = getPriorityBadge(ticket.priority);
                  const totals = calculateTicketTotals(ticket);
                  const canonical = getCanonicalStage(ticket.stage);
                  const nextStage = getNextStage(ticket.stage);
                  const whatsappUrl = generateWhatsAppLink(ticket);

                  return (
                    <tr 
                      key={ticket.id} 
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                      onClick={() => onSelectTicket(ticket)}
                    >
                      {/* 1. CODE & DATE */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="font-black text-[#0B3558] font-mono text-xs">
                          {ticket.code}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${prio.className}`}>
                            {prio.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatDate(ticket.createdAt)}
                          </span>
                        </div>
                      </td>

                      {/* 2. CUSTOMER & PHONE */}
                      <td className="py-3.5 px-3.5">
                        <div className="font-bold text-slate-900 text-xs">
                          {ticket.customer.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <span>📱 {ticket.customer.phone}</span>
                          {ticket.customer.refPhone && (
                            <span className="text-slate-400 text-[10px]" title="Teléfono de referencia">
                              (Ref: {ticket.customer.refPhone})
                            </span>
                          )}
                        </div>
                        {ticket.customer.documentId && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            CI: {ticket.customer.documentId}
                          </div>
                        )}
                      </td>

                      {/* 3. DEVICE & PROBLEM */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          {getEquipmentIcon(ticket.device.equipmentCategory, ticket.device.type)}
                          <span className="truncate max-w-[190px]">
                            {ticket.device.brand} {ticket.device.model}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[210px] mt-0.5" title={ticket.problemReported}>
                          {ticket.problemReported}
                        </div>
                        {ticket.device.serialNumber && (
                          <div className="text-[9.5px] text-slate-400 font-mono">
                            S/N: {ticket.device.serialNumber}
                          </div>
                        )}
                      </td>

                      {/* 4. ETAPAS CON AVANCE FÁCIL (SOLICITUD EXPLÍCITA DEL USUARIO) */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-1.5 min-w-[210px]">
                          
                          {/* Mini Stepper 4 Etapas */}
                          <div className="flex items-center gap-1">
                            {stagesList.map((st, idx) => {
                              const isActive = canonical === st.id;
                              const isPast = stagesList.findIndex(s => s.id === canonical) > idx;

                              return (
                                <button
                                  key={st.id}
                                  onClick={() => onMoveTicketStage && onMoveTicketStage(ticket.id, st.id)}
                                  title={`Cambiar directamente a ${st.label}`}
                                  className={`h-2 flex-1 rounded-full transition-all ${
                                    isActive
                                      ? st.id === 'entregado' ? 'bg-emerald-500 ring-2 ring-emerald-300' :
                                        st.id === 'en_prueba' ? 'bg-purple-500 ring-2 ring-purple-300' :
                                        st.id === 'en_reparacion' ? 'bg-amber-500 ring-2 ring-amber-300' :
                                        'bg-blue-500 ring-2 ring-blue-300'
                                      : isPast
                                      ? 'bg-slate-400'
                                      : 'bg-slate-200 hover:bg-slate-300'
                                  }`}
                                />
                              );
                            })}
                          </div>

                          {/* Stage Pill + Quick Advance Button */}
                          <div className="flex items-center justify-between gap-1.5 mt-0.5">
                            
                            {/* Current Stage Label */}
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                              canonical === 'por_asignar' ? 'bg-blue-100 text-blue-800' :
                              canonical === 'en_reparacion' ? 'bg-amber-100 text-amber-800' :
                              canonical === 'en_prueba' ? 'bg-purple-100 text-purple-800' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              {canonical === 'por_asignar' && '1. Por asignar'}
                              {canonical === 'en_reparacion' && '2. En reparación'}
                              {canonical === 'en_prueba' && '3. En prueba'}
                              {canonical === 'entregado' && '4. Entregado'}
                            </span>

                            {/* Easy Advance Button (1 Clic) */}
                            {nextStage ? (
                              <button
                                onClick={() => onMoveTicketStage && onMoveTicketStage(ticket.id, nextStage)}
                                title={`Avanzar a ${STAGE_CONFIG[nextStage].name}`}
                                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0B3558] hover:bg-blue-900 text-white text-[10px] font-bold shadow-2xs transition-colors shrink-0"
                              >
                                <span>Avanzar</span>
                                <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                              </button>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <Check className="w-3 h-3 stroke-[3]" />
                                Finalizado
                              </span>
                            )}

                          </div>
                        </div>
                      </td>

                      {/* 5. TECHNICIAN ASSIGNED */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {tech ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={tech.avatar}
                              alt={tech.name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-800 text-xs truncate max-w-[120px]">
                                {tech.name.split(' ')[0]} {tech.name.split(' ')[1] || ''}
                              </div>
                              <div className="text-[10px] text-slate-400 capitalize">
                                {tech.roleLabel.split(' ')[0]}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <select
                              onChange={(e) => {
                                if (e.target.value && onAssignTechnician) {
                                  onAssignTechnician(ticket.id, e.target.value);
                                }
                              }}
                              defaultValue=""
                              className="text-[10px] px-2 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold focus:outline-hidden"
                            >
                              <option value="" disabled>+ Asignar Técnico</option>
                              {employees.filter(e => e.role === 'tecnico' || e.role === 'supervisor').map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </td>

                      {/* 6. FINANCIAL: COSTO FIJO / ANTICIPO / SALDO PENDIENTE */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-0.5">
                          
                          {/* Costo Fijo */}
                          <div className="flex items-center justify-between gap-3 text-[10px]">
                            <span className="text-slate-400">Costo Fijo:</span>
                            <span className="font-mono font-bold text-slate-800">
                              {formatCurrency(totals.fixedCost)}
                            </span>
                          </div>

                          {/* Anticipo Inicial */}
                          <div className="flex items-center justify-between gap-3 text-[10px]">
                            <span className="text-emerald-700">Anticipo:</span>
                            <span className="font-mono font-bold text-emerald-700">
                              {formatCurrency(totals.advancePayment)}
                            </span>
                          </div>

                          {/* Saldo Pendiente */}
                          <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-slate-100">
                            <span className="text-[10px] font-bold text-amber-800">Saldo:</span>
                            {totals.pendingBalance > 0 && !ticket.isPaid ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-black text-amber-700 text-xs">
                                  {formatCurrency(totals.pendingBalance)}
                                </span>
                                {onLiquidateBalance && (
                                  <button
                                    onClick={() => onLiquidateBalance(ticket)}
                                    title="Cobrar saldo y liquidar orden"
                                    className="px-1.5 py-0.5 bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-bold rounded shadow-2xs transition-colors"
                                  >
                                    Cobrar
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                                Liquidado (0 Bs.)
                              </span>
                            )}
                          </div>

                        </div>
                      </td>

                      {/* 7. ACTIONS: PRINT SCANTEC, WHATSAPP, EDIT, DELETE */}
                      <td className="py-3.5 px-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Print Scantec Receipt */}
                          <button
                            onClick={() => onPrintTicket(ticket)}
                            title="Imprimir Nota de Recepción SCANTEC"
                            className="p-1.5 bg-blue-50 text-[#0B3558] hover:bg-[#0B3558] hover:text-white rounded-lg transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* WhatsApp Client Notification */}
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Notificar por WhatsApp con saldo"
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>

                          {/* Edit order */}
                          <button
                            onClick={() => onEditTicket(ticket)}
                            title="Editar datos de la orden"
                            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Delete order */}
                          <button
                            onClick={() => onDeleteTicket(ticket)}
                            title="Eliminar orden"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {/* View details */}
                          <button
                            onClick={() => onSelectTicket(ticket)}
                            className="ml-1 px-2.5 py-1 bg-slate-100 hover:bg-[#0B3558] text-slate-700 hover:text-white rounded-lg font-bold text-[11px] transition-colors"
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
