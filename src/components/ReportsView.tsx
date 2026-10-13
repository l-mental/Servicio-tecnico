import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Download, 
  CheckCircle2, 
  Wrench, 
  Laptop, 
  Smartphone, 
  Gamepad2, 
  Calendar 
} from 'lucide-react';
import { Employee, Ticket, TicketStage } from '../types';
import { STAGE_CONFIG, formatCurrency, calculateTicketTotals } from '../utils/helpers';

interface ReportsViewProps {
  tickets: Ticket[];
  employees: Employee[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  tickets,
  employees,
}) => {
  // Aggregate KPIs
  const totalBilled = tickets.reduce((acc, t) => acc + calculateTicketTotals(t).total, 0);
  const totalPartsCost = tickets.reduce((acc, t) => acc + calculateTicketTotals(t).partsCost, 0);
  const totalLaborCost = tickets.reduce((acc, t) => acc + t.laborCost, 0);
  const estimatedNetProfit = totalBilled - totalPartsCost - (totalLaborCost * 0.3); // estimación de margen
  
  const completedTickets = tickets.filter(t => t.stage === 'salida');
  const activeTickets = tickets.filter(t => t.stage !== 'salida' || t.status !== 'entregado');
  const successRate = Math.round((completedTickets.length / (tickets.length || 1)) * 100);

  const totalMinutes = tickets.reduce((acc, t) => acc + t.timeSpentMinutes, 0);
  const avgMinutesPerTicket = Math.round(totalMinutes / (tickets.length || 1));

  // Stage distribution
  const stages: TicketStage[] = ['entrada', 'desarmado', 'recomposicion', 'salida'];
  const stageStats = stages.map(stg => {
    const list = tickets.filter(t => t.stage === stg);
    const value = list.reduce((acc, t) => acc + calculateTicketTotals(t).total, 0);
    return {
      stage: stg,
      config: STAGE_CONFIG[stg],
      count: list.length,
      value,
      percentage: Math.round((list.length / (tickets.length || 1)) * 100),
    };
  });

  // Technician performance
  const techStats = employees.filter(e => e.role === 'tecnico' || e.role === 'supervisor').map(tech => {
    const techTickets = tickets.filter(t => t.assignedTechnicianId === tech.id);
    const closed = techTickets.filter(t => t.stage === 'salida').length;
    const billed = techTickets.reduce((acc, t) => acc + calculateTicketTotals(t).total, 0);
    const mins = techTickets.reduce((acc, t) => acc + t.timeSpentMinutes, 0);

    return {
      tech,
      totalAssigned: techTickets.length,
      closed,
      billed,
      hours: (mins / 60).toFixed(1),
    };
  });

  // Device types distribution
  const deviceCounts: Record<string, number> = {};
  tickets.forEach(t => {
    deviceCounts[t.device.type] = (deviceCounts[t.device.type] || 0) + 1;
  });

  // Export data as JSON file
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tickets, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `reporte_techfix_ordenes_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export data as CSV file
  const handleExportCSV = () => {
    const headers = ['Codigo', 'Fecha', 'Etapa', 'Prioridad', 'Cliente', 'Telefono', 'Marca', 'Modelo', 'Serie', 'Tecnico', 'ManoDeObra', 'Repuestos', 'Total', 'Pagado'];
    const rows = tickets.map(t => {
      const totals = calculateTicketTotals(t);
      const tech = employees.find(e => e.id === t.assignedTechnicianId);
      return [
        t.code,
        t.createdAt.split('T')[0],
        STAGE_CONFIG[t.stage].name,
        t.priority,
        `"${t.customer.name}"`,
        `"${t.customer.phone}"`,
        `"${t.device.brand}"`,
        `"${t.device.model}"`,
        `"${t.device.serialNumber}"`,
        `"${tech?.name || 'Sin asignar'}"`,
        t.laborCost,
        totals.partsTotal,
        totals.total,
        t.isPaid ? 'SI' : 'NO',
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", `reporte_taller_techfix_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Reportes Técnicos & Análisis Operativo
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas consolidadas de rendimiento por etapa, productividad del equipo y balance financiero.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar JSON</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-xs block">Facturación Total</span>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatCurrency(totalBilled)}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {tickets.length} órdenes registradas
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-xs block">Margen Neto Estimado</span>
          <span className="text-2xl font-bold text-emerald-600 font-mono tabular-nums">
            {formatCurrency(estimatedNetProfit)}
          </span>
          <span className="text-[11px] text-emerald-700 block mt-0.5">
            Descontando repuestos e insumos
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-xs block">Tiempo Medio / Equipo</span>
          <span className="text-2xl font-bold text-blue-600 font-mono tabular-nums">
            {avgMinutesPerTicket} mins
          </span>
          <span className="text-[11px] text-blue-700 block mt-0.5">
            {(avgMinutesPerTicket / 60).toFixed(1)} horas de labor promedio
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-xs block">Tasa de Efectividad</span>
          <span className="text-2xl font-bold text-purple-600 font-mono tabular-nums">
            {successRate}%
          </span>
          <span className="text-[11px] text-purple-700 block mt-0.5">
            {completedTickets.length} órdenes en etapa de Salida/QC
          </span>
        </div>
      </div>

      {/* 4 Stages Funnel & Volume Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Distribución de Carga en las 4 Etapas del Servicio
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stageStats.map((st) => (
            <div key={st.stage} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-mono flex items-center justify-center font-bold">
                    0{st.config.step}
                  </span>
                  {st.config.name}
                </span>
                <span className="text-xs font-bold font-mono text-slate-700">
                  {st.count} eq.
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(5, st.percentage)}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>{st.percentage}% del total</span>
                <span className="font-mono tabular-nums font-semibold text-slate-800">
                  {formatCurrency(st.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technician Productivity Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Rendimiento & Métricas por Técnico
          </h2>
          <span className="text-xs text-slate-500">
            Seguimiento de tareas completadas y volumen facturado
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Técnico</th>
                <th className="py-3 px-4">Especialidad</th>
                <th className="py-3 px-4 text-center">Órdenes a Cargo</th>
                <th className="py-3 px-4 text-center">Completados / Salida</th>
                <th className="py-3 px-4 text-center">Horas Invertidas</th>
                <th className="py-3 px-4 text-right">Facturación Generada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {techStats.map((item) => (
                <tr key={item.tech.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.tech.avatar}
                        alt={item.tech.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{item.tech.name}</div>
                        <div className="text-[11px] text-slate-500">{item.tech.roleLabel}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate text-[11px]">
                    {item.tech.specialty}
                  </td>
                  <td className="py-3 px-4 text-center font-mono tabular-nums font-bold text-slate-800">
                    {item.totalAssigned}
                  </td>
                  <td className="py-3 px-4 text-center font-mono tabular-nums text-emerald-700 font-semibold">
                    {item.closed}
                  </td>
                  <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-600">
                    {item.hours} hrs
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                    {formatCurrency(item.billed)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Equipment Category Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900">
          Tipos de Dispositivos Ingresados al Taller
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          {Object.entries(deviceCounts).map(([type, count]) => (
            <div key={type} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <span className="capitalize font-bold text-slate-900 block">{type}s</span>
              <span className="text-xl font-bold font-mono text-blue-600 tabular-nums">
                {count}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {Math.round((count / tickets.length) * 100)}% de volumen
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
