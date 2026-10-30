import React from 'react';
import { 
  Plus, 
  Kanban, 
  TableProperties, 
  Users, 
  Package, 
  BarChart3, 
  UserCheck, 
  RotateCcw,
  ChevronRight,
  ShieldAlert,
  Clock,
  Layers,
  X,
  Sparkles,
  Search,
  CheckCircle2,
  Wrench
} from 'lucide-react';
import { Employee, Ticket } from '../types';
import { formatCurrency } from '../utils/helpers';

interface SidebarProps {
  currentView: 'kanban' | 'list' | 'staff' | 'inventory' | 'reports';
  onViewChange: (view: 'kanban' | 'list' | 'staff' | 'inventory' | 'reports') => void;
  currentUser: Employee;
  onOpenLogin: () => void;
  onOpenNewTicket: () => void;
  tickets: Ticket[];
  onResetData: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

interface MenuItem {
  id: 'kanban' | 'list' | 'staff' | 'inventory' | 'reports';
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeClass?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  currentUser,
  onOpenLogin,
  onOpenNewTicket,
  tickets,
  onResetData,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const activeTicketsCount = tickets.filter(t => t.stage !== 'salida' || t.status !== 'entregado').length;
  const urgentCount = tickets.filter(t => t.priority === 'urgente' && t.stage !== 'salida').length;
  const readyPickupCount = tickets.filter(t => t.stage === 'salida' && t.status !== 'entregado').length;

  const menuSections: MenuSection[] = [
    {
      title: 'PANEL PRINCIPAL',
      items: [
        {
          id: 'kanban' as const,
          label: 'Tablero 4 Etapas',
          icon: <Kanban className="w-5 h-5 shrink-0" />,
          badge: `${activeTicketsCount} activas`,
          badgeClass: 'bg-purple-100 text-[#8C57FF]',
        },
        {
          id: 'list' as const,
          label: 'Directorio de Órdenes',
          icon: <TableProperties className="w-5 h-5 shrink-0" />,
          badge: `${tickets.length}`,
          badgeClass: 'bg-slate-100 text-slate-700',
        },
      ],
    },
    {
      title: 'GESTIÓN OPERATIVA',
      items: [
        {
          id: 'staff' as const,
          label: 'Personal & Turnos',
          icon: <Users className="w-5 h-5 shrink-0" />,
        },
        {
          id: 'inventory' as const,
          label: 'Repuestos & Insumos',
          icon: <Package className="w-5 h-5 shrink-0" />,
        },
      ],
    },
    {
      title: 'REPORTES & ANALÍTICAS',
      items: [
        {
          id: 'reports' as const,
          label: 'Métricas & Porcentajes',
          icon: <BarChart3 className="w-5 h-5 shrink-0" />,
          badge: '100% BOB',
          badgeClass: 'bg-emerald-100 text-emerald-700',
        },
      ],
    },
  ];

  const handleNavClick = (view: 'kanban' | 'list' | 'staff' | 'inventory' | 'reports') => {
    onViewChange(view);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Materio Bootstrap 5 Lateral Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between text-slate-700 transition-transform duration-300 ease-in-out shrink-0 select-none shadow-sm ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Materio Geometric M Icon */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9E6CFF] to-[#8C57FF] flex items-center justify-center text-white shadow-md shadow-purple-500/30">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 18V6L9.5 13L15 6V18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="19" cy="18" r="2" fill="white" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900">
                    MATERIO
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-[#8C57FF] uppercase tracking-wider">
                    PRO
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  TechFix Pro · Taller & QC
                </div>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg md:hidden transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Materio Primary Action Button (+ Nueva Orden) */}
          <button
            onClick={() => {
              onOpenNewTicket();
              setIsMobileOpen(false);
            }}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-[#9E6CFF] to-[#8C57FF] hover:from-[#9155FD] hover:to-[#7E4EE6] text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/30 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Nueva Orden de Servicio</span>
          </button>
        </div>

        {/* Menu Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {section.title}
              </div>

              {section.items.map((item) => {
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      isActive
                        ? 'bg-gradient-to-r from-[#9E6CFF] to-[#8C57FF] text-white shadow-md shadow-purple-500/30'
                        : 'text-slate-600 hover:bg-purple-50 hover:text-[#8C57FF]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#8C57FF]'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : item.badgeClass
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Workshop Live Status Card */}
          <div className="pt-2 px-1">
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Estado del Taller</span>
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Operativo
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-600">
                <span>En Proceso:</span>
                <span className="font-bold text-slate-900">{activeTicketsCount} equipos</span>
              </div>

              {urgentCount > 0 && (
                <div className="flex justify-between items-center text-[11px] text-rose-600 font-semibold">
                  <span>Prioritarias:</span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                    {urgentCount} urgentes
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-[11px] text-emerald-600 font-medium">
                <span>Listos p/ Entrega:</span>
                <span className="font-bold text-slate-900">{readyPickupCount} equipos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: User Profile Switcher & Bootstrap 5 Edition Badge */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
          {/* User selector button */}
          <button
            onClick={() => {
              onOpenLogin();
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-purple-50/60 border border-slate-200/90 text-left transition-colors group shadow-2xs"
            title="Cambiar usuario o rol de acceso"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-xl object-cover border border-slate-200 group-hover:border-[#8C57FF] transition-colors"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div className="min-w-0 text-xs">
                <div className="font-bold text-slate-800 truncate max-w-[130px] group-hover:text-[#8C57FF]">
                  {currentUser.name}
                </div>
                <div className="text-slate-400 text-[11px] flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-[#8C57FF]" />
                  <span className="capitalize">{currentUser.roleLabel || currentUser.role}</span>
                </div>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#8C57FF] transition-colors shrink-0" />
          </button>

          {/* System Status & Reset */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-slate-600 text-[11px]">Taller Activo</span>
            </div>

            <button
              onClick={onResetData}
              title="Restablecer demostración a estado inicial"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
