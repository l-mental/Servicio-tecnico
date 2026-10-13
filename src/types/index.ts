export type TicketStage = 'entrada' | 'desarmado' | 'recomposicion' | 'salida';

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
  email: string;
  documentId: string;
  address?: string;
}

export type DeviceType = 'smartphone' | 'laptop' | 'pc' | 'consola' | 'tablet' | 'smartwatch' | 'otro';

export interface Device {
  type: DeviceType;
  brand: string;
  model: string;
  serialNumber: string;
  color?: string;
  powerState: 'enciende' | 'no_enciende' | 'intermitente';
  securityCode?: string; // Patrón o PIN de prueba
  physicalCondition: string[];
  accessories: string[];
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
  code: string; // e.g., TCK-2026-081
  createdAt: string;
  updatedAt: string;
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
  laborCost: number;
  parts: UsedPart[];
  isPaid: boolean;
  paymentMethod?: 'efectivo' | 'tarjeta' | 'transferencia' | 'pendiente';
  warrantyDays: number;
  timeSpentMinutes: number;
  checklists: {
    entrada: ChecklistItem[];
    desarmado: ChecklistItem[];
    recomposicion: ChecklistItem[];
    salida: ChecklistItem[];
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
