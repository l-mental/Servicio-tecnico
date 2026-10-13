import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Laptop, 
  User, 
  Wrench, 
  DollarSign, 
  ShieldCheck, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';
import { DeviceType, Employee, Priority, Ticket, TicketStage, TicketStatus } from '../types';
import { STAGE_CONFIG } from '../utils/helpers';

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
  const [customerEmail, setCustomerEmail] = useState(ticket.customer.email);
  const [customerDocument, setCustomerDocument] = useState(ticket.customer.documentId);
  const [customerAddress, setCustomerAddress] = useState(ticket.customer.address || '');

  const [deviceType, setDeviceType] = useState<DeviceType>(ticket.device.type);
  const [brand, setBrand] = useState(ticket.device.brand);
  const [model, setModel] = useState(ticket.device.model);
  const [serialNumber, setSerialNumber] = useState(ticket.device.serialNumber);
  const [powerState, setPowerState] = useState<'enciende' | 'no_enciende' | 'intermitente'>(ticket.device.powerState);
  const [securityCode, setSecurityCode] = useState(ticket.device.securityCode || '');
  const [physicalNotes, setPhysicalNotes] = useState(ticket.device.physicalCondition.join(', '));
  const [accessories, setAccessories] = useState(ticket.device.accessories.join(', '));

  const [problemReported, setProblemReported] = useState(ticket.problemReported);
  const [technicalDiagnosis, setTechnicalDiagnosis] = useState(ticket.technicalDiagnosis || '');
  const [solutionApplied, setSolutionApplied] = useState(ticket.solutionApplied || '');

  const [stage, setStage] = useState<TicketStage>(ticket.stage);
  const [priority, setPriority] = useState<Priority>(ticket.priority);
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [assignedTechnicianId, setAssignedTechnicianId] = useState(ticket.assignedTechnicianId || '');
  const [laborCost, setLaborCost] = useState<number>(ticket.laborCost);
  const [isPaid, setIsPaid] = useState<boolean>(ticket.isPaid);
  const [paymentMethod, setPaymentMethod] = useState(ticket.paymentMethod || 'pendiente');
  const [warrantyDays, setWarrantyDays] = useState<number>(ticket.warrantyDays || 90);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState(ticket.estimatedDeliveryDate || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const physicalConditionList = physicalNotes.split(',').map(s => s.trim()).filter(Boolean);
    const accessoriesList = accessories.split(',').map(s => s.trim()).filter(Boolean);

    const updated: Ticket = {
      ...ticket,
      updatedAt: new Date().toISOString(),
      stage,
      priority,
      status,
      customer: {
        ...ticket.customer,
        name: customerName.trim(),
        phone: customerPhone.trim(),
        email: customerEmail.trim(),
        documentId: customerDocument.trim(),
        address: customerAddress.trim() || undefined,
      },
      device: {
        ...ticket.device,
        type: deviceType,
        brand: brand.trim(),
        model: model.trim(),
        serialNumber: serialNumber.trim(),
        powerState,
        securityCode: securityCode.trim() || undefined,
        physicalCondition: physicalConditionList.length > 0 ? physicalConditionList : ['Normal'],
        accessories: accessoriesList.length > 0 ? accessoriesList : ['Sin accesorios'],
      },
      problemReported: problemReported.trim(),
      technicalDiagnosis: technicalDiagnosis.trim() || undefined,
      solutionApplied: solutionApplied.trim() || undefined,
      assignedTechnicianId: assignedTechnicianId || undefined,
      laborCost: Number(laborCost) || 0,
      isPaid,
      paymentMethod: paymentMethod as any,
      warrantyDays: Number(warrantyDays) || 90,
      estimatedDeliveryDate: estimatedDeliveryDate || undefined,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-mono font-bold text-sm">
              EDIT
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Modificar Orden <span className="font-mono text-blue-400">{ticket.code}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Actualice los datos técnicos, cliente, costos o estado de la orden en cualquier etapa.
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

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* Section: Stage & Priority */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Etapa Operativa</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as TicketStage)}
                className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold"
              >
                <option value="entrada">01. Entrada</option>
                <option value="desarmado">02. Desarmado</option>
                <option value="recomposicion">03. Recomposición</option>
                <option value="salida">04. Salida (QC)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">Prioridad</label>
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
              <label className="text-slate-400 block mb-1 font-medium">Estado del Ticket</label>
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
              <label className="text-slate-400 block mb-1 font-medium">Técnico Asignado</label>
              <select
                value={assignedTechnicianId}
                onChange={(e) => setAssignedTechnicianId(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold"
              >
                <option value="">-- Sin asignar --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.roleLabel})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section: Customer */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5 pb-1 border-b border-slate-800">
              <User className="w-4 h-4 text-blue-400" />
              Datos del Cliente
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Nombre completo *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Teléfono / WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">C.I. / DNI / NIT</label>
                <input
                  type="text"
                  value={customerDocument}
                  onChange={(e) => setCustomerDocument(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section: Device */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5 pb-1 border-b border-slate-800">
              <Laptop className="w-4 h-4 text-blue-400" />
              Datos del Dispositivo
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Tipo de equipo</label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value as DeviceType)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="laptop">Laptop</option>
                  <option value="smartphone">Smartphone</option>
                  <option value="consola">Consola</option>
                  <option value="pc">PC Escritorio</option>
                  <option value="tablet">Tablet</option>
                  <option value="smartwatch">Smartwatch</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Marca *</label>
                <input
                  type="text"
                  required
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
                <label className="text-slate-400 block mb-1">Número de Serie (S/N)</label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">PIN / Patrón de Desbloqueo</label>
                <input
                  type="text"
                  value={securityCode}
                  onChange={(e) => setSecurityCode(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
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
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5 pb-1 border-b border-slate-800">
              <Wrench className="w-4 h-4 text-blue-400" />
              Detalle Técnico & Falla
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
                <label className="text-slate-400 block mb-1">Diagnóstico Técnico (Desarmado)</label>
                <textarea
                  rows={2}
                  value={technicalDiagnosis}
                  onChange={(e) => setTechnicalDiagnosis(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white leading-relaxed"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Procedimiento de Recomposición</label>
                <textarea
                  rows={2}
                  value={solutionApplied}
                  onChange={(e) => setSolutionApplied(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section: Economic Details */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
            <div>
              <label className="text-slate-400 block mb-1">Costo Mano de Obra ($)</label>
              <input
                type="number"
                min={0}
                value={laborCost}
                onChange={(e) => setLaborCost(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Estado de Pago</label>
              <button
                type="button"
                onClick={() => setIsPaid(!isPaid)}
                className={`w-full py-2 px-3 rounded-lg font-bold text-xs transition-colors ${
                  isPaid ? 'bg-emerald-600 text-white' : 'bg-amber-600/80 text-white'
                }`}
              >
                {isPaid ? '✓ PAGADO' : '⏳ PENDIENTE'}
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
              <label className="text-slate-400 block mb-1">Garantía (Días)</label>
              <input
                type="number"
                min={0}
                value={warrantyDays}
                onChange={(e) => setWarrantyDays(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
              />
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
