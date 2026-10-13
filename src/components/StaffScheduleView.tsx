import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Phone, 
  ChevronRight,
  Pencil,
  Trash2,
  Sparkles,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { Employee, ShiftType, TechnicianStatus, Ticket, UserRole } from '../types';
import { STAGE_CONFIG } from '../utils/helpers';

interface StaffScheduleViewProps {
  employees: Employee[];
  tickets: Ticket[];
  onUpdateEmployee: (updated: Employee) => void;
  onAddEmployee: (newEmp: Employee) => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employee: Employee) => void;
  onSelectTicket: (ticket: Ticket) => void;
}

export const StaffScheduleView: React.FC<StaffScheduleViewProps> = ({
  employees,
  tickets,
  onUpdateEmployee,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onSelectTicket,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState<UserRole>('tecnico');
  const [newEmpRoleLabel, setNewEmpRoleLabel] = useState('Técnico Especialista');
  const [newEmpSpecialty, setNewEmpSpecialty] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('+591 ');
  const [newEmpShiftType, setNewEmpShiftType] = useState<ShiftType>('manana');
  const [newEmpStartTime, setNewEmpStartTime] = useState('08:00');
  const [newEmpEndTime, setNewEmpEndTime] = useState('16:00');

  // Stats
  const totalTechnicians = employees.filter(e => e.role === 'tecnico' || e.role === 'supervisor').length;
  const availableNow = employees.filter(e => e.status === 'disponible').length;
  const inRepairNow = employees.filter(e => e.status === 'en_reparacion').length;
  const activeTicketsTotal = tickets.filter(t => t.stage !== 'salida' || t.status !== 'entregado').length;

  const handleStatusChange = (employee: Employee, newStatus: TechnicianStatus) => {
    onUpdateEmployee({
      ...employee,
      status: newStatus,
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim() || !newEmpSpecialty.trim()) return;

    const days = newEmpShiftType === 'tarde' ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] : ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
    const shiftName = newEmpShiftType === 'manana' ? 'Turno Mañana' : newEmpShiftType === 'tarde' ? 'Turno Tarde' : 'Turno Completo';

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name: newEmpName.trim(),
      email: `${newEmpName.toLowerCase().replace(/\s+/g, '.')}@techfix.com`,
      role: newEmpRole,
      roleLabel: newEmpRoleLabel || 'Técnico Especialista',
      specialty: newEmpSpecialty.trim(),
      phone: newEmpPhone.trim(),
      shift: {
        type: newEmpShiftType,
        name: shiftName,
        days,
        startTime: newEmpStartTime,
        endTime: newEmpEndTime,
      },
      status: 'disponible',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      activeTicketsCount: 0,
      completedThisMonth: 0,
    };

    onAddEmployee(newEmp);
    setShowAddModal(false);
    setNewEmpName('');
    setNewEmpSpecialty('');
  };

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Gestión de Personal Técnico, Horarios & Turnos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervisión integral de asignaciones, modificación de turnos y cobertura de laboratorio.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Registrar Nuevo Técnico</span>
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-xs block">Personal Técnico</span>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {employees.length}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {totalTechnicians} especialistas de banco
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-xs block">Disponibles Ahora</span>
          <span className="text-2xl font-bold text-emerald-600 font-mono tabular-nums">
            {availableNow}
          </span>
          <span className="text-[11px] text-emerald-700 block mt-0.5">
            Listos para asignación
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-xs block">En Reparación Activa</span>
          <span className="text-2xl font-bold text-blue-600 font-mono tabular-nums">
            {inRepairNow}
          </span>
          <span className="text-[11px] text-blue-700 block mt-0.5">
            Operando en mesa de trabajo
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-xs block">Tickets en Proceso</span>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {activeTicketsTotal}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Repartidos entre el equipo
          </span>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {employees.map((emp) => {
          const empTickets = tickets.filter(t => t.assignedTechnicianId === emp.id && (t.stage !== 'salida' || t.status !== 'entregado'));

          return (
            <div
              key={emp.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all text-xs group"
            >
              <div>
                {/* Employee Top Card with Edit & Delete */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm truncate">
                        {emp.name}
                      </h3>
                      <p className="text-blue-700 font-bold text-[11px] truncate">
                        {emp.roleLabel}
                      </p>
                      <p className="text-slate-500 text-[11px] truncate mt-0.5">
                        {emp.specialty}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEditEmployee(emp)}
                      title="Editar Técnico / Horario"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteEmployee(emp)}
                      title="Eliminar Técnico"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Schedule and Shift Pill */}
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      Horario:
                    </span>
                    <span className="font-bold text-slate-800 font-mono">
                      {emp.shift.startTime} – {emp.shift.endTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Turno & Días:</span>
                    <span className="text-slate-700 font-medium truncate max-w-[170px]">
                      {emp.shift.name} ({emp.shift.days.join(', ')})
                    </span>
                  </div>

                  {/* Status Live Selector */}
                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60">
                    <span className="text-slate-500 font-medium">Disponibilidad:</span>
                    <select
                      value={emp.status}
                      onChange={(e) => handleStatusChange(emp, e.target.value as TechnicianStatus)}
                      className="px-2 py-0.5 rounded border border-slate-300 bg-white font-bold text-[11px]"
                    >
                      <option value="disponible">🟢 Disponible</option>
                      <option value="en_reparacion">🔵 En reparación</option>
                      <option value="en_descanso">🟡 En descanso</option>
                      <option value="fuera_de_turno">⚪ Fuera de turno</option>
                    </select>
                  </div>
                </div>

                {/* Assigned active tickets list */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                      Mantenimientos Asignados ({empTickets.length})
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      Cerrados mes: {emp.completedThisMonth}
                    </span>
                  </div>

                  {empTickets.length === 0 ? (
                    <div className="p-2.5 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-[11px]">
                      Sin tickets pendientes asignados
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {empTickets.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => onSelectTicket(t)}
                          className="p-2 rounded-lg bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer flex items-center justify-between shadow-2xs"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-bold font-mono text-[11px] text-slate-900 flex items-center gap-1.5">
                              <span>{t.code}</span>
                              <span className="text-[10px] font-normal text-slate-500">
                                ({STAGE_CONFIG[t.stage].name})
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 truncate">
                              {t.device.brand} {t.device.model}
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Quick contact info */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-mono">{emp.phone}</span>
                <span className="truncate max-w-[150px]">{emp.email}</span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Weekly Schedule Coverage Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Matriz Semanal de Cobertura de Turnos (Taller Central)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Distribución horaria para asegurar atención ininterrumpida en recepción y laboratorio.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
              <tr>
                <th className="p-3 border-r border-slate-200">Empleado / Rol</th>
                <th className="p-3 border-r border-slate-200">Horario Oficial</th>
                {daysOfWeek.map((day) => (
                  <th key={day} className="p-3 text-center border-r border-slate-200 last:border-r-0">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="p-3 border-r border-slate-200">
                    <div className="font-bold text-slate-900">{emp.name}</div>
                    <div className="text-[11px] text-slate-500">{emp.roleLabel}</div>
                  </td>
                  <td className="p-3 border-r border-slate-200 font-mono text-[11px]">
                    {emp.shift.startTime} – {emp.shift.endTime}
                  </td>
                  {daysOfWeek.map((day) => {
                    const shortDay = day.substring(0, 3);
                    const isWorking = emp.shift.days.some(d => d.startsWith(shortDay) || (shortDay === 'Mié' && d.includes('Mié')));

                    return (
                      <td key={day} className="p-2.5 text-center border-r border-slate-200 last:border-r-0">
                        {isWorking ? (
                          <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200 font-mono">
                            {emp.shift.startTime}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-[11px]">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="font-bold text-slate-900 text-base">
              Registrar Nuevo Empleado / Técnico
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="text-slate-600 block mb-1 font-medium">Nombre completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Martín Soliz"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">Rol y Cargo</label>
                <select
                  value={newEmpRole}
                  onChange={(e) => {
                    const r = e.target.value as UserRole;
                    setNewEmpRole(r);
                    if (r === 'tecnico') setNewEmpRoleLabel('Técnico Especialista');
                    if (r === 'supervisor') setNewEmpRoleLabel('Supervisor de Laboratorio');
                    if (r === 'recepcion') setNewEmpRoleLabel('Recepción y Atención');
                    if (r === 'admin') setNewEmpRoleLabel('Administrador de Taller');
                  }}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                >
                  <option value="tecnico">Técnico de Laboratorio</option>
                  <option value="supervisor">Supervisor de Control de Calidad</option>
                  <option value="recepcion">Recepción y Servicio al Cliente</option>
                  <option value="admin">Administrador General</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">Especialidad técnica</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Audio & Fuentes, Apple MacBooks, Microsoldadura"
                  value={newEmpSpecialty}
                  onChange={(e) => setNewEmpSpecialty(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">Teléfono / Móvil</label>
                <input
                  type="text"
                  placeholder="+591 7XXXXXXX"
                  value={newEmpPhone}
                  onChange={(e) => setNewEmpPhone(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Turno</label>
                  <select
                    value={newEmpShiftType}
                    onChange={(e) => {
                      const st = e.target.value as ShiftType;
                      setNewEmpShiftType(st);
                      if (st === 'manana') { setNewEmpStartTime('08:00'); setNewEmpEndTime('16:00'); }
                      if (st === 'tarde') { setNewEmpStartTime('13:00'); setNewEmpEndTime('21:00'); }
                      if (st === 'completo') { setNewEmpStartTime('08:30'); setNewEmpEndTime('17:30'); }
                    }}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="manana">Mañana</option>
                    <option value="tarde">Tarde</option>
                    <option value="completo">Completo</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Inicio</label>
                  <input
                    type="time"
                    value={newEmpStartTime}
                    onChange={(e) => setNewEmpStartTime(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Fin</label>
                  <input
                    type="time"
                    value={newEmpEndTime}
                    onChange={(e) => setNewEmpEndTime(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold"
                >
                  Guardar Empleado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
