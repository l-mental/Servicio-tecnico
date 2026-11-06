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
import { Sidebar } from './components/Sidebar';
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
import { Menu, Plus } from 'lucide-react';

export default function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);

  // View state: Default to streamlined List View as requested
  const [currentView, setCurrentView] = useState<'list' | 'kanban' | 'staff' | 'inventory' | 'reports'>('list');
  
  // Modals state
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketToEdit, setTicketToEdit] = useState<Ticket | null>(null);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [inventoryToEdit, setInventoryToEdit] = useState<InventoryItem | null>(null);
  
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [printingTicket, setPrintingTicket] = useState<Ticket | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
    const isEntregado = newStage === 'entregado' || newStage === 'salida';

    const updated: Ticket = {
      ...target,
      stage: newStage,
      status: isEntregado ? 'entregado' : 'en_progreso',
      updatedAt: now,
      timeline: [
        {
          id: `tm-${Date.now()}`,
          timestamp: now,
          authorName: currentUser?.name || 'Sistema',
          authorRole: currentUser?.roleLabel || 'Operador',
          actionType: isEntregado ? 'entregado' : 'cambio_etapa',
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

  // Liquidate pending balance & mark delivered
  const handleLiquidateBalance = (ticket: Ticket) => {
    const now = new Date().toISOString();
    const updated: Ticket = {
      ...ticket,
      isPaid: true,
      pendingBalance: 0,
      advancePayment: ticket.fixedCost,
      stage: 'entregado',
      status: 'entregado',
      updatedAt: now,
      timeline: [
        {
          id: `tm-${Date.now()}`,
          timestamp: now,
          authorName: currentUser?.name || 'Caja',
          authorRole: currentUser?.roleLabel || 'Operador',
          actionType: 'entregado',
          title: 'Saldo Liquidado y Equipo Entregado',
          description: `Se cobró el saldo pendiente de Bs. ${ticket.pendingBalance} y se entregó el equipo con garantía.`,
          stage: 'entregado',
        },
        ...ticket.timeline,
      ],
    };

    const updatedList = tickets.map(t => t.id === updated.id ? updated : t);
    setTickets(updatedList);
    saveStoredTickets(updatedList);
    addToast('success', 'Saldo Liquidado', `Orden ${ticket.code}: saldo cobrado y entrega concluida.`);
  };

  // Assign technician directly from list
  const handleAssignTechnician = (ticketId: string, technicianId: string) => {
    const target = tickets.find(t => t.id === ticketId);
    if (!target) return;
    const tech = employees.find(e => e.id === technicianId);
    const now = new Date().toISOString();

    const updated: Ticket = {
      ...target,
      assignedTechnicianId: technicianId,
      stage: target.stage === 'por_asignar' || target.stage === 'entrada' ? 'en_reparacion' : target.stage,
      updatedAt: now,
      timeline: [
        {
          id: `tm-${Date.now()}`,
          timestamp: now,
          authorName: currentUser?.name || 'Sistema',
          authorRole: currentUser?.roleLabel || 'Operador',
          actionType: 'asignacion',
          title: tech ? `Asignado a ${tech.name}` : 'Técnico desasignado',
          description: tech ? `Orden asignada al técnico especialista ${tech.name}.` : 'Orden puesta como pendiente.',
          stage: target.stage,
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

    addToast('success', 'Técnico Asignado', `Orden ${target.code} asignada a ${tech?.name}.`);
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
    <div className="min-h-screen bg-[#F4F5FA] flex flex-row font-sans selection:bg-[#8C57FF] selection:text-white antialiased text-[#4B465C]">
      
      {/* Materio Lateral Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenNewTicket={() => setIsNewTicketOpen(true)}
        tickets={tickets}
        onResetData={handleResetData}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Full-Screen Workspace Area */}
      <div className="flex-1 min-w-0 w-full flex flex-col min-h-screen bg-[#F4F5FA]">
        
        {/* Materio Floating Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 shadow-[0_2px_10px_0_rgba(76,78,100,0.06)]">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 -ml-1 text-slate-600 hover:text-[#8C57FF] hover:bg-purple-50 rounded-xl md:hidden transition-colors shrink-0"
              title="Abrir menú lateral"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Materio Search Input */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-400 w-full max-w-xs focus-within:border-[#8C57FF] focus-within:ring-2 focus-within:ring-purple-500/10 transition-all">
              <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span className="text-xs text-slate-500">Buscar en taller...</span>
              <span className="ml-auto text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-400">Ctrl+/</span>
            </div>

            {/* View Title Pill for Mobile or Desktop */}
            <div className="min-w-0 pl-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-900 tracking-tight">
                  {currentView === 'kanban' && 'Tablero 4 Etapas'}
                  {currentView === 'list' && 'Directorio de Órdenes'}
                  {currentView === 'staff' && 'Personal & Turnos'}
                  {currentView === 'inventory' && 'Repuestos & Insumos'}
                  {currentView === 'reports' && 'Analíticas & Porcentajes'}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-[#8C57FF] border border-purple-200">
                  Bolivianos (Bs.)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* User chip */}
            <button
              onClick={() => setIsLoginOpen(true)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 text-left"
              title="Perfil de operador"
            >
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-purple-200"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div className="hidden xl:block text-xs">
                <div className="font-bold text-slate-800 leading-none">{currentUser.name.split(' ')[0]}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 capitalize">{currentUser.role}</div>
              </div>
            </button>

            {/* Materio Primary Action Button */}
            <button
              onClick={() => setIsNewTicketOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#9E6CFF] to-[#8C57FF] hover:from-[#9155FD] hover:to-[#7E4EE6] text-white text-xs font-bold rounded-xl shadow-md shadow-purple-500/30 transition-all active:scale-98"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">+ Nueva Orden</span>
              <span className="sm:hidden">Ingreso</span>
            </button>
          </div>
        </header>

        {/* Fullscreen Fluid Content Area */}
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
        
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
            onMoveTicketStage={handleMoveTicketStage}
            onLiquidateBalance={handleLiquidateBalance}
            onAssignTechnician={handleAssignTechnician}
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

      {/* Quiet Full-Width Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-3.5 text-xs text-slate-500">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-slate-800">TechFix Pro</span>
            <span>·</span>
            <span className="font-bold text-[#8C57FF]">Materio Pro Edition</span>
            <span>·</span>
            <span>Servicio Técnico en 4 Etapas</span>
            <span className="hidden sm:inline">· Moneda: Bolivianos (Bs.) · Fuente: Arial · Pantalla Completa</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            01 Entrada · 02 Desarmado · 03 Recomposición · 04 Salida & QC
          </div>
        </div>
      </footer>

      </div> {/* Closes flex-1 content area */}

    </div> /* Closes outer min-h-screen flex-row */
  );
}
