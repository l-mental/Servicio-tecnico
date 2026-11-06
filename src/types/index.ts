export type TicketStage = 
  | 'por_asignar' 
  | 'en_reparacion' 
  | 'en_prueba' 
  | 'entregado'
  | 'entrada' 
  | 'desarmado' 
  | 'recomposicion' 
  | 'salida';

export type EquipmentCategory = 
  | 'laptop' 
  | 'pc' 
  | 'equipo_sonido' 
  | 'televisor' 
  | 'microonda' 
  | 'cafeteras' 
  | 'otro';

export type Priority = 'baja' | 'media' | 'alta' | 'urgente';

export type TicketStatus = 'en_progreso' | 'pausado' | 'esperando_repuesto' | 'listo_entrega' | 'entregado';

export type UserRole = 'admin' | 'supervisor' | 'tecnico' | 'recepcion';

export type ShiftType = 'manana' | 'tarde' | 'completo';

export type TechnicianStatus = 'disponible' | 'en_reparacion' | 'en_descanso' | 'fuera_de_turno';

export interface Shift {
  type: ShiftType;
  name: string;
  days: string[];
  startTime: string;
  endTime: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  specialty: string;
  shift: Shift;
  status: TechnicianStatus;
  avatar: string;
  phone: string;
  activeTicketsCount: number;
  completedThisMonth: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  refPhone?: string; // Teléfono de referencia / contacto adicional
  email: string;
  documentId: string; // CI / DNI
  address?: string;
}

export type DeviceType = 'smartphone' | 'laptop' | 'pc' | 'consola' | 'tablet' | 'smartwatch' | 'otro';

export interface Device {
  type: DeviceType;
  equipmentCategory?: EquipmentCategory;
  otherEquipmentName?: string;
  brand: string;
  model: string;
  serialNumber: string;
  color?: string;
  powerState: 'enciende' | 'no_enciende' | 'intermitente';
  securityCode?: string;
  physicalCondition: string[];
  accessories: string[];
  
  // Datos específicos de la Nota de Recepción SCANTEC
  usageTime?: string; // Tiempo de uso
  isFirstOwner?: boolean; // Primer dueño: Sí / No
  wasRepairedBefore?: boolean; // ¿Fue reparado antes?: Sí / No
  repairHistoryNotes?: string; // Antecedentes de reparaciones
  repairHistoryTime?: string; // Cuánto tiempo atrás
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  notes?: string;
}

export interface UsedPart {
  id: string;
  inventoryItemId?: string;
  name: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  authorName: string;
  authorRole: string;
  actionType: 'creacion' | 'cambio_etapa' | 'asignacion' | 'nota' | 'repuesto_agregado' | 'pausa' | 'qc_aprobado' | 'entregado';
  title: string;
  description: string;
  stage?: TicketStage;
}

export interface Ticket {
  id: string;
  code: string; // e.g., ORD-2026-104
  createdAt: string;
  updatedAt: string;
  receptionDate?: string;
  stage: TicketStage;
  priority: Priority;
  status: TicketStatus;
  customer: Customer;
  device: Device;
  problemReported: string;
  technicalDiagnosis?: string;
  solutionApplied?: string;
  assignedTechnicianId?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  
  // Estructura financiera: Costo Fijo, Anticipo Inicial y Saldo Pendiente
  fixedCost?: number; // Costo total fijo acordado en Bs.
  advancePayment?: number; // Anticipo inicial abonado al ingreso en Bs.
  pendingBalance?: number; // Saldo pendiente a la entrega en Bs.
  
  // Presupuesto técnico estimado (SCANTEC)
  minCost?: number; // Costo mínimo estimado
  maxCost?: number; // Costo máximo estimado
  minRepairTime?: string; // Tiempo mín. de reparación
  maxRepairTime?: string; // Tiempo máx. de reparación

  laborCost: number;
  parts: UsedPart[];
  isPaid: boolean;
  paymentMethod?: 'efectivo' | 'tarjeta' | 'transferencia' | 'pendiente';
  warrantyDays: number;
  timeSpentMinutes: number;
  checklists: {
    entrada?: ChecklistItem[];
    desarmado?: ChecklistItem[];
    recomposicion?: ChecklistItem[];
    salida?: ChecklistItem[];
    por_asignar?: ChecklistItem[];
    en_reparacion?: ChecklistItem[];
    en_prueba?: ChecklistItem[];
    entregado?: ChecklistItem[];
    [key: string]: ChecklistItem[] | undefined;
  };
  notes: string[];
  timeline: TimelineEvent[];
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  compatibleWith: string;
  stock: number;
  minStock: number;
  cost: number;
  price: number;
}
