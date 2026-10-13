import { Employee, InventoryItem, Ticket } from '../types';
import { INITIAL_EMPLOYEES, INITIAL_INVENTORY, INITIAL_TICKETS } from '../data/initialData';

const TICKETS_KEY = 'techfix_tickets_v1';
const EMPLOYEES_KEY = 'techfix_employees_v1';
const INVENTORY_KEY = 'techfix_inventory_v1';
const CURRENT_USER_KEY = 'techfix_current_user_v1';

export function getStoredTickets(): Ticket[] {
  try {
    const raw = localStorage.getItem(TICKETS_KEY);
    if (!raw) {
      saveStoredTickets(INITIAL_TICKETS);
      return INITIAL_TICKETS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading tickets from localStorage', e);
    return INITIAL_TICKETS;
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
  localStorage.removeItem(EMPLOYEES_KEY);
  localStorage.removeItem(INVENTORY_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
}
