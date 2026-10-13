import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Laptop, 
  Smartphone, 
  Gamepad2, 
  Monitor, 
  Tablet, 
  Watch, 
  User, 
  Wrench, 
  Clock, 
  DollarSign, 
  AlertTriangle 
} from 'lucide-react';
import { DeviceType, Employee, Priority, Ticket } from '../types';

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

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+591 ');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerDocument, setCustomerDocument] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const [deviceType, setDeviceType] = useState<DeviceType>('laptop');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [powerState, setPowerState] = useState<'enciende' | 'no_enciende' | 'intermitente'>('no_enciende');
  const [securityCode, setSecurityCode] = useState('');
  const [physicalNotes, setPhysicalNotes] = useState('Sin golpes aparentes');
  const [accessories, setAccessories] = useState('Cargador original');

  const [problemReported, setProblemReported] = useState('');
  const [priority, setPriority] = useState<Priority>('media');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState(
    employees.find(e => e.role === 'tecnico')?.id || ''
  );
  const [laborCost, setLaborCost] = useState<number>(40);
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] = useState<number>(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !brand.trim() || !model.trim() || !problemReported.trim()) {
      alert('Por favor complete los campos obligatorios: Nombre de cliente, Marca, Modelo y Falla reportada.');
      return;
    }

    const orderNumber = existingCount + 101;
    const code = `ORD-2026-${orderNumber}`;
    const now = new Date().toISOString();

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + estimatedDeliveryDays);
    const estimatedDeliveryDate = deliveryDate.toISOString().split('T')[0];

    const physicalConditionList = physicalNotes.split(',').map(s => s.trim()).filter(Boolean);
    const accessoriesList = accessories.split(',').map(s => s.trim()).filter(Boolean);

    const newTicket: Ticket = {
      id: `tck-${Date.now()}`,
      code,
      createdAt: now,
      updatedAt: now,
      stage: 'entrada',
      priority,
      status: 'en_progreso',
      customer: {
        id: `cust-${Date.now()}`,
        name: customerName.trim(),
        phone: customerPhone.trim(),
        email: customerEmail.trim() || `${customerName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        documentId: customerDocument.trim() || 'S/N',
        address: customerAddress.trim() || undefined,
      },
      device: {
        type: deviceType,
        brand: brand.trim(),
        model: model.trim(),
        serialNumber: serialNumber.trim() || `SN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        powerState,
        securityCode: securityCode.trim() || undefined,
        physicalCondition: physicalConditionList.length > 0 ? physicalConditionList : ['Buen estado'],
        accessories: accessoriesList.length > 0 ? accessoriesList : ['Solo equipo'],
      },
      problemReported: problemReported.trim(),
      assignedTechnicianId: assignedTechnicianId || undefined,
      estimatedDeliveryDate,
      laborCost: Number(laborCost) || 0,
      parts: [],
      isPaid: false,
      paymentMethod: 'pendiente',
      warrantyDays: 90,
      timeSpentMinutes: 15,
      checklists: {
        entrada: [
          { id: 'e1', label: 'Inspección visual externa y registro fotográfico inicial', checked: true },
          { id: 'e2', label: 'Verificación de encendido y comportamiento de LED indicador', checked: true },
          { id: 'e3', label: 'Inventario físico de accesorios recibidos con el cliente', checked: true },
          { id: 'e4', label: 'Registro de datos de contacto y WhatsApp del cliente', checked: true },
          { id: 'e5', label: 'Asignación preliminar de técnico por especialidad', checked: Boolean(assignedTechnicianId) },
        ],
        desarmado: [
          { id: 'd1', label: 'Uso de pulsera antiestática (ESD Safe)', checked: false },
          { id: 'd2', label: 'Desconexión física inmediata de batería principal', checked: false },
          { id: 'd3', label: 'Inspección de stickers detectores de líquido (LDI)', checked: false },
          { id: 'd4', label: 'Fotografías internas de áreas afectadas por sulfato o daño', checked: false },
          { id: 'd5', label: 'Clasificación de tornillos y flexores en bandeja magnética', checked: false },
        ],
        recomposicion: [
          { id: 'r1', label: 'Limpieza ultrasónica o desengrasado con alcohol isopropílico', checked: false },
          { id: 'r2', label: 'Reemplazo o soldadura de repuesto original', checked: false },
          { id: 'r3', label: 'Renovación de pastas y pads térmicos', checked: false },
          { id: 'r4', label: 'Reensamble con torque calibrado', checked: false },
        ],
        salida: [
          { id: 's1', label: 'Prueba completa de encendido y ciclo de carga', checked: false },
          { id: 's2', label: 'Test de periféricos (teclado, pantalla, táctil, audio, red)', checked: false },
          { id: 's3', label: 'Control de calidad QC y sanitización externa', checked: false },
          { id: 's4', label: 'Emisión de reporte técnico y entrega de garantía formal', checked: false },
        ],
      },
      notes: [],
      timeline: [
        {
          id: `tm-${Date.now()}`,
          timestamp: now,
          authorName: currentUser.name,
          authorRole: currentUser.roleLabel,
          actionType: 'creacion',
          title: 'Recepción formal en Etapa 1 (Entrada)',
          description: `Equipo ingresado al taller por ${customerName}. Falla reportada: "${problemReported.trim()}".`,
          stage: 'entrada',
        },
      ],
    };

    onSave(newTicket);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
              01
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Recepción de Equipo · Etapa 1: Entrada
              </h2>
              <p className="text-xs text-slate-400">
                Apertura formal de orden de servicio técnico y recolección de parámetros de laboratorio.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* Section 1: Customer */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <User className="w-4 h-4 text-blue-600" />
              1. Datos del Cliente
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 block mb-1 font-medium">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Méndez"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+591 7XXXXXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">
                  Cédula / DNI / NIT
                </label>
                <input
                  type="text"
                  placeholder="Ej. 6543210 LP"
                  value={customerDocument}
                  onChange={(e) => setCustomerDocument(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  placeholder="cliente@ejemplo.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Device */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <Laptop className="w-4 h-4 text-blue-600" />
              2. Datos del Dispositivo & Estado Físico
            </h3>

            {/* Type selector */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { type: 'laptop', label: 'Laptop' },
                { type: 'smartphone', label: 'Celular' },
                { type: 'consola', label: 'Consola' },
                { type: 'pc', label: 'PC Torre' },
                { type: 'tablet', label: 'Tablet' },
                { type: 'smartwatch', label: 'Smartwatch' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => setDeviceType(item.type as DeviceType)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    deviceType === item.type
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-600 block mb-1 font-medium">Marca *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Apple, Asus, Lenovo, Sony"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">Modelo exacto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. MacBook Pro M1 14, TUF F15, PS5"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">Número de Serie (S/N)</label>
                <input
                  type="text"
                  placeholder="Ej. C02GK92YQ..."
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-600 block mb-1 font-medium">¿Enciende al recibir?</label>
                <select
                  value={powerState}
                  onChange={(e) => setPowerState(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="no_enciende">No enciende (Apagado total)</option>
                  <option value="enciende">Enciende normalmente</option>
                  <option value="intermitente">Intermitente / Se reinicia</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">PIN / Patrón de desbloqueo</label>
                <input
                  type="text"
                  placeholder="Ej. 1234, Patrón en L, Sin clave"
                  value={securityCode}
                  onChange={(e) => setSecurityCode(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">Accesorios recibidos</label>
                <input
                  type="text"
                  placeholder="Ej. Cargador original, Funda, Cable"
                  value={accessories}
                  onChange={(e) => setAccessories(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-medium">
                Estado estético / Daños visibles iniciales (separados por coma)
              </label>
              <input
                type="text"
                placeholder="Ej. Rayón en tapa superior, Vidrio templado fisurado, Falta 1 tornillo"
                value={physicalNotes}
                onChange={(e) => setPhysicalNotes(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Section 3: Technical Failure & Diagnostics */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <Wrench className="w-4 h-4 text-blue-600" />
              3. Falla Reportada & Asignación
            </h3>

            <div>
              <label className="text-slate-600 block mb-1 font-medium">
                Descripción detallada de la falla o motivo de ingreso *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Explique qué le ocurre al equipo según el usuario (ej. cayó en agua, no da imagen tras golpe, ventilador ruidoso, se apaga a los 10 mins)..."
                value={problemReported}
                onChange={(e) => setProblemReported(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-hidden leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-slate-600 block mb-1 font-medium">Prioridad</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media (Estándar)</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente (Prioritaria)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">Técnico Asignado</label>
                <select
                  value={assignedTechnicianId}
                  onChange={(e) => setAssignedTechnicianId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium"
                >
                  <option value="">Por asignar en taller</option>
                  {employees.filter(e => e.role === 'tecnico' || e.role === 'supervisor').map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.specialty.split(',')[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">Mano de Obra Est. ($)</label>
                <input
                  type="number"
                  min={0}
                  value={laborCost}
                  onChange={(e) => setLaborCost(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">Plazo Entrega (Días)</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={estimatedDeliveryDays}
                  onChange={(e) => setEstimatedDeliveryDays(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Orden en Entrada</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
