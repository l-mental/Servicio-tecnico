import React from 'react';
import { 
  Wrench, 
  Plus, 
  Kanban, 
  TableProperties, 
  Users, 
  Package, 
  BarChart3, 
  UserCheck, 
  RotateCcw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Employee, Ticket } from '../types';

interface HeaderProps {
  currentView: 'kanban' | 'list' | 'staff' | 'inventory' | 'reports';
  onViewChange: (view: 'kanban' | 'list' | 'staff' | 'inventory' | 'reports') => void;
  currentUser: Employee;
  onOpenLogin: () => void;
  onOpenNewTicket: () => void;
  tickets: Ticket[];
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  currentUser,
  onOpenLogin,
  onOpenNewTicket,
  tickets,
  onResetData,
}) => {
  const activeTicketsCount = tickets.filter(t => t.stage !== 'salida' || t.status !== 'entregado').length;

  return (
    <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          
          {/* Zone 1: Single Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 border border-blue-400/30">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white whitespace-nowrap">
                TechFix <span className="text-blue-400">Pro</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                SaaS Taller
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
            <button
              onClick={() => onViewChange('kanban')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                currentView === 'kanban'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Kanban className="w-4 h-4 text-blue-400" />
              <span>Tablero 4 Etapas</span>
              <span className="text-[10px] bg-slate-800 text-blue-300 px-1.5 py-0.5 rounded-full font-mono border border-slate-700">
                {activeTicketsCount}
              </span>
            </button>

            <button
              onClick={() => onViewChange('list')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                currentView === 'list'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <TableProperties className="w-4 h-4 text-indigo-400" />
              <span>Directorio Órdenes</span>
            </button>

            <button
              onClick={() => onViewChange('staff')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                currentView === 'staff'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Personal & Horarios</span>
            </button>

            <button
              onClick={() => onViewChange('inventory')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                currentView === 'inventory'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Package className="w-4 h-4 text-emerald-400" />
              <span>Repuestos</span>
            </button>

            <button
              onClick={() => onViewChange('reports')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                currentView === 'reports'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>Analítica & KPIs</span>
            </button>
          </nav>

          {/* Zone 3: User Switcher & Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Reset data helper */}
            <button
              onClick={onResetData}
              title="Restablecer base de datos inicial"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* User Profile / Quick Role Switch */}
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-colors whitespace-nowrap group shadow-xs"
              title="Cambiar usuario o rol de acceso"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover border border-slate-700 group-hover:border-blue-400 transition-colors"
              />
              <div className="hidden lg:block text-xs leading-tight">
                <div className="font-bold text-slate-100 truncate max-w-[120px]">
                  {currentUser.name}
                </div>
                <div className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <UserCheck className="w-3 h-3 text-emerald-400" />
                  <span className="capitalize font-mono">{currentUser.role}</span>
                </div>
              </div>
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onOpenNewTicket}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all whitespace-nowrap active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Orden</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2.5 gap-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => onViewChange('kanban')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${currentView === 'kanban' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300'}`}
          >
            Tablero
          </button>
          <button
            onClick={() => onViewChange('list')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${currentView === 'list' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300'}`}
          >
            Órdenes
          </button>
          <button
            onClick={() => onViewChange('staff')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${currentView === 'staff' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300'}`}
          >
            Técnicos
          </button>
          <button
            onClick={() => onViewChange('inventory')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${currentView === 'inventory' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300'}`}
          >
            Repuestos
          </button>
          <button
            onClick={() => onViewChange('reports')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${currentView === 'reports' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300'}`}
          >
            Reportes
          </button>
        </div>

      </div>
    </header>
  );
};
