import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Wrench, 
  Package, 
  FileText, 
  User, 
  Plus, 
  Trash2, 
  AlertCircle,
  ShieldCheck,
  CheckSquare,
  History,
  Save,
  Pencil,
  AlertTriangle
} from 'lucide-react';
import { 
  ChecklistItem, 
  Employee, 
  InventoryItem, 
  Ticket, 
  TicketStage, 
  TimelineEvent, 
  UsedPart 
} from '../types';
import { 
  STAGE_CONFIG, 
  formatCurrency, 
  formatDateTime, 
  getPriorityBadge, 
  calculateTicketTotals, 
  generateWhatsAppLink 
} from '../utils/helpers';

interface TicketModalProps {
  ticket: Ticket;
  employees: Employee[];
  inventory: InventoryItem[];
  currentUser: Employee;
  isOpen: boolean;
  onClose: () => void;
  onSaveTicket: (updatedTicket: Ticket) => void;
  onEditTicket: (ticket: Ticket) => void;
  onDeleteTicket: (ticket: Ticket) => void;
  onPrintTicket: (ticket: Ticket) => void;
  onDeductInventory?: (itemId: string, qty: number) => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  ticket,
  employees,
  inventory,
  currentUser,
  isOpen,
  onClose,
  onSaveTicket,
  onEditTicket,
  onDeleteTicket,
  onPrintTicket,
  onDeductInventory,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'flow' | 'staff' | 'parts' | 'history' | 'device'>('flow');
  const [currentTicket, setCurrentTicket] = useState<Ticket>({ ...ticket });
  const [newNote, setNewNote] = useState('');
  const [selectedInventoryId, setSelectedInventoryId] = useState<string>('');
  const [partQuantity, setPartQuantity] = useState<number>(1);
  const [customPartName, setCustomPartName] = useState('');
  const [customPartCost, setCustomPartCost] = useState<number>(0);
  const [customPartPrice, setCustomPartPrice] = useState<number>(0);
  const [advanceNotes, setAdvanceNotes] = useState('');
  const [showAdvancePrompt, setShowAdvancePrompt] = useState(false);
  const [newChecklistLabel, setNewChecklistLabel] = useState('');

  const stages: TicketStage[] = ['entrada', 'desarmado', 'recomposicion', 'salida'];
  const totals = calculateTicketTotals(currentTicket);
  const assignedTech = employees.find(e => e.id === currentTicket.assignedTechnicianId);

  // Handle stage change with audit log
  const handleStageChange = (newStage: TicketStage, note?: string) => {
    const prevStage = currentTicket.stage;
    const now = new Date().toISOString();

    const newEvent: TimelineEvent = {
      id: `tm-${Date.now()}`,
      timestamp: now,
      authorName: currentUser.name,
      authorRole: currentUser.roleLabel,
      actionType: newStage === 'salida' ? 'qc_aprobado' : 'cambio_etapa',
      title: `Transición de ${STAGE_CONFIG[prevStage].name} a ${STAGE_CONFIG[newStage].name}`,
      description: note || `Etapa actualizada a ${STAGE_CONFIG[newStage].name} por ${currentUser.name}.`,
      stage: newStage,
    };

    const updated: Ticket = {
      ...currentTicket,
      stage: newStage,
      status: newStage === 'salida' ? 'listo_entrega' : 'en_progreso',
      updatedAt: now,
      timeline: [newEvent, ...currentTicket.timeline],
    };

    setCurrentTicket(updated);
    onSaveTicket(updated);
    setShowAdvancePrompt(false);
    setAdvanceNotes('');
  };

  // Toggle checklist item
  const handleToggleChecklist = (stage: TicketStage, itemId: string) => {
    const stageItems = currentTicket.checklists[stage] || [];
    const updatedItems = stageItems.map(item => 
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );

    const updated: Ticket = {
      ...currentTicket,
      checklists: {
        ...currentTicket.checklists,
        [stage]: updatedItems,
      },
      updatedAt: new Date().toISOString(),
    };

    setCurrentTicket(updated);
    onSaveTicket(updated);
  };

  // Add custom checklist task
  const handleAddChecklistItem = (stage: TicketStage) => {
    if (!newChecklistLabel.trim()) return;

    const newItem: ChecklistItem = {
      id: `chk-${Date.now()}`,
      label: newChecklistLabel.trim(),
      checked: false,
    };

    const updatedItems = [...(currentTicket.checklists[stage] || []), newItem];
    const updated: Ticket = {
      ...currentTicket,
      checklists: {
        ...currentTicket.checklists,
        [stage]: updatedItems,
      },
      updatedAt: new Date().toISOString(),
    };

    setCurrentTicket(updated);
    onSaveTicket(updated);
    setNewChecklistLabel('');
  };

  // Remove checklist item
  const handleRemoveChecklistItem = (stage: TicketStage, itemId: string) => {
    const stageItems = currentTicket.checklists[stage] || [];
    const updatedItems = stageItems.filter(item => item.id !== itemId);

    const updated: Ticket = {
      ...currentTicket,
      checklists: {
        ...currentTicket.checklists,
        [stage]: updatedItems,
      },
      updatedAt: new Date().toISOString(),
    };

    setCurrentTicket(updated);
    onSaveTicket(updated);
  };

  // Add parts from inventory
  const handleAddInventoryPart = () => {
    if (!selectedInventoryId) return;
    const invItem = inventory.find(i => i.id === selectedInventoryId);
    if (!invItem) return;

    const newPart: UsedPart = {
      id: `part-${Date.now()}`,
      inventoryItemId: invItem.id,
      name: invItem.name,
      quantity: partQuantity,
      unitCost: invItem.cost,
      unitPrice: invItem.price,
    };

    const now = new Date().toISOString();
    const newEvent: TimelineEvent = {
      id: `tm-${Date.now()}`,
      timestamp: now,
      authorName: currentUser.name,
      authorRole: currentUser.roleLabel,
      actionType: 'repuesto_agregado',
      title: `Repuesto añadido: ${invItem.name}`,
      description: `${partQuantity} unidad(es) de ${invItem.name} aplicada(s) al equipo.`,
      stage: currentTicket.stage,
    };

    const updatedParts = [...currentTicket.parts, newPart];
    const updated: Ticket = {
      ...currentTicket,
      parts: updatedParts,
      updatedAt: now,
      timeline: [newEvent, ...currentTicket.timeline],
    };

    if (onDeductInventory) {
      onDeductInventory(invItem.id, partQuantity);
    }

    setCurrentTicket(updated);
    onSaveTicket(updated);
    setSelectedInventoryId('');
    setPartQuantity(1);
  };

  // Add custom part
  const handleAddCustomPart = () => {
    if (!customPartName) return;

    const newPart: UsedPart = {
      id: `part-${Date.now()}`,
      name: customPartName,
      quantity: partQuantity,
      unitCost: Number(customPartCost) || 0,
      unitPrice: Number(customPartPrice) || 0,
    };

    const updatedParts = [...currentTicket.parts, newPart];
    const updated: Ticket = {
      ...currentTicket,
      parts: updatedParts,
      updatedAt: new Date().toISOString(),
    };

    setCurrentTicket(updated);
    onSaveTicket(updated);
    setCustomPartName('');
    setCustomPartCost(0);
    setCustomPartPrice(0);
    setPartQuantity(1);
  };

  // Remove part
  const handleRemovePart = (partId: string) => {
    const updatedParts = currentTicket.parts.filter(p => p.id !== partId);
    const updated: Ticket = {
      ...currentTicket,
      parts: updatedParts,
      updatedAt: new Date().toISOString(),
    };
    setCurrentTicket(updated);
    onSaveTicket(updated);
  };

  // Add internal note to timeline
  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const now = new Date().toISOString();
    const newEvent: TimelineEvent = {
      id: `tm-${Date.now()}`,
      timestamp: now,
      authorName: currentUser.name,
      authorRole: currentUser.roleLabel,
      actionType: 'nota',
      title: 'Nota interna añadida',
      description: newNote.trim(),
      stage: currentTicket.stage,
    };

    const updated: Ticket = {
      ...currentTicket,
      notes: [newNote.trim(), ...currentTicket.notes],
      timeline: [newEvent, ...currentTicket.timeline],
      updatedAt: now,
    };

    setCurrentTicket(updated);
    onSaveTicket(updated);
    setNewNote('');
  };

  // Reassign technician
  const handleAssignTech = (techId: string) => {
    const tech = employees.find(e => e.id === techId);
    const now = new Date().toISOString();
    const newEvent: TimelineEvent = {
      id: `tm-${Date.now()}`,
      timestamp: now,
      authorName: currentUser.name,
      authorRole: currentUser.roleLabel,
      actionType: 'asignacion',
      title: `Reasignación de técnico`,
      description: tech ? `Orden asignada a ${tech.name} (${tech.specialty}).` : 'Orden dejada sin asignar.',
      stage: currentTicket.stage,
    };

    const updated: Ticket = {
      ...currentTicket,
      assignedTechnicianId: techId || undefined,
      updatedAt: now,
      timeline: [newEvent, ...currentTicket.timeline],
    };

    setCurrentTicket(updated);
    onSaveTicket(updated);
  };

  const getNextStageName = (s: TicketStage): TicketStage | null => {
    if (s === 'entrada') return 'desarmado';
    if (s === 'desarmado') return 'recomposicion';
    if (s === 'recomposicion') return 'salida';
    return null;
  };

  const nextStage = getNextStageName(currentTicket.stage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Top Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 font-bold font-mono text-sm shadow-md">
              TCK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold font-mono tracking-tight text-white">
                  {currentTicket.code}
                </h2>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${getPriorityBadge(currentTicket.priority).className}`}>
                  {getPriorityBadge(currentTicket.priority).label}
                </span>
                <span className="text-slate-400 text-xs">
                  · Ingreso {formatDateTime(currentTicket.createdAt)}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                {currentTicket.device.brand} {currentTicket.device.model} — {currentTicket.customer.name}
              </p>
            </div>
          </div>

          {/* Top Quick Actions: Edit, Delete, Print, WhatsApp */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onEditTicket(currentTicket)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold transition-all"
              title="Modificar todos los datos del ticket"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>

            <button
              onClick={() => onDeleteTicket(currentTicket)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all"
              title="Eliminar orden permanentemente"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar</span>
            </button>

            <a
              href={generateWhatsAppLink(currentTicket)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
              title="Enviar actualización al cliente"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            <button
              onClick={() => onPrintTicket(currentTicket)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4-Stage Stepper Ribbon */}
        <div className="bg-slate-50 border-b border-slate-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-4 gap-2">
              {stages.map((stg) => {
                const cfg = STAGE_CONFIG[stg];
                const isCurrent = currentTicket.stage === stg;
                const isPast = stages.indexOf(stg) < stages.indexOf(currentTicket.stage);

                return (
                  <button
                    key={stg}
                    onClick={() => {
                      if (stg !== currentTicket.stage) {
                        handleStageChange(stg);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? 'bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                        : isPast
                        ? 'bg-white/80 border-slate-200 text-slate-600'
                        : 'bg-slate-100/60 border-slate-200/60 text-slate-400 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : isPast
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        0{cfg.step}
                      </span>
                      {isPast && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </div>
                    <div className={`font-bold text-xs mt-1.5 truncate ${isCurrent ? 'text-blue-900' : 'text-slate-800'}`}>
                      {cfg.name}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate hidden sm:block">
                      {cfg.shortDesc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Next Stage Action Bar */}
            {nextStage && (
              <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">
                  Etapa actual: <strong className="text-slate-900">{STAGE_CONFIG[currentTicket.stage].name}</strong> ({STAGE_CONFIG[currentTicket.stage].description})
                </span>
                <button
                  onClick={() => setShowAdvancePrompt(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                >
                  <span>Avanzar a {STAGE_CONFIG[nextStage].name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-white text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('flow')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'flow'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Checklists & Diagnóstico</span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'staff'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Técnico & Horas ({currentTicket.timeSpentMinutes}m)</span>
          </button>

          <button
            onClick={() => setActiveTab('parts')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'parts'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Repuestos & Cobro ({currentTicket.parts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historial Auditado ({currentTicket.timeline.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('device')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'device'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Ficha del Cliente</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* TAB 1: FLOW & CHECKLISTS */}
          {activeTab === 'flow' && (
            <div className="space-y-6">
              
              {/* Dynamic Checklist with Add/Remove capability */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center font-mono">
                      0{STAGE_CONFIG[currentTicket.stage].step}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Checklist Técnico de {STAGE_CONFIG[currentTicket.stage].name}
                    </h3>
                  </div>
                  <span className="text-slate-500 text-[11px]">
                    Validaciones del procedimiento de mantenimiento
                  </span>
                </div>

                <div className="space-y-2">
                  {currentTicket.checklists[currentTicket.stage]?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors group"
                    >
                      <label className="flex items-start gap-3 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => handleToggleChecklist(currentTicket.stage, item.id)}
                          className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className={`leading-relaxed ${item.checked ? 'text-slate-900 font-medium line-through opacity-70' : 'text-slate-800'}`}>
                          {item.label}
                        </span>
                      </label>
                      <button
                        onClick={() => handleRemoveChecklistItem(currentTicket.stage, item.id)}
                        className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        title="Eliminar tarea de validación"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Custom Checklist Item */}
                <div className="mt-3 pt-3 border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    placeholder="Agregar nueva validación técnica personalizada a esta etapa..."
                    value={newChecklistLabel}
                    onChange={(e) => setNewChecklistLabel(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem(currentTicket.stage)}
                    className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    onClick={() => handleAddChecklistItem(currentTicket.stage)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold"
                  >
                    + Agregar
                  </button>
                </div>
              </div>

              {/* Technical Diagnosis & Applied Solution text fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-blue-600" />
                    Diagnóstico Técnico Detallado (Desarmado)
                  </label>
                  <textarea
                    rows={4}
                    value={currentTicket.technicalDiagnosis || ''}
                    onChange={(e) => {
                      const updated = { ...currentTicket, technicalDiagnosis: e.target.value };
                      setCurrentTicket(updated);
                    }}
                    onBlur={() => onSaveTicket(currentTicket)}
                    placeholder="Escriba los hallazgos en laboratorio..."
                    className="w-full p-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-hidden leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Solución / Procedimiento Aplicado (Recomposición)
                  </label>
                  <textarea
                    rows={4}
                    value={currentTicket.solutionApplied || ''}
                    onChange={(e) => {
                      const updated = { ...currentTicket, solutionApplied: e.target.value };
                      setCurrentTicket(updated);
                    }}
                    onBlur={() => onSaveTicket(currentTicket)}
                    placeholder="Describa el trabajo de recomposición ejecutado..."
                    className="w-full p-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-hidden leading-relaxed"
                  />
                </div>
              </div>

              {/* Problem Reported Overview Box */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl">
                <span className="font-bold text-amber-900 block mb-1">
                  Falla Original Reportada por el Cliente al Ingresar:
                </span>
                <p className="text-amber-800 leading-relaxed">
                  {currentTicket.problemReported}
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: STAFF & SCHEDULE */}
          {activeTab === 'staff' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assigned Technician Selector */}
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Asignación del Técnico Responsable
                  </h3>
                  
                  <div>
                    <label className="text-slate-600 block mb-1.5">
                      Seleccionar técnico:
                    </label>
                    <select
                      value={currentTicket.assignedTechnicianId || ''}
                      onChange={(e) => handleAssignTech(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:border-blue-500 focus:outline-hidden"
                    >
                      <option value="">-- Sin técnico asignado --</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.roleLabel} · {emp.activeTicketsCount} tareas activas)
                        </option>
                      ))}
                    </select>
                  </div>

                  {assignedTech && (
                    <div className="p-3.5 bg-white rounded-lg border border-slate-200 flex items-start gap-3">
                      <img
                        src={assignedTech.avatar}
                        alt={assignedTech.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 text-xs">
                          {assignedTech.name}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          {assignedTech.specialty}
                        </div>
                        <div className="text-slate-600 text-[11px] font-medium">
                          Horario: {assignedTech.shift.startTime} a {assignedTech.shift.endTime} ({assignedTech.shift.name})
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Time Invested & Turnaround */}
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Tiempo de Labor Invertido
                  </h3>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white border border-slate-200 rounded-lg text-center flex-1">
                      <span className="text-[11px] text-slate-400 block">Tiempo Acumulado</span>
                      <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                        {currentTicket.timeSpentMinutes} mins
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        ({(currentTicket.timeSpentMinutes / 60).toFixed(1)} horas)
                      </span>
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <span className="text-[11px] text-slate-500 block">Sumar tiempo de trabajo:</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            const updated = { ...currentTicket, timeSpentMinutes: currentTicket.timeSpentMinutes + 15 };
                            setCurrentTicket(updated);
                            onSaveTicket(updated);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded font-semibold text-xs"
                        >
                          +15m
                        </button>
                        <button
                          onClick={() => {
                            const updated = { ...currentTicket, timeSpentMinutes: currentTicket.timeSpentMinutes + 30 };
                            setCurrentTicket(updated);
                            onSaveTicket(updated);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded font-semibold text-xs"
                        >
                          +30m
                        </button>
                        <button
                          onClick={() => {
                            const updated = { ...currentTicket, timeSpentMinutes: currentTicket.timeSpentMinutes + 60 };
                            setCurrentTicket(updated);
                            onSaveTicket(updated);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded font-semibold text-xs"
                        >
                          +1h
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Estimated Delivery Date */}
                  <div>
                    <label className="text-slate-600 block mb-1">
                      Fecha Estimada de Entrega:
                    </label>
                    <input
                      type="date"
                      value={currentTicket.estimatedDeliveryDate || ''}
                      onChange={(e) => {
                        const updated = { ...currentTicket, estimatedDeliveryDate: e.target.value };
                        setCurrentTicket(updated);
                        onSaveTicket(updated);
                      }}
                      className="p-2 border border-slate-300 rounded-lg bg-white w-full text-xs font-mono"
                    />
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 3: PARTS & FINANCIALS */}
          {activeTab === 'parts' && (
            <div className="space-y-6">
              
              {/* Add Part from Catalog Form */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-blue-600" />
                  Agregar Repuesto desde Inventario
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <select
                      value={selectedInventoryId}
                      onChange={(e) => setSelectedInventoryId(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs font-medium"
                    >
                      <option value="">-- Seleccionar repuesto en stock --</option>
                      {inventory.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.name} (Stock: {inv.stock} | Precio: {formatCurrency(inv.price)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      value={partQuantity}
                      onChange={(e) => setPartQuantity(Number(e.target.value))}
                      className="w-20 p-2 rounded-lg border border-slate-300 bg-white text-xs font-mono"
                      placeholder="Cant."
                    />
                    <button
                      onClick={handleAddInventoryPart}
                      disabled={!selectedInventoryId}
                      className="flex-1 px-3 py-2 bg-blue-600 disabled:opacity-50 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir</span>
                    </button>
                  </div>
                </div>

                {/* Custom part toggle */}
                <details className="text-[11px] text-slate-600 cursor-pointer pt-1">
                  <summary className="font-semibold text-blue-600 hover:text-blue-800">
                    + O añadir repuesto no catalogado manualmente
                  </summary>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mt-2 pt-2 border-t border-slate-200">
                    <input
                      type="text"
                      placeholder="Nombre del componente..."
                      value={customPartName}
                      onChange={(e) => setCustomPartName(e.target.value)}
                      className="p-1.5 border border-slate-300 rounded bg-white text-xs sm:col-span-2"
                    />
                    <input
                      type="number"
                      placeholder="Precio Venta ($)"
                      value={customPartPrice || ''}
                      onChange={(e) => setCustomPartPrice(Number(e.target.value))}
                      className="p-1.5 border border-slate-300 rounded bg-white text-xs font-mono"
                    />
                    <button
                      onClick={handleAddCustomPart}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded font-medium"
                    >
                      Registrar
                    </button>
                  </div>
                </details>
              </div>

              {/* Parts Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Repuesto / Material</th>
                      <th className="p-3 text-center">Cant.</th>
                      <th className="p-3 text-right">Precio Unit.</th>
                      <th className="p-3 text-right">Subtotal</th>
                      <th className="p-3 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentTicket.parts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400">
                          No se han cargado repuestos a esta orden todavía.
                        </td>
                      </tr>
                    ) : (
                      currentTicket.parts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-3 font-medium text-slate-900">{p.name}</td>
                          <td className="p-3 text-center font-mono tabular-nums">{p.quantity}</td>
                          <td className="p-3 text-right font-mono tabular-nums">{formatCurrency(p.unitPrice)}</td>
                          <td className="p-3 text-right font-bold text-slate-900 font-mono tabular-nums">
                            {formatCurrency(p.unitPrice * p.quantity)}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleRemovePart(p.id)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                              title="Eliminar repuesto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Financial Settlement */}
              <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center shadow-lg">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Costo Mano de Obra:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">$</span>
                      <input
                        type="number"
                        value={currentTicket.laborCost}
                        onChange={(e) => {
                          const updated = { ...currentTicket, laborCost: Number(e.target.value) || 0 };
                          setCurrentTicket(updated);
                        }}
                        onBlur={() => onSaveTicket(currentTicket)}
                        className="w-24 p-1 bg-slate-800 border border-slate-700 rounded text-right font-mono text-white text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Total en Repuestos:</span>
                    <span className="font-mono tabular-nums text-slate-200">
                      {formatCurrency(totals.partsTotal)}
                    </span>
                  </div>

                  <div className="h-px bg-slate-800" />

                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-white">TOTAL A LIQUIDAR:</span>
                    <span className="font-extrabold font-mono text-emerald-400 text-lg">
                      {formatCurrency(totals.total)}
                    </span>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="p-3.5 bg-slate-800/80 rounded-xl space-y-3 border border-slate-700 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Estado de Cobro:</span>
                    <button
                      onClick={() => {
                        const updated = { ...currentTicket, isPaid: !currentTicket.isPaid };
                        setCurrentTicket(updated);
                        onSaveTicket(updated);
                      }}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                        currentTicket.isPaid
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}
                    >
                      {currentTicket.isPaid ? 'PAGADO' : 'PENDIENTE'}
                    </button>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 text-[11px]">Método de Pago:</label>
                    <select
                      value={currentTicket.paymentMethod || 'pendiente'}
                      onChange={(e) => {
                        const updated = { ...currentTicket, paymentMethod: e.target.value as any };
                        setCurrentTicket(updated);
                        onSaveTicket(updated);
                      }}
                      className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    >
                      <option value="pendiente">Pendiente de cobro</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta Débito/Crédito</option>
                      <option value="transferencia">Transferencia bancaria / QR</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Garantía:</span>
                    <span className="font-bold text-slate-200">{currentTicket.warrantyDays} días</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: HISTORY & AUDIT TRAIL */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              
              {/* Add Note Form */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 block">
                  Añadir Nota o Evento al Historial de la Orden
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escriba comentario interno (ej. Se llamó a cliente para autorizar repuesto adicional)..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    className="flex-1 p-2 rounded-lg border border-slate-300 bg-white text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors shrink-0"
                  >
                    Registrar Nota
                  </button>
                </div>
              </div>

              {/* Timeline Stream */}
              <div className="relative pl-6 space-y-4 border-l-2 border-slate-200">
                {currentTicket.timeline.map((evt) => (
                  <div key={evt.id} className="relative group">
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-white" />
                    
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 text-xs">
                          {evt.title}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {formatDateTime(evt.timestamp)}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        {evt.description}
                      </p>
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
                        <span>Por: <strong className="text-slate-700">{evt.authorName}</strong> ({evt.authorRole})</span>
                        {evt.stage && (
                          <span className="uppercase font-mono text-[9px] px-1 py-0.5 rounded bg-slate-100 text-slate-600">
                            {STAGE_CONFIG[evt.stage].name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 5: CUSTOMER & DEVICE FULL SPECS */}
          {activeTab === 'device' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Customer Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600" />
                  Datos del Propietario
                </h3>

                <div className="space-y-2.5 bg-white p-3.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Nombre Completo</span>
                    <span className="font-bold text-slate-900 text-xs">{currentTicket.customer.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Teléfono / WhatsApp</span>
                    <a
                      href={generateWhatsAppLink(currentTicket)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-emerald-600 hover:text-emerald-700 font-mono text-xs flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {currentTicket.customer.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Documento de Identidad</span>
                    <span className="font-mono text-slate-800 text-xs">{currentTicket.customer.documentId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Correo Electrónico</span>
                    <span className="text-slate-800 text-xs">{currentTicket.customer.email}</span>
                  </div>
                  {currentTicket.customer.address && (
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-bold">Dirección</span>
                      <span className="text-slate-800 text-xs">{currentTicket.customer.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Device Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  Especificaciones del Equipo
                </h3>

                <div className="space-y-2.5 bg-white p-3.5 rounded-lg border border-slate-200">
                  <div className="flex justify-between">
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-bold">Marca & Modelo</span>
                      <span className="font-bold text-slate-900 text-xs">
                        {currentTicket.device.brand} {currentTicket.device.model}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-bold">Tipo</span>
                      <span className="capitalize font-bold text-slate-800 text-xs">{currentTicket.device.type}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Número de Serie (S/N)</span>
                    <span className="font-mono text-slate-900 font-bold text-xs">{currentTicket.device.serialNumber}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Clave / PIN de Acceso</span>
                    <span className="font-mono text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded text-xs inline-block">
                      {currentTicket.device.securityCode || 'Sin clave'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Accesorios Recibidos</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentTicket.device.accessories.map((acc, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {acc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Condición Física Inicial</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentTicket.device.physicalCondition.map((cond, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-medium">
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Última actualización: <span className="font-mono text-slate-800">{formatDateTime(currentTicket.updatedAt)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded-lg text-xs transition-colors"
            >
              Cerrar
            </button>

            <button
              onClick={() => {
                onSaveTicket(currentTicket);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Ficha</span>
            </button>
          </div>
        </div>

      </div>

      {/* Advance Stage Prompt Dialog */}
      {showAdvancePrompt && nextStage && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-base">
              Avanzar a {STAGE_CONFIG[nextStage].name} (Paso {STAGE_CONFIG[nextStage].step}/4)
            </h3>
            <p className="text-xs text-slate-600">
              ¿Confirma que la etapa previa ({STAGE_CONFIG[currentTicket.stage].name}) ha cumplido con los requisitos técnicos?
            </p>
            <textarea
              rows={2}
              value={advanceNotes}
              onChange={(e) => setAdvanceNotes(e.target.value)}
              placeholder="Nota de pase de etapa..."
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowAdvancePrompt(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-600"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleStageChange(nextStage, advanceNotes)}
                className="px-4 py-1.5 bg-blue-600 text-white rounded font-bold"
              >
                Confirmar Avance
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
