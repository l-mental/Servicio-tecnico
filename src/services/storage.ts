import { Employee, InventoryItem, Ticket } from '../types';
import { INITIAL_EMPLOYEES, INITIAL_INVENTORY, INITIAL_TICKETS } from '../data/initialData';

const TICKETS_KEY = 'techfix_tickets_v6_scantec';
const EMPLOYEES_KEY = 'techfix_employees_v6_scantec';
const INVENTORY_KEY = 'techfix_inventory_v6_scantec';
const CURRENT_USER_KEY = 'techfix_current_user_v6_scantec';

function migrateTicket(t: any): Ticket {
  // Mapeo de etapas antiguas a los 4 estados solicitados
  let stage: Ticket['stage'] = t.stage;
  if (t.stage === 'entrada') stage = 'por_asignar';
  else if (t.stage === 'desarmado') stage = 'en_reparacion';
  else if (t.stage === 'recomposicion') stage = 'en_prueba';
  else if (t.stage === 'salida') stage = 'entregado';

  // Costo fijo y anticipo inicial
  const fixedCost = t.fixedCost !== undefined 
    ? Number(t.fixedCost) 
    : ((Number(t.laborCost) || 0) + (t.parts?.reduce((acc: number, p: any) => acc + (p.unitPrice * p.quantity), 0) || 0) || 350);

  const advancePayment = t.advancePayment !== undefined 
    ? Number(t.advancePayment) 
    : (t.isPaid ? fixedCost : Math.round(fixedCost * 0.4));

  const pendingBalance = t.isPaid 
    ? 0 
    : (t.pendingBalance !== undefined ? Number(t.pendingBalance) : Math.max(0, fixedCost - advancePayment));

  // Categoría de equipo para Nota de Recepción
  const eqCategory = t.device?.equipmentCategory || (
    t.device?.type === 'laptop' ? 'laptop' :
    t.device?.type === 'pc' ? 'pc' :
    t.device?.type === 'smartphone' ? 'otro' : 'laptop'
  );

  return {
    ...t,
    stage,
    fixedCost,
    advancePayment,
    pendingBalance,
    customer: {
      ...t.customer,
      refPhone: t.customer?.refPhone || '71234567',
    },
    device: {
      ...t.device,
      equipmentCategory: eqCategory,
      usageTime: t.device?.usageTime || '1 año y 6 meses',
      isFirstOwner: t.device?.isFirstOwner !== undefined ? t.device.isFirstOwner : true,
      wasRepairedBefore: t.device?.wasRepairedBefore !== undefined ? t.device.wasRepairedBefore : false,
      repairHistoryNotes: t.device?.repairHistoryNotes || 'Ninguno reportado',
      repairHistoryTime: t.device?.repairHistoryTime || 'N/A',
    },
    minCost: t.minCost || Math.round(fixedCost * 0.8),
    maxCost: t.maxCost || Math.round(fixedCost * 1.2),
    minRepairTime: t.minRepairTime || '24 Horas Hábiles',
    maxRepairTime: t.maxRepairTime || '48 Horas Hábiles',
  };
}

export function getStoredTickets(): Ticket[] {
  try {
    const raw = localStorage.getItem(TICKETS_KEY);
    if (!raw) {
      // Intentar migrar desde la v5 previa si existe
      const oldRaw = localStorage.getItem('techfix_tickets_v5_bob');
      if (oldRaw) {
        const oldTickets = JSON.parse(oldRaw);
        const migrated = oldTickets.map(migrateTicket);
        saveStoredTickets(migrated);
        return migrated;
      }
      const initial = INITIAL_TICKETS.map(migrateTicket);
      saveStoredTickets(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return parsed.map(migrateTicket);
  } catch (e) {
    console.error('Error reading tickets from localStorage', e);
    return INITIAL_TICKETS.map(migrateTicket);
  }
}

export function saveStoredTickets(tickets: Ticket[]): void {
  try {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  } catch (e) {
    console.error('Error saving tickets to localStorage', e);
  }
}

export function getStoredEmployees(): Employee[] {
  try {
    const raw = localStorage.getItem(EMPLOYEES_KEY);
    if (!raw) {
      saveStoredEmployees(INITIAL_EMPLOYEES);
      return INITIAL_EMPLOYEES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading employees from localStorage', e);
    return INITIAL_EMPLOYEES;
  }
}

export function saveStoredEmployees(employees: Employee[]): void {
  try {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
  } catch (e) {
    console.error('Error saving employees to localStorage', e);
  }
}

export function getStoredInventory(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(INVENTORY_KEY);
    if (!raw) {
      saveStoredInventory(INITIAL_INVENTORY);
      return INITIAL_INVENTORY;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading inventory from localStorage', e);
    return INITIAL_INVENTORY;
  }
}

export function saveStoredInventory(items: InventoryItem[]): void {
  try {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving inventory to localStorage', e);
  }
}

export function getCurrentUser(): Employee {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) {
      const defaultUser = INITIAL_EMPLOYEES[0]; // Ing. Roberto Gómez (Admin)
      saveCurrentUser(defaultUser);
      return defaultUser;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_EMPLOYEES[0];
  }
}

export function saveCurrentUser(user: Employee): void {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Error saving current user to localStorage', e);
  }
}

export function resetToDefaultData(): void {
  localStorage.removeItem(TICKETS_KEY);
  localStorage.removeItem('techfix_tickets_v5_bob');
  localStorage.removeItem(EMPLOYEES_KEY);
  localStorage.removeItem(INVENTORY_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
}
