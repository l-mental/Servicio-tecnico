import React, { useState } from 'react';
import { X, Save, User, Clock } from 'lucide-react';
import { Employee, ShiftType, TechnicianStatus, UserRole } from '../types';

interface EditEmployeeModalProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Employee) => void;
}

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  employee,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(employee.name);
  const [email, setEmail] = useState(employee.email);
  const [role, setRole] = useState<UserRole>(employee.role);
  const [roleLabel, setRoleLabel] = useState(employee.roleLabel);
  const [specialty, setSpecialty] = useState(employee.specialty);
  const [phone, setPhone] = useState(employee.phone);
  const [status, setStatus] = useState<TechnicianStatus>(employee.status);
  const [avatar, setAvatar] = useState(employee.avatar);
  const [shiftType, setShiftType] = useState<ShiftType>(employee.shift.type);
  const [startTime, setStartTime] = useState(employee.shift.startTime);
  const [endTime, setEndTime] = useState(employee.shift.endTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const days = shiftType === 'tarde' ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] : ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
    const shiftName = shiftType === 'manana' ? 'Turno Mañana' : shiftType === 'tarde' ? 'Turno Tarde' : 'Turno Completo';

    const updated: Employee = {
      ...employee,
      name: name.trim(),
      email: email.trim(),
      role,
      roleLabel: roleLabel.trim() || 'Técnico Especialista',
      specialty: specialty.trim(),
      phone: phone.trim(),
      status,
      avatar: avatar.trim() || employee.avatar,
      shift: {
        type: shiftType,
        name: shiftName,
        days,
        startTime,
        endTime,
      },
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-base">
              Modificar Técnico / Empleado
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-slate-400 block mb-1">Nombre Completo *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Rol / Permisos</label>
              <select
                value={role}
                onChange={(e) => {
                  const r = e.target.value as UserRole;
                  setRole(r);
                  if (r === 'tecnico') setRoleLabel('Técnico Especialista');
                  if (r === 'supervisor') setRoleLabel('Supervisor de Calidad');
                  if (r === 'recepcion') setRoleLabel('Recepción y Atención');
                  if (r === 'admin') setRoleLabel('Administrador General');
                }}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
              >
                <option value="tecnico">Técnico</option>
                <option value="supervisor">Supervisor QC</option>
                <option value="recepcion">Recepción</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Título del Cargo</label>
              <input
                type="text"
                value={roleLabel}
                onChange={(e) => setRoleLabel(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Especialidad Técnica *</label>
            <input
              type="text"
              required
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Teléfono</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Estado en vivo</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TechnicianStatus)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
              >
                <option value="disponible">🟢 Disponible</option>
                <option value="en_reparacion">🔵 En reparación</option>
                <option value="en_descanso">🟡 En descanso</option>
                <option value="fuera_de_turno">⚪ Fuera de turno</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <span className="font-semibold text-slate-300 block flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              Configuración de Turno & Horarios
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-slate-500 block text-[10px] mb-0.5">Turno</label>
                <select
                  value={shiftType}
                  onChange={(e) => setShiftType(e.target.value as ShiftType)}
                  className="w-full p-1.5 bg-slate-900 border border-slate-800 rounded text-white text-xs"
                >
                  <option value="manana">Mañana</option>
                  <option value="tarde">Tarde</option>
                  <option value="completo">Completo</option>
                </select>
              </div>
              <div>
                <label className="text-slate-500 block text-[10px] mb-0.5">Entrada</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-1.5 bg-slate-900 border border-slate-800 rounded text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-slate-500 block text-[10px] mb-0.5">Salida</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-1.5 bg-slate-900 border border-slate-800 rounded text-white text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Técnico</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
