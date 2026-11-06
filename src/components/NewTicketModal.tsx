import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Laptop, 
  Monitor, 
  Volume2, 
  Tv, 
  Microwave, 
  Coffee, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  FileText, 
  Check,
  AlertCircle
} from 'lucide-react';
import { DeviceType, Employee, EquipmentCategory, Priority, Ticket, TicketStage } from '../types';
import { formatCurrency } from '../utils/helpers';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newTicket: Ticket) => void;
  employees: Employee[];
  currentUser: Employee;
  existingCount: number;
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employees,
  currentUser,
  existingCount,
}) => {
  if (!isOpen) return null;

  // Datos del Cliente (SCANTEC)
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+591 ');
  const [customerRefPhone, setCustomerRefPhone] = useState('');
  const [customerDocument, setCustomerDocument] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Datos del Equipo (SCANTEC)
  const [equipmentCategory, setEquipmentCategory] = useState<EquipmentCategory>('laptop');
  const [otherEquipmentName, setOtherEquipmentName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [usageTime, setUsageTime] = useState('1 año');
  const [isFirstOwner, setIsFirstOwner] = useState<boolean>(true);
  const [wasRepairedBefore, setWasRepairedBefore] = useState<boolean>(false);
  const [repairHistoryNotes, setRepairHistoryNotes] = useState('Sin antecedentes de reparaciones');
  const [repairHistoryTime, setRepairHistoryTime] = useState('N/A');
  const [powerState, setPowerState] = useState<'enciende' | 'no_enciende' | 'intermitente'>('no_enciende');
  const [physicalNotes, setPhysicalNotes] = useState('Buen estado físico general');
  const [accessories, setAccessories] = useState('Cargador original');

  // Descripción del Problema
  const [problemReported, setProblemReported] = useState('');
  const [technicalDiagnosis, setTechnicalDiagnosis] = useState('');

  // Presupuesto y Condiciones Financieras (Costo Fijo, Anticipo y Saldo)
  const [fixedCost, setFixedCost] = useState<number>(350);
  const [advancePayment, setAdvancePayment] = useState<number>(150);
  const [minCost, setMinCost] = useState<number>(280);
  const [maxCost, setMaxCost] = useState<number>(450);
  const [minRepairTime, setMinRepairTime] = useState('24 Horas Hábiles');
  const [maxRepairTime, setMaxRepairTime] = useState('48 Horas Hábiles');

  // Estado y Asignación
  const [stage, setStage] = useState<TicketStage>('por_asignar');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState('');
  const [priority, setPriority] = useState<Priority>('media');
  const [warrantyDays, setWarrantyDays] = useState<number>(90);

  // Saldo pendiente calculado
  const pendingBalance = Math.max(0, (Number(fixedCost) || 0) - (Number(advancePayment) || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !model.trim() || !problemReported.trim()) {
      alert('Por favor complete los campos obligatorios: Nombre de cliente, Modelo del equipo y Descripción del problema.');
      return;
    }

    const orderNumber = existingCount + 105;
    const code = `ORD-2026-${orderNumber}`;
    const now = new Date().toISOString();

    const deviceType: DeviceType = 
      equipmentCategory === 'laptop' ? 'laptop' :
      equipmentCategory === 'pc' ? 'pc' :
      equipmentCategory === 'otro' ? 'otro' : 'laptop';

    const physicalConditionList = physicalNotes.split(',').map(s => s.trim()).filter(Boolean);
    const accessoriesList = accessories.split(',').map(s => s.trim()).filter(Boolean);

    // Auto-ajustar etapa si ya tiene técnico
    const finalStage: TicketStage = stage === 'por_asignar' && assignedTechnicianId ? 'en_reparacion' : stage;

    const newTicket: Ticket = {
      id: `tck-${Date.now()}`,
      code,
      createdAt: now,
      updatedAt: now,
      receptionDate: now,
      stage: finalStage,
      priority,
      status: finalStage === 'entregado' ? 'entregado' : 'en_progreso',
      customer: {
        id: `cust-${Date.now()}`,
        name: customerName.trim(),
        phone: customerPhone.trim(),
        refPhone: customerRefPhone.trim() || undefined,
        email: customerEmail.trim() || `${customerName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        documentId: customerDocument.trim() || 'S/N',
        address: customerAddress.trim() || undefined,
      },
      device: {
        type: deviceType,
        equipmentCategory,
        otherEquipmentName: equipmentCategory === 'otro' ? otherEquipmentName.trim() : undefined,
        brand: brand.trim() || 'Genérico',
        model: model.trim(),
        serialNumber: serialNumber.trim() || `SN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        powerState,
        physicalCondition: physicalConditionList.length > 0 ? physicalConditionList : ['Buen estado'],
        accessories: accessoriesList.length > 0 ? accessoriesList : ['Solo equipo'],
        usageTime: usageTime.trim(),
        isFirstOwner,
        wasRepairedBefore,
        repairHistoryNotes: repairHistoryNotes.trim(),
        repairHistoryTime: repairHistoryTime.trim(),
      },
      problemReported: problemReported.trim(),
      technicalDiagnosis: technicalDiagnosis.trim() || 'Diagnóstico preliminar al momento del ingreso.',
      assignedTechnicianId: assignedTechnicianId || undefined,
      fixedCost: Number(fixedCost) || 0,
      advancePayment: Number(advancePayment) || 0,
      pendingBalance,
      minCost: Number(minCost) || Number(fixedCost) * 0.8,
      maxCost: Number(maxCost) || Number(fixedCost) * 1.25,
      minRepairTime,
      maxRepairTime,
      laborCost: Number(fixedCost) || 0,
      parts: [],
      isPaid: pendingBalance === 0,
      paymentMethod: advancePayment > 0 ? 'efectivo' : 'pendiente',
      warrantyDays,
      timeSpentMinutes: 10,
      checklists: {
        entrada: [
          { id: 'e1', label: 'Inspección física y registro de nota de recepción', checked: true },
          { id: 'e2', label: 'Verificación de encendido y accesorios recibidos', checked: true },
          { id: 'e3', label: 'Registro de costo fijo y cobro de anticipo inicial', checked: true },
          { id: 'e4', label: 'Emisión de nota técnica SCANTEC al cliente', checked: true },
        ],
        desarmado: [
          { id: 'd1', label: 'Desensamble y verificación de placas', checked: false },
          { id: 'd2', label: 'Inspección de daños por líquido o cortocircuito', checked: false },
        ],
        recomposicion: [
          { id: 'r1', label: 'Reemplazo o reparación de componentes', checked: false },
          { id: 'r2', label: 'Control de temperatura y pastas térmicas', checked: false },
        ],
        salida: [
          { id: 's1', label: 'Control de calidad QC y pruebas de estrés', checked: false },
          { id: 's2', label: 'Cobro de saldo pendiente y entrega al cliente', checked: false },
        ],
      },
      notes: [`Ingresado por ${currentUser.name}. Anticipo recibido: Bs. ${advancePayment}. Saldo pendiente: Bs. ${pendingBalance}.`],
      timeline: [
        {
          id: `tm-${Date.now()}`,
          timestamp: now,
          authorName: currentUser.name,
          authorRole: currentUser.roleLabel,
          actionType: 'creacion',
          title: 'Orden Registrada en Taller',
          description: `Ingreso formal del equipo. Costo fijo: ${formatCurrency(Number(fixedCost))}, Anticipo: ${formatCurrency(Number(advancePayment))}, Saldo: ${formatCurrency(pendingBalance)}.`,
          stage: finalStage,
        },
      ],
    };

    onSave(newTicket);
    onClose();
  };

  const categories = [
    { id: 'laptop', label: 'Laptop', icon: Laptop },
    { id: 'pc', label: 'PC', icon: Monitor },
    { id: 'equipo_sonido', label: 'Equipo Sonido', icon: Volume2 },
    { id: 'televisor', label: 'Televisor', icon: Tv },
    { id: 'microonda', label: 'Microondas', icon: Microwave },
    { id: 'cafeteras', label: 'Cafeteras', icon: Coffee },
    { id: 'otro', label: 'Otro Equipo', icon: FileText },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-[#0B3558] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest bg-blue-500 text-white px-2 py-0.5 rounded uppercase">
                SCANTEC MULTISERVICIOS
              </span>
              <span className="text-xs text-blue-200">Recepción Oficial</span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-white mt-1">
              Registro de Orden de Servicio Técnico
            </h2>
            <p className="text-xs text-slate-300">
              Formulario de ingreso conforme a la <strong>Nota de Recepción de Equipos</strong> con Costo Fijo y Anticipo.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          
          {/* SECTION 1: DATOS DEL CLIENTE */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="w-6 h-6 rounded-lg bg-[#0B3558] text-white flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">
                Datos del Cliente
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6 space-y-1">
                <label className="font-bold text-slate-700 block">Nombre y Apellido *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Carlos Mamani Pérez"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#0B3558]"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="font-bold text-slate-700 block">Teléfono / WhatsApp *</label>
                <input
                  type="text"
                  required
                  placeholder="+591 78123456"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#0B3558]"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="font-bold text-slate-700 block">Teléfono Referencia (REF)</label>
                <input
                  type="text"
                  placeholder="Ej. 71234567 (Hermano)"
                  value={customerRefPhone}
                  onChange={(e) => setCustomerRefPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#0B3558]"
                />
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label className="font-bold text-slate-700 block">C.I. / Documento</label>
                <input
                  type="text"
                  placeholder="Ej. 8493021 LP"
                  value={customerDocument}
                  onChange={(e) => setCustomerDocument(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#0B3558]"
                />
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label className="font-bold text-slate-700 block">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="cliente@ejemplo.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#0B3558]"
                />
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label className="font-bold text-slate-700 block">Dirección / Zona</label>
                <input
                  type="text"
                  placeholder="Ej. Av. 6 de Agosto #1234, Sopocachi"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#0B3558]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: DATOS DEL EQUIPO (SELECCIÓN SCANTEC) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="w-6 h-6 rounded-lg bg-[#0B3558] text-white flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">
                Datos del Equipo (Categoría & Antecedentes)
              </h3>
            </div>

            {/* Equipment Categories Buttons */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Seleccione el tipo de equipo recibido:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {categories.map((c) => {
                  const Icon = c.icon;
                  const isSelected = equipmentCategory === c.id;
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setEquipmentCategory(c.id as EquipmentCategory)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                        isSelected
                          ? 'bg-[#0B3558] text-white border-[#0B3558] shadow-sm font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px]">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {equipmentCategory === 'otro' && (
              <div className="space-y-1 bg-blue-50 p-3 rounded-xl border border-blue-200">
                <label className="font-bold text-blue-900 block">Especifique el Otro Equipo:</label>
                <input
                  type="text"
                  placeholder="Ej. Proyector Epson, Impresora 3D, Consola PlayStation 5"
                  value={otherEquipmentName}
                  onChange={(e) => setOtherEquipmentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:outline-hidden"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4 space-y-1">
                <label className="font-bold text-slate-700 block">Marca</label>
                <input
                  type="text"
                  placeholder="Ej. ASUS, Samsung, Dell, Sony"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#0B3558]"
                />
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label className="font-bold text-slate-700 block">Modelo Exacto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. ROG Zephyrus G14, Smart TV 55 4K"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#0B3558]"
                />
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label className="font-bold text-slate-700 block">Número de Serie (S/N)</label>
                <input
                  type="text"
                  placeholder="Ej. SN-49204928"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono focus:outline-hidden focus:border-[#0B3558]"
                />
              </div>

              {/* Antecedentes SCANTEC */}
              <div className="sm:col-span-4 space-y-1">
                <label className="font-bold text-slate-700 block">Tiempo de Uso</label>
                <input
                  type="text"
                  placeholder="Ej. 1 año, 6 meses, 2 años"
                  value={usageTime}
                  onChange={(e) => setUsageTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#0B3558]"
                />
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label className="font-bold text-slate-700 block">¿Primer dueño?</label>
                <div className="flex items-center gap-4 py-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="firstOwner"
                      checked={isFirstOwner}
                      onChange={() => setIsFirstOwner(true)}
                    />
                    <span>Sí</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="firstOwner"
                      checked={!isFirstOwner}
                      onChange={() => setIsFirstOwner(false)}
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label className="font-bold text-slate-700 block">¿Fue reparado antes?</label>
                <div className="flex items-center gap-4 py-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="repairedBefore"
                      checked={wasRepairedBefore}
                      onChange={() => setWasRepairedBefore(true)}
                    />
                    <span>Sí</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="repairedBefore"
                      checked={!wasRepairedBefore}
                      onChange={() => setWasRepairedBefore(false)}
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              <div className="sm:col-span-8 space-y-1">
                <label className="font-bold text-slate-700 block">Antecedentes de Reparaciones</label>
                <input
                  type="text"
                  placeholder="Ej. Cambio de display hace 8 meses, mantenimiento preventivo"
                  value={repairHistoryNotes}
                  onChange={(e) => setRepairHistoryNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#0B3558]"
                />
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label className="font-bold text-slate-700 block">¿Cuánto tiempo atrás?</label>
                <input
                  type="text"
                  placeholder="Ej. Hace 6 meses"
                  value={repairHistoryTime}
                  onChange={(e) => setRepairHistoryTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#0B3558]"
                />
              </div>

              <div className="sm:col-span-6 space-y-1">
                <label className="font-bold text-slate-700 block">Estado Físico / Detalles</label>
                <input
                  type="text"
                  placeholder="Ej. Raspones leves en carcasa, sin golpes"
                  value={physicalNotes}
                  onChange={(e) => setPhysicalNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#0B3558]"
                />
              </div>

              <div className="sm:col-span-6 space-y-1">
                <label className="font-bold text-slate-700 block">Accesorios Recibidos</label>
                <input
                  type="text"
                  placeholder="Ej. Cargador original 65W, funda protectora"
                  value={accessories}
                  onChange={(e) => setAccessories(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#0B3558]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: DESCRIPCIÓN DEL PROBLEMA */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="w-6 h-6 rounded-lg bg-[#0B3558] text-white flex items-center justify-center font-bold text-xs">
                3
              </span>
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">
                Descripción del Problema & Diagnóstico Preliminar
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Falla Reportada por el Cliente *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describa el síntoma manifestado por el cliente..."
                  value={problemReported}
                  onChange={(e) => setProblemReported(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#0B3558]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Diagnóstico Técnico Inicial</label>
                <textarea
                  rows={3}
                  placeholder="Observaciones iniciales del técnico recepcionista..."
                  value={technicalDiagnosis}
                  onChange={(e) => setTechnicalDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#0B3558]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: PRESUPUESTO - COSTO FIJO, ANTICIPO INICIAL Y SALDO PENDIENTE */}
          <div className="space-y-3 bg-blue-50/60 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 pb-1">
              <DollarSign className="w-5 h-5 text-[#0B3558]" />
              <h3 className="font-extrabold text-[#0B3558] text-sm uppercase tracking-wide">
                Presupuesto Económico: Costo Fijo, Anticipo y Saldo
              </h3>
            </div>
            <p className="text-[11px] text-slate-600">
              Registre el costo total fijo del servicio y el anticipo inicial abonado por el cliente al ingresar el equipo. El saldo se cobrará automáticamente al momento de la entrega.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              
              {/* Costo Fijo */}
              <div className="bg-white p-3 rounded-xl border border-slate-300 shadow-2xs space-y-1">
                <label className="font-black text-slate-800 uppercase text-[10px] block">
                  Costo Fijo Acordado (Bs.) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">Bs.</span>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    required
                    value={fixedCost}
                    onChange={(e) => setFixedCost(Number(e.target.value))}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-base text-[#0B3558] focus:outline-hidden"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">Precio cerrado del trabajo</span>
              </div>

              {/* Anticipo Inicial */}
              <div className="bg-white p-3 rounded-xl border border-emerald-300 shadow-2xs space-y-1">
                <label className="font-black text-emerald-800 uppercase text-[10px] block">
                  Anticipo Inicial Recibido (Bs.) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-emerald-600">Bs.</span>
                  <input
                    type="number"
                    min={0}
                    max={fixedCost}
                    step={10}
                    required
                    value={advancePayment}
                    onChange={(e) => setAdvancePayment(Number(e.target.value))}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-emerald-300 font-mono font-bold text-base text-emerald-700 focus:outline-hidden"
                  />
                </div>
                <span className="text-[10px] text-emerald-600 block">Abonado al momento del ingreso</span>
              </div>

              {/* Saldo Pendiente Calculado */}
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-300 shadow-2xs space-y-1">
                <label className="font-black text-amber-900 uppercase text-[10px] block">
                  Saldo Pendiente a la Entrega
                </label>
                <div className="text-xl font-black font-mono text-amber-800 py-1">
                  {formatCurrency(pendingBalance)}
                </div>
                <span className="text-[10px] text-amber-700 block">
                  {pendingBalance === 0 ? '✓ Orden pagada al 100%' : 'Se cobrará al retirar el equipo'}
                </span>
              </div>

            </div>

            {/* Rangos estimados y tiempos */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-[11px]">
              <div className="space-y-1">
                <label className="text-slate-600 font-semibold block">Costo Mínimo Estimado:</label>
                <input
                  type="number"
                  value={minCost}
                  onChange={(e) => setMinCost(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-600 font-semibold block">Costo Máximo Estimado:</label>
                <input
                  type="number"
                  value={maxCost}
                  onChange={(e) => setMaxCost(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-600 font-semibold block">Tiempo Mín. Reparación:</label>
                <input
                  type="text"
                  value={minRepairTime}
                  onChange={(e) => setMinRepairTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-600 font-semibold block">Tiempo Máx. Reparación:</label>
                <input
                  type="text"
                  value={maxRepairTime}
                  onChange={(e) => setMaxRepairTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>

          </div>

          {/* SECTION 5: ESTADO INICIAL Y ASIGNACIÓN */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="w-6 h-6 rounded-lg bg-[#0B3558] text-white flex items-center justify-center font-bold text-xs">
                5
              </span>
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">
                Estado Inicial & Asignación
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Estado Inicial</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as TicketStage)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold"
                >
                  <option value="por_asignar">1. Por asignar</option>
                  <option value="en_reparacion">2. En reparación</option>
                  <option value="en_prueba">3. En prueba</option>
                  <option value="entregado">4. Entregado</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Técnico Asignado</label>
                <select
                  value={assignedTechnicianId}
                  onChange={(e) => setAssignedTechnicianId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="">Dejar sin asignar (Por asignar)</option>
                  {employees.filter(e => e.role === 'tecnico' || e.role === 'supervisor').map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.specialty.split(',')[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Prioridad</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media (Estándar)</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente (Prioridad Máxima)</option>
                </select>
              </div>

            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0B3558] hover:bg-[#07243c] text-white font-black text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Guardar e Imprimir Nota</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
