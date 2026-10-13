import React, { useState, useEffect } from 'react';
import { Employee, InventoryItem, Ticket, TicketStage } from './types';
import { 
  getStoredTickets, 
  saveStoredTickets, 
  getStoredEmployees, 
  saveStoredEmployees, 
  getStoredInventory, 
  saveStoredInventory, 
  getCurrentUser, 
  saveCurrentUser, 
  resetToDefaultData 
} from './services/storage';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { TicketList } from './components/TicketList';
import { TicketModal } from './components/TicketModal';
import { NewTicketModal } from './components/NewTicketModal';
import { EditTicketModal } from './components/EditTicketModal';
import { EditEmployeeModal } from './components/EditEmployeeModal';
import { EditInventoryModal } from './components/EditInventoryModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { StaffScheduleView } from './components/StaffScheduleView';
import { InventoryView } from './components/InventoryView';
import { ReportsView } from './components/ReportsView';
import { PrintTicketView } from './components/PrintTicketView';
import { LoginModal } from './components/LoginModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { STAGE_CONFIG } from './utils/helpers';

export default function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);

  // View state
  const [currentView, setCurrentView] = useState<'kanban' | 'list' | 'staff' | 'inventory' | 'reports'>('kanban');
  
  // Modals state
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketToEdit, setTicketToEdit] = useState<Ticket | null>(null);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [inventoryToEdit, setInventoryToEdit] = useState<InventoryItem | null>(null);
  
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [printingTicket, setPrintingTicket] = useState<Ticket | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'ticket' | 'employee' | 'inventory';
    item: any;
    title: string;
    message: string;
  } | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      title,
      description,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initialize from storage on mount
  useEffect(() => {
    const loadedTickets = getStoredTickets();
    const loadedEmployees = getStoredEmployees();
    const loadedInventory = getStoredInventory();
    const loadedUser = getCurrentUser();

    setTickets(loadedTickets);
    setEmployees(loadedEmployees);
    setInventory(loadedInventory);
    setCurrentUser(loadedUser);
  }, []);

  // Update employee counts when tickets change
  const refreshEmployeeTicketCounts = (currentTickets: Ticket[], currentEmployees: Employee[]): Employee[] => {
    return currentEmployees.map(emp => {
      const activeCount = currentTickets.filter(
        t => t.assignedTechnicianId === emp.id && (t.stage !== 'salida' || t.status !== 'entregado')
      ).length;
      return { ...emp, activeTicketsCount: activeCount };
    });
  };

  // Save ticket handler (Update)
  const handleSaveTicket = (updatedTicket: Ticket) => {
    const updatedList = tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t);
    setTickets(updatedList);
    saveStoredTickets(updatedList);

    const updatedEmployees = refreshEmployeeTicketCounts(updatedList, employees);
    setEmployees(updatedEmployees);
    saveStoredEmployees(updatedEmployees);

    if (selectedTicket && selectedTicket.id === updatedTicket.id) {
      setSelectedTicket(updatedTicket);
    }

    addToast('success', 'Orden Actualizada', `La orden ${updatedTicket.code} se guardó exitosamente.`);
  };

  // Move ticket stage
  const handleMoveTicketStage = (ticketId: string, newStage: TicketStage) => {
    const target = tickets.find(t => t.id === ticketId);
    if (!target) return;

    const prevStage = target.stage;
    const now = new Date().toISOString();

    const updated: Ticket = {
      ...target,
      stage: newStage,
      status: newStage === 'salida' ? 'listo_entrega' : 'en_progreso',
      updatedAt: now,
      timeline: [
        {
          id: `tm-${Date.now()}`,
          timestamp: now,
          authorName: currentUser?.name || 'Sistema',
          authorRole: currentUser?.roleLabel || 'Operador',
          actionType: newStage === 'salida' ? 'qc_aprobado' : 'cambio_etapa',
          title: `Transición a ${STAGE_CONFIG[newStage].name}`,
          description: `Avanzado desde ${STAGE_CONFIG[prevStage].name} a ${STAGE_CONFIG[newStage].name}.`,
          stage: newStage,
        },
        ...target.timeline,
      ],
    };

    const updatedList = tickets.map(t => t.id === updated.id ? updated : t);
    setTickets(updatedList);
    saveStoredTickets(updatedList);

    const updatedEmployees = refreshEmployeeTicketCounts(updatedList, employees);
    setEmployees(updatedEmployees);
    saveStoredEmployees(updatedEmployees);

    addToast('info', `Paso a Etapa: ${STAGE_CONFIG[newStage].name}`, `Orden ${target.code} trasladada a ${STAGE_CONFIG[newStage].name}.`);
  };

  // Add new ticket (Create)
  const handleAddTicket = (newTicket: Ticket) => {
    const updatedList = [newTicket, ...tickets];
    setTickets(updatedList);
    saveStoredTickets(updatedList);

    const updatedEmployees = refreshEmployeeTicketCounts(updatedList, employees);
    setEmployees(updatedEmployees);
    saveStoredEmployees(updatedEmployees);

    setSelectedTicket(newTicket);
    addToast('success', 'Nueva Orden Creada', `Orden ${newTicket.code} ingresada en Etapa 1 (Entrada).`);
  };

  // Delete ticket (Delete)
  const requestDeleteTicket = (ticket: Ticket) => {
    setDeleteTarget({
      type: 'ticket',
      item: ticket,
      title: `¿Eliminar Orden ${ticket.code}?`,
      message: `Se eliminarán todos los registros de diagnóstico, checklists y piezas vinculadas a este equipo (${ticket.device.brand} ${ticket.device.model} de ${ticket.customer.name}).`,
    });
  };

  const confirmDeleteAction = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'ticket') {
      const ticket = deleteTarget.item as Ticket;
      const updatedList = tickets.filter(t => t.id !== ticket.id);
      setTickets(updatedList);
      saveStoredTickets(updatedList);

      const updatedEmployees = refreshEmployeeTicketCounts(updatedList, employees);
      setEmployees(updatedEmployees);
      saveStoredEmployees(updatedEmployees);

      if (selectedTicket?.id === ticket.id) {
        setSelectedTicket(null);
      }
      addToast('error', 'Orden Eliminada', `La orden ${ticket.code} ha sido removida del taller.`);
    }

    if (deleteTarget.type === 'employee') {
      const emp = deleteTarget.item as Employee;
      const updatedList = employees.filter(e => e.id !== emp.id);
      setEmployees(updatedList);
      saveStoredEmployees(updatedList);

      // Unassign tickets assigned to this employee
      const unassignedTickets = tickets.map(t => 
        t.assignedTechnicianId === emp.id ? { ...t, assignedTechnicianId: undefined } : t
      );
      setTickets(unassignedTickets);
      saveStoredTickets(unassignedTickets);

      addToast('error', 'Técnico Eliminado', `El usuario ${emp.name} fue retirado de la plantilla.`);
    }

    if (deleteTarget.type === 'inventory') {
      const inv = deleteTarget.item as InventoryItem;
      const updatedList = inventory.filter(i => i.id !== inv.id);
      setInventory(updatedList);
      saveStoredInventory(updatedList);

      addToast('error', 'Repuesto Eliminado', `El artículo ${inv.name} fue eliminado del inventario.`);
    }

    setDeleteTarget(null);
  };

  // Update employee (Update)
  const handleUpdateEmployee = (updatedEmp: Employee) => {
    const updatedList = employees.map(e => e.id === updatedEmp.id ? updatedEmp : e);
    setEmployees(updatedList);
    saveStoredEmployees(updatedList);

    if (currentUser?.id === updatedEmp.id) {
      setCurrentUser(updatedEmp);
      saveCurrentUser(updatedEmp);
    }

    addToast('success', 'Técnico Actualizado', `Datos de ${updatedEmp.name} guardados correctamente.`);
  };

  // Add employee (Create)
  const handleAddEmployee = (newEmp: Employee) => {
    const updatedList = [...employees, newEmp];
    setEmployees(updatedList);
    saveStoredEmployees(updatedList);
    addToast('success', 'Nuevo Técnico Registrado', `${newEmp.name} ha sido añadido al equipo.`);
  };

  // Delete employee request
  const requestDeleteEmployee = (emp: Employee) => {
    setDeleteTarget({
      type: 'employee',
      item: emp,
      title: `¿Eliminar a ${emp.name}?`,
      message: `Se desvinculará este empleado (${emp.roleLabel}) y las órdenes a su cargo quedarán pendientes de reasignación.`,
    });
  };

  // Update inventory (Update)
  const handleUpdateInventory = (newInventory: InventoryItem[]) => {
    setInventory(newInventory);
    saveStoredInventory(newInventory);
  };

  // Update single inventory item
  const handleSaveInventoryItem = (updatedItem: InventoryItem) => {
    const updatedList = inventory.map(i => i.id === updatedItem.id ? updatedItem : i);
    setInventory(updatedList);
    saveStoredInventory(updatedList);
    addToast('success', 'Repuesto Actualizado', `Datos de ${updatedItem.name} guardados correctamente.`);
  };

  // Delete inventory item request
  const requestDeleteInventoryItem = (item: InventoryItem) => {
    setDeleteTarget({
      type: 'inventory',
      item,
      title: `¿Eliminar ${item.name}?`,
      message: `El repuesto con SKU ${item.sku} será eliminado del catálogo de existencias.`,
    });
  };

  // Deduct inventory when part is used in ticket
  const handleDeductInventory = (itemId: string, qty: number) => {
    const updated = inventory.map(item => {
      if (item.id === itemId) {
        return { ...item, stock: Math.max(0, item.stock - qty) };
      }
      return item;
    });
    handleUpdateInventory(updated);
  };

  // Select user / role
  const handleSelectUser = (user: Employee) => {
    setCurrentUser(user);
    saveCurrentUser(user);
    addToast('info', 'Sesión Cambiada', `Ahora operando como ${user.name} (${user.roleLabel}).`);
  };

  // Reset to default data
  const handleResetData = () => {
    if (window.confirm('¿Desea restaurar todos los tickets, técnicos y repuestos a los valores demostrativos iniciales?')) {
      resetToDefaultData();
      const freshTickets = getStoredTickets();
      const freshEmployees = getStoredEmployees();
      const freshInventory = getStoredInventory();
      const freshUser = getCurrentUser();

      setTickets(freshTickets);
      setEmployees(freshEmployees);
      setInventory(freshInventory);
      setCurrentUser(freshUser);
      setSelectedTicket(null);
      setPrintingTicket(null);
      addToast('info', 'Datos Reiniciados', 'La base de datos volvió al estado de demostración.');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Iniciando entorno TechFix Pro...</p>
        </div>
      </div>
    );
  }

  // If in Print View, render only the printable sheet
  if (printingTicket) {
    return (
      <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
        <PrintTicketView
          ticket={printingTicket}
          employees={employees}
          onBack={() => setPrintingTicket(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Navigation Header */}
      <Header
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenNewTicket={() => setIsNewTicketOpen(true)}
        tickets={tickets}
        onResetData={handleResetData}
      />

      {/* Main Workspace Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {currentView === 'kanban' && (
          <KanbanBoard
            tickets={tickets}
            employees={employees}
            onSelectTicket={(t) => setSelectedTicket(t)}
            onEditTicket={(t) => setTicketToEdit(t)}
            onDeleteTicket={requestDeleteTicket}
            onMoveTicketStage={handleMoveTicketStage}
            onOpenNewTicket={() => setIsNewTicketOpen(true)}
          />
        )}

        {currentView === 'list' && (
          <TicketList
            tickets={tickets}
            employees={employees}
            onSelectTicket={(t) => setSelectedTicket(t)}
            onEditTicket={(t) => setTicketToEdit(t)}
            onDeleteTicket={requestDeleteTicket}
            onPrintTicket={(t) => setPrintingTicket(t)}
            onOpenNewTicket={() => setIsNewTicketOpen(true)}
          />
        )}

        {currentView === 'staff' && (
          <StaffScheduleView
            employees={employees}
            tickets={tickets}
            onUpdateEmployee={handleUpdateEmployee}
            onAddEmployee={handleAddEmployee}
            onEditEmployee={(emp) => setEmployeeToEdit(emp)}
            onDeleteEmployee={requestDeleteEmployee}
            onSelectTicket={(t) => setSelectedTicket(t)}
          />
        )}

        {currentView === 'inventory' && (
          <InventoryView
            inventory={inventory}
            onUpdateInventory={handleUpdateInventory}
            onEditItem={(item) => setInventoryToEdit(item)}
            onDeleteItem={requestDeleteInventoryItem}
          />
        )}

        {currentView === 'reports' && (
          <ReportsView
            tickets={tickets}
            employees={employees}
          />
        )}

      </main>

      {/* Detailed 360 Ticket Modal */}
      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          employees={employees}
          inventory={inventory}
          currentUser={currentUser}
          isOpen={Boolean(selectedTicket)}
          onClose={() => setSelectedTicket(null)}
          onSaveTicket={handleSaveTicket}
          onEditTicket={(t) => {
            setSelectedTicket(null);
            setTicketToEdit(t);
          }}
          onDeleteTicket={(t) => {
            setSelectedTicket(null);
            requestDeleteTicket(t);
          }}
          onPrintTicket={(t) => {
            setSelectedTicket(null);
            setPrintingTicket(t);
          }}
          onDeductInventory={handleDeductInventory}
        />
      )}

      {/* Intake New Ticket Modal (Create) */}
      <NewTicketModal
        isOpen={isNewTicketOpen}
        onClose={() => setIsNewTicketOpen(false)}
        onSave={handleAddTicket}
        employees={employees}
        currentUser={currentUser}
        existingCount={tickets.length}
      />

      {/* Full Ticket Edit Modal (Update) */}
      {ticketToEdit && (
        <EditTicketModal
          ticket={ticketToEdit}
          employees={employees}
          isOpen={Boolean(ticketToEdit)}
          onClose={() => setTicketToEdit(null)}
          onSave={handleSaveTicket}
        />
      )}

      {/* Employee Edit Modal (Update) */}
      {employeeToEdit && (
        <EditEmployeeModal
          employee={employeeToEdit}
          isOpen={Boolean(employeeToEdit)}
          onClose={() => setEmployeeToEdit(null)}
          onSave={handleUpdateEmployee}
        />
      )}

      {/* Inventory Edit Modal (Update) */}
      {inventoryToEdit && (
        <EditInventoryModal
          item={inventoryToEdit}
          isOpen={Boolean(inventoryToEdit)}
          onClose={() => setInventoryToEdit(null)}
          onSave={handleSaveInventoryItem}
        />
      )}

      {/* Confirm Delete Safety Modal (Delete) */}
      {deleteTarget && (
        <ConfirmDeleteModal
          isOpen={Boolean(deleteTarget)}
          title={deleteTarget.title}
          message={deleteTarget.message}
          onConfirm={confirmDeleteAction}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Role / User Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        currentUser={currentUser}
        employees={employees}
        onSelectUser={handleSelectUser}
      />

      {/* Toast Feedback Messages */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">TechFix Pro</span>
            <span>·</span>
            <span>Sistema Integral de Servicio Técnico en 4 Etapas con CRUD Completo</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            01 Entrada · 02 Desarmado · 03 Recomposición · 04 Salida & QC
          </div>
        </div>
      </footer>

    </div>
  );
}
