import React, { useState } from 'react';
import { 
  X, 
  Save, 
  DollarSign, 
  Wrench, 
  ShieldCheck, 
  Clock, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { DeviceType, Employee, EquipmentCategory, Priority, Ticket, TicketStage, TicketStatus } from '../types';
import { formatCurrency } from '../utils/helpers';

interface EditTicketModalProps {
  ticket: Ticket;
  employees: Employee[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTicket: Ticket) => void;
}

export const EditTicketModal: React.FC<EditTicketModalProps> = ({
  ticket,
  employees,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  // Form states initialized with ticket data
  const [customerName, setCustomerName] = useState(ticket.customer.name);
  const [customerPhone, setCustomerPhone] = useState(ticket.customer.phone);
  const [customerRefPhone, setCustomerRefPhone] = useState(ticket.customer.refPhone || '');
  const [customerEmail, setCustomerEmail] = useState(ticket.customer.email);
  const [customerDocument, setCustomerDocument] = useState(ticket.customer.documentId);
  const [customerAddress, setCustomerAddress] = useState(ticket.customer.address || '');

  const [equipmentCategory, setEquipmentCategory] = useState<EquipmentCategory>(
    ticket.device.equipmentCategory || (ticket.device.type === 'pc' ? 'pc' : 'laptop')
  );
  const [otherEquipmentName, setOtherEquipmentName] = useState(ticket.device.otherEquipmentName || '');
  const [brand, setBrand] = useState(ticket.device.brand);
  const [model, setModel] = useState(ticket.device.model);
  const [serialNumber, setSerialNumber] = useState(ticket.device.serialNumber);
  const [usageTime, setUsageTime] = useState(ticket.device.usageTime || '1 año');
  const [isFirstOwner, setIsFirstOwner] = useState<boolean>(ticket.device.isFirstOwner !== false);
  const [wasRepairedBefore, setWasRepairedBefore] = useState<boolean>(ticket.device.wasRepairedBefore === true);
  const [repairHistoryNotes, setRepairHistoryNotes] = useState(ticket.device.repairHistoryNotes || '');
  const [repairHistoryTime, setRepairHistoryTime] = useState(ticket.device.repairHistoryTime || '');
  const [powerState, setPowerState] = useState<'enciende' | 'no_enciende' | 'intermitente'>(ticket.device.powerState);
  const [physicalNotes, setPhysicalNotes] = useState(ticket.device.physicalCondition.join(', '));
  const [accessories, setAccessories] = useState(ticket.device.accessories.join(', '));

  const [problemReported, setProblemReported] = useState(ticket.problemReported);
  const [technicalDiagnosis, setTechnicalDiagnosis] = useState(ticket.technicalDiagnosis || '');
  const [solutionApplied, setSolutionApplied] = useState(ticket.solutionApplied || '');

  // 4 Etapas
  const canonicalStage = (stg: TicketStage): 'por_asignar' | 'en_reparacion' | 'en_prueba' | 'entregado' => {
    if (stg === 'entrada') return 'por_asignar';
    if (stg === 'desarmado') return 'en_reparacion';
    if (stg === 'recomposicion') return 'en_prueba';
    if (stg === 'salida') return 'entregado';
    return stg as any;
  };

  const [stage, setStage] = useState<TicketStage>(canonicalStage(ticket.stage));
  const [priority, setPriority] = useState<Priority>(ticket.priority);
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [assignedTechnicianId, setAssignedTechnicianId] = useState(ticket.assignedTechnicianId || '');
  
  // Financiero
  const initialFixed = ticket.fixedCost !== undefined ? ticket.fixedCost : ticket.laborCost;
  const initialAdvance = ticket.advancePayment !== undefined ? ticket.advancePayment : (ticket.isPaid ? initialFixed : 0);
  const [fixedCost, setFixedCost] = useState<number>(initialFixed);
  const [advancePayment, setAdvancePayment] = useState<number>(initialAdvance);
  const [minCost, setMinCost] = useState<number>(ticket.minCost || Math.round(initialFixed * 0.85));
  const [maxCost, setMaxCost] = useState<number>(ticket.maxCost || Math.round(initialFixed * 1.25));
  const [minRepairTime, setMinRepairTime] = useState(ticket.minRepairTime || '24 Horas Hábiles');
  const [maxRepairTime, setMaxRepairTime] = useState(ticket.maxRepairTime || '48 Horas Hábiles');

  const [isPaid, setIsPaid] = useState<boolean>(ticket.isPaid);
  const [paymentMethod, setPaymentMethod] = useState(ticket.paymentMethod || 'pendiente');
  const [warrantyDays, setWarrantyDays] = useState<number>(ticket.warrantyDays || 90);

  const pendingBalance = isPaid ? 0 : Math.max(0, (Number(fixedCost) || 0) - (Number(advancePayment) || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const physicalConditionList = physicalNotes.split(',').map(s => s.trim()).filter(Boolean);
    const accessoriesList = accessories.split(',').map(s => s.trim()).filter(Boolean);

    const updated: Ticket = {
      ...ticket,
      updatedAt: new Date().toISOString(),
      stage,
      priority,
      status: stage === 'entregado' ? 'entregado' : status,
      customer: {
        ...ticket.customer,
        name: customerName.trim(),
        phone: customerPhone.trim(),
        refPhone: customerRefPhone.trim() || undefined,
        email: customerEmail.trim(),
        documentId: customerDocument.trim(),
        address: customerAddress.trim() || undefined,
      },
      device: {
        ...ticket.device,
        equipmentCategory,
        otherEquipmentName: equipmentCategory === 'otro' ? otherEquipmentName.trim() : undefined,
        brand: brand.trim(),
        model: model.trim(),
        serialNumber: serialNumber.trim(),
        powerState,
        physicalCondition: physicalConditionList.length > 0 ? physicalConditionList : ['Normal'],
        accessories: accessoriesList.length > 0 ? accessoriesList : ['Sin accesorios'],
        usageTime: usageTime.trim(),
        isFirstOwner,
        wasRepairedBefore,
        repairHistoryNotes: repairHistoryNotes.trim(),
        repairHistoryTime: repairHistoryTime.trim(),
      },
      problemReported: problemReported.trim(),
      technicalDiagnosis: technicalDiagnosis.trim() || undefined,
      solutionApplied: solutionApplied.trim() || undefined,
      assignedTechnicianId: assignedTechnicianId || undefined,
      fixedCost: Number(fixedCost) || 0,
      advancePayment: Number(advancePayment) || 0,
      pendingBalance,
      minCost: Number(minCost) || 0,
      maxCost: Number(maxCost) || 0,
      minRepairTime,
      maxRepairTime,
      laborCost: Number(fixedCost) || 0,
      isPaid: isPaid || pendingBalance === 0,
      paymentMethod: paymentMethod as any,
      warrantyDays: Number(warrantyDays) || 90,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#07243c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center font-mono font-bold text-sm">
              MOD
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                Modificar Orden <span className="font-mono text-blue-400">{ticket.code}</span>
              </h2>
              <p className="text-xs text-slate-300">
                Gestión de etapas, costos, anticipos y datos de la orden técnica.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* Section: Stage & Priority */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-slate-300 block mb-1 font-bold">1. Etapa Operativa (4 Estados)</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as TicketStage)}
                className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold"
              >
                <option value="por_asignar">1. Por asignar</option>
                <option value="en_reparacion">2. En reparación</option>
                <option value="en_prueba">3. En prueba</option>
                <option value="entregado">4. Entregado</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-bold">Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-bold">Estado del Ticket</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TicketStatus)}
                className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold"
              >
                <option value="en_progreso">En Progreso</option>
                <option value="pausado">Pausado</option>
                <option value="esperando_repuesto">Esperando Repuesto</option>
                <option value="listo_entrega">Listo para Entrega</option>
                <option value="entregado">Entregado al Cliente</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-bold">Técnico Asignado</label>
              <select
                value={assignedTechnicianId}
                onChange={(e) => setAssignedTechnicianId(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold"
              >
                <option value="">-- Sin asignar (Por asignar) --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.roleLabel})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section: Economic Details (Fixed Cost, Advance & Pending Balance) */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-blue-900/40 space-y-3">
            <h3 className="font-bold text-blue-300 text-sm flex items-center gap-1.5 pb-1 border-b border-slate-800">
              <DollarSign className="w-4 h-4 text-blue-400" />
              Presupuesto: Costo Fijo, Anticipo y Saldo Pendiente
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-300 block mb-1 font-bold">Costo Fijo Total (Bs.)</label>
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={fixedCost}
                  onChange={(e) => setFixedCost(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold text-base"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-bold">Anticipo Inicial (Bs.)</label>
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={advancePayment}
                  onChange={(e) => setAdvancePayment(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-emerald-700 text-emerald-400 font-mono font-bold text-base"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-bold">Saldo Pendiente Calculado</label>
                <div className="p-2 rounded-lg bg-slate-900 border border-amber-700/60 font-mono font-black text-amber-400 text-base">
                  {formatCurrency(pendingBalance)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="text-slate-400 block mb-1">Estado de Pago</label>
                <button
                  type="button"
                  onClick={() => setIsPaid(!isPaid)}
                  className={`w-full py-2 px-3 rounded-lg font-bold text-xs transition-colors ${
                    isPaid ? 'bg-emerald-600 text-white' : 'bg-amber-600/80 text-white'
                  }`}
                >
                  {isPaid ? '✓ PAGADO / LIQUIDADO' : '⏳ CON SALDO PENDIENTE'}
                </button>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Método de Pago</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia / QR</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Tiempo Mín. Reparación</label>
                <input
                  type="text"
                  value={minRepairTime}
                  onChange={(e) => setMinRepairTime(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Tiempo Máx. Reparación</label>
                <input
                  type="text"
                  value={maxRepairTime}
                  onChange={(e) => setMaxRepairTime(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                />
              </div>
            </div>
          </div>

          {/* Section: Customer Data */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-sm pb-1 border-b border-slate-800">
              Datos del Cliente & Referencias
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Teléfono Principal *</label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Teléfono Referencia (REF)</label>
                <input
                  type="text"
                  value={customerRefPhone}
                  onChange={(e) => setCustomerRefPhone(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">CI / Documento</label>
                <input
                  type="text"
                  value={customerDocument}
                  onChange={(e) => setCustomerDocument(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Dirección</label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>
          </div>

          {/* Section: Device Info */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-sm pb-1 border-b border-slate-800">
              Datos del Equipo (Nota de Recepción)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Categoría</label>
                <select
                  value={equipmentCategory}
                  onChange={(e) => setEquipmentCategory(e.target.value as any)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="laptop">Laptop</option>
                  <option value="pc">PC</option>
                  <option value="equipo_sonido">Equipo de Sonido</option>
                  <option value="televisor">Televisor</option>
                  <option value="microonda">Microonda</option>
                  <option value="cafeteras">Cafeteras</option>
                  <option value="otro">Otro Equipo</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Marca</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Modelo *</label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Número de Serie</label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Tiempo de uso</label>
                <input
                  type="text"
                  value={usageTime}
                  onChange={(e) => setUsageTime(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Antecedentes de reparaciones</label>
                <input
                  type="text"
                  value={repairHistoryNotes}
                  onChange={(e) => setRepairHistoryNotes(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Accesorios recibidos</label>
                <input
                  type="text"
                  value={accessories}
                  onChange={(e) => setAccessories(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Estado de encendido</label>
                <select
                  value={powerState}
                  onChange={(e) => setPowerState(e.target.value as any)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="no_enciende">No enciende</option>
                  <option value="enciende">Enciende normal</option>
                  <option value="intermitente">Intermitente</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Diagnostics & Notes */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-sm pb-1 border-b border-slate-800">
              Falla Reportada & Diagnóstico Técnico
            </h3>

            <div>
              <label className="text-slate-400 block mb-1">Falla Reportada por el Cliente *</label>
              <textarea
                rows={2}
                required
                value={problemReported}
                onChange={(e) => setProblemReported(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Diagnóstico Técnico (SCANTEC)</label>
                <textarea
                  rows={2}
                  value={technicalDiagnosis}
                  onChange={(e) => setTechnicalDiagnosis(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white leading-relaxed"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Procedimiento de Recomposición / Solución</label>
                <textarea
                  rows={2}
                  value={solutionApplied}
                  onChange={(e) => setSolutionApplied(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
