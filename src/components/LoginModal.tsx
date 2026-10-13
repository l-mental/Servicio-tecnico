import React from 'react';
import { X, ShieldCheck, Check, UserCheck, Lock } from 'lucide-react';
import { Employee, UserRole } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Employee;
  employees: Employee[];
  onSelectUser: (user: Employee) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  employees,
  onSelectUser,
}) => {
  if (!isOpen) return null;

  const roleDescriptions: Record<UserRole, { badge: string; perms: string[] }> = {
    admin: {
      badge: 'Control Total',
      perms: ['Acceso total a finanzas y márgenes', 'Gestión de personal y horarios', 'Recepción y cierre de órdenes', 'Administración de repuestos'],
    },
    supervisor: {
      badge: 'Supervisión Técnica',
      perms: ['Aprobación de Control de Calidad (QC)', 'Asignación y balanceo de órdenes', 'Supervisión de laboratorio', 'Revisión de checklists'],
    },
    tecnico: {
      badge: 'Operación Técnica',
      perms: ['Diagnóstico y microinspección', 'Ejecución de recomposición y soldadura', 'Registro de repuestos utilizados', 'Control de horas de labor'],
    },
    recepcion: {
      badge: 'Atención & Caja',
      perms: ['Recepción y apertura en Etapa 1 (Entrada)', 'Contacto a clientes por WhatsApp', 'Cobranza y facturación', 'Entrega de equipos en Salida'],
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Autenticación & Selección de Rol de Acceso
              </h2>
              <p className="text-xs text-slate-400">
                Cambie instantáneamente entre usuarios del taller para validar flujos y permisos.
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

        {/* User Role Profiles List */}
        <div className="p-6 space-y-3 max-h-[75vh] overflow-y-auto text-xs">
          <p className="text-slate-600 mb-2 font-medium">
            Seleccione el perfil con el que desea operar en esta sesión:
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            {employees.map((emp) => {
              const isSelected = emp.id === currentUser.id;
              const roleInfo = roleDescriptions[emp.role];

              return (
                <div
                  key={emp.id}
                  onClick={() => {
                    onSelectUser(emp);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm truncate">
                          {emp.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white font-mono">
                          {emp.role}
                        </span>
                      </div>
                      <div className="text-slate-600 font-medium text-xs truncate mt-0.5">
                        {emp.roleLabel} · <span className="text-slate-400 font-normal">{emp.specialty}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                        {roleInfo.perms.slice(0, 2).map((p, idx) => (
                          <span key={idx} className="flex items-center gap-1">
                            <span className="text-emerald-500">✓</span> {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isSelected ? (
                      <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs">
                        <Check className="w-3.5 h-3.5" />
                        Activo
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 font-semibold text-slate-700 text-xs transition-colors"
                      >
                        Ingresar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Sesión actual guardada localmente en <strong className="text-slate-700">localStorage</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
