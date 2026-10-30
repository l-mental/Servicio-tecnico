import React, { useState } from 'react';
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
  Calendar,
  PieChart,
  Percent,
  Layers,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Filter
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
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week'>('all');

  // Filter tickets by selected time range
  const filteredTickets = tickets.filter(t => {
    if (timeRange === 'all') return true;
    const ticketDate = new Date(t.createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - ticketDate.getTime()) / (1000 * 3600 * 24);
    if (timeRange === 'week') return diffDays <= 7;
    if (timeRange === 'month') return diffDays <= 30;
    return true;
  });

  const totalTicketsCount = filteredTickets.length || 1;

  // Aggregate Financial KPIs in Bolivianos (Bs.)
  const totalBilled = filteredTickets.reduce((acc, t) => acc + calculateTicketTotals(t).total, 0);
  const totalPartsCost = filteredTickets.reduce((acc, t) => acc + calculateTicketTotals(t).partsCost, 0);
  const totalPartsRevenue = filteredTickets.reduce((acc, t) => acc + calculateTicketTotals(t).partsTotal, 0);
  const totalLaborCost = filteredTickets.reduce((acc, t) => acc + t.laborCost, 0);
  const estimatedNetProfit = totalBilled - totalPartsCost - (totalLaborCost * 0.35); // Margen neto
  
  // Percentages Financial
  const netProfitPercentage = totalBilled > 0 ? ((estimatedNetProfit / totalBilled) * 100) : 0;
  const partsPercentage = totalBilled > 0 ? ((totalPartsRevenue / totalBilled) * 100) : 0;
  const laborPercentage = totalBilled > 0 ? ((totalLaborCost / totalBilled) * 100) : 0;

  // Collection percentages (Cobranza)
  const paidTickets = filteredTickets.filter(t => t.isPaid);
  const pendingTickets = filteredTickets.filter(t => !t.isPaid);
  const totalCollectedBs = paidTickets.reduce((acc, t) => acc + calculateTicketTotals(t).total, 0);
  const totalPendingBs = pendingTickets.reduce((acc, t) => acc + calculateTicketTotals(t).total, 0);
  const collectedPercentage = totalBilled > 0 ? ((totalCollectedBs / totalBilled) * 100) : 0;
  const pendingPercentage = totalBilled > 0 ? ((totalPendingBs / totalBilled) * 100) : 0;

  // Stage Breakdown & Percentages
  const stages: TicketStage[] = ['entrada', 'desarmado', 'recomposicion', 'salida'];
  const stageStats = stages.map(stg => {
    const list = filteredTickets.filter(t => t.stage === stg);
    const value = list.reduce((acc, t) => acc + calculateTicketTotals(t).total, 0);
    const minutes = list.reduce((acc, t) => acc + t.timeSpentMinutes, 0);
    const volumePercent = (list.length / totalTicketsCount) * 100;
    const valuePercent = totalBilled > 0 ? (value / totalBilled) * 100 : 0;

    return {
      stage: stg,
      config: STAGE_CONFIG[stg],
      count: list.length,
      value,
      minutes,
      volumePercent: Number(volumePercent.toFixed(1)),
      valuePercent: Number(valuePercent.toFixed(1)),
    };
  });

  // Technician performance & Percentages
  const techStats = employees.filter(e => e.role === 'tecnico' || e.role === 'supervisor').map(tech => {
    const techTickets = filteredTickets.filter(t => t.assignedTechnicianId === tech.id);
    const closed = techTickets.filter(t => t.stage === 'salida').length;
    const billed = techTickets.reduce((acc, t) => acc + calculateTicketTotals(t).total, 0);
    const mins = techTickets.reduce((acc, t) => acc + t.timeSpentMinutes, 0);

    const shareOfTotalBilledPercent = totalBilled > 0 ? ((billed / totalBilled) * 100) : 0;
    const completionRatePercent = techTickets.length > 0 ? ((closed / techTickets.length) * 100) : 0;

    return {
      tech,
      totalAssigned: techTickets.length,
      closed,
      billed,
      hours: (mins / 60).toFixed(1),
      shareOfTotalBilledPercent: Number(shareOfTotalBilledPercent.toFixed(1)),
      completionRatePercent: Number(completionRatePercent.toFixed(1)),
    };
  });

  // Device types distribution with Percentages
  const deviceCounts: Record<string, number> = {};
  filteredTickets.forEach(t => {
    deviceCounts[t.device.type] = (deviceCounts[t.device.type] || 0) + 1;
  });

  const deviceDistribution = Object.entries(deviceCounts).map(([type, count]) => {
    const pct = (count / totalTicketsCount) * 100;
    return {
      type,
      count,
      percent: Number(pct.toFixed(1)),
    };
  }).sort((a, b) => b.count - a.count);

  // Time & Quality metrics
  const totalMinutes = filteredTickets.reduce((acc, t) => acc + t.timeSpentMinutes, 0);
  const avgMinutesPerTicket = Math.round(totalMinutes / totalTicketsCount);
  const successRate = Math.round((filteredTickets.filter(t => t.stage === 'salida').length / totalTicketsCount) * 100);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Codigo', 
      'Fecha', 
      'Etapa', 
      'Prioridad', 
      'Cliente', 
      'Telefono_Contacto', 
      'Tipo_Dispositivo', 
      'Marca', 
      'Modelo', 
      'Serie_SN', 
      'Tecnico_Asignado', 
      'Mano_De_Obra_Bs', 
      'Repuestos_Bs', 
      'Total_Liquidacion_Bs', 
      'Estado_Cobro',
      'Porcentaje_Total'
    ];

    const rows = filteredTickets.map(t => {
      const totals = calculateTicketTotals(t);
      const tech = employees.find(e => e.id === t.assignedTechnicianId);
      const sharePct = totalBilled > 0 ? ((totals.total / totalBilled) * 100).toFixed(2) + '%' : '0%';

      return [
        t.code,
        t.createdAt.split('T')[0],
        STAGE_CONFIG[t.stage].name,
        t.priority,
        `"${t.customer.name}"`,
        `"${t.customer.phone}"`,
        t.device.type,
        `"${t.device.brand}"`,
        `"${t.device.model}"`,
        `"${t.device.serialNumber}"`,
        `"${tech?.name || 'Sin asignar'}"`,
        t.laborCost.toFixed(2),
        totals.partsTotal.toFixed(2),
        totals.total.toFixed(2),
        t.isPaid ? 'PAGADO' : 'PENDIENTE',
        sharePct,
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", `analitica_taller_techfix_bob_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataReport = {
      generado: new Date().toISOString(),
      moneda: 'BOB (Bolivianos)',
      totales: {
        facturado_bs: totalBilled,
        margen_neto_bs: estimatedNetProfit,
        margen_porcentaje: netProfitPercentage.toFixed(1) + '%',
        cobrado_bs: totalCollectedBs,
        cobrado_porcentaje: collectedPercentage.toFixed(1) + '%',
        por_cobrar_bs: totalPendingBs,
        por_cobrar_porcentaje: pendingPercentage.toFixed(1) + '%',
      },
      distribucion_etapas: stageStats,
      distribucion_dispositivos: deviceDistribution,
      rendimiento_tecnicos: techStats,
      ordenes: filteredTickets,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataReport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `informe_ejecutivo_techfix_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full space-y-6" style={{ fontFamily: 'Arial, sans-serif' }}>
      
      {/* Top Banner with Materio Bootstrap 5 Theme */}
      <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-100 p-6 rounded-2xl shadow-[0_4px_18px_0_rgba(76,78,100,0.08)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-[#8C57FF] border border-purple-200 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5" />
              Materio Analytics Suite (%)
            </span>
            <span className="text-slate-300 text-xs">·</span>
            <span className="text-emerald-600 font-bold text-xs">Moneda Oficial: Bolivianos (Bs.)</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1.5">
            Panel Ejecutivo de Analíticas & Métricas del Taller
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Monitoreo porcentual de rentabilidad neta, desglose de facturación en Bolivianos (Bs.), efectividad de cobranza, rendimiento por técnico y embudo de las 4 etapas.
          </p>
        </div>

        {/* Controls: Time Filter & Export */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === 'week' ? 'bg-[#8C57FF] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              7 Días
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === 'month' ? 'bg-[#8C57FF] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              30 Días
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === 'all' ? 'bg-[#8C57FF] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Histórico
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#9E6CFF] to-[#8C57FF] hover:from-[#9155FD] hover:to-[#7E4EE6] text-white text-xs font-bold rounded-xl shadow-md shadow-purple-500/30 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Descargar JSON</span>
          </button>
        </div>
      </div>

      {/* Row 1: High Level KPI Cards with Percentages */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Facturación Total */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Facturación Total</span>
            <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              Bs
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {formatCurrency(totalBilled)}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>En {filteredTickets.length} órdenes registradas</span>
            <span className="text-blue-600 font-bold">100% Volumen</span>
          </div>
        </div>

        {/* Card 2: Margen Neto Estimado (%) */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Margen Neto de Ganancia</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
              %
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono tabular-nums flex items-baseline gap-2">
            <span>{formatCurrency(estimatedNetProfit)}</span>
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Margen de rentabilidad:</span>
            <span className="font-extrabold font-mono text-emerald-600">{netProfitPercentage.toFixed(1)}%</span>
          </div>
        </div>

        {/* Card 3: Eficiencia de Cobranza (%) */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Efectividad de Cobro</span>
            <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              QC
            </span>
          </div>
          <div className="text-2xl font-black text-indigo-600 font-mono tabular-nums">
            {collectedPercentage.toFixed(1)}%
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Cobrado: {formatCurrency(totalCollectedBs)}</span>
            <span className="text-amber-600 font-bold">Pendiente: {pendingPercentage.toFixed(1)}%</span>
          </div>
        </div>

        {/* Card 4: Tasa de Finalización y TAT */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Tasa de Salida / Entrega</span>
            <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
              TAT
            </span>
          </div>
          <div className="text-2xl font-black text-purple-600 font-mono tabular-nums">
            {successRate}%
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Tiempo promedio / equipo:</span>
            <span className="font-bold font-mono text-slate-900">{avgMinutesPerTicket} min</span>
          </div>
        </div>

      </div>

      {/* Row 2: Deep Percentage Distribution: Facturación (Mano de Obra vs Repuestos) & Cartera de Cobro */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Box A: Desglose Porcentual de Ingresos (Mano de Obra vs Repuestos) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Desglose de Ingresos: Mano de Obra vs. Repuestos (%)
              </h3>
              <p className="text-xs text-slate-500">
                Participación porcentual de honorarios técnicos y suministro de piezas.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-mono font-bold text-xs">
              100%
            </span>
          </div>

          {/* Large Segmented Bar */}
          <div className="w-full bg-slate-100 rounded-xl h-5 overflow-hidden flex shadow-inner">
            <div 
              style={{ width: `${laborPercentage}%` }} 
              className="bg-blue-600 h-full transition-all duration-500" 
              title={`Mano de Obra: ${laborPercentage.toFixed(1)}%`}
            />
            <div 
              style={{ width: `${partsPercentage}%` }} 
              className="bg-emerald-500 h-full transition-all duration-500" 
              title={`Repuestos: ${partsPercentage.toFixed(1)}%`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  Mano de Obra
                </span>
                <span className="font-mono font-black text-blue-700 text-sm">
                  {laborPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="text-xs font-bold font-mono text-slate-800 mt-1">
                {formatCurrency(totalLaborCost)}
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">Honorarios de diagnóstico y reparación</span>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Repuestos & Materiales
                </span>
                <span className="font-mono font-black text-emerald-700 text-sm">
                  {partsPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="text-xs font-bold font-mono text-slate-800 mt-1">
                {formatCurrency(totalPartsRevenue)}
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">Componentes e insumos facturados</span>
            </div>
          </div>
        </div>

        {/* Box B: Desglose Porcentual de Cobranza (Pagado vs Pendiente) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Control Porcentual de Cobranza & Cartera (%)
              </h3>
              <p className="text-xs text-slate-500">
                Estado de liquidación sobre el total facturado en Bolivianos.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-mono font-bold text-xs">
              {collectedPercentage.toFixed(1)}% Cobrado
            </span>
          </div>

          {/* Large Segmented Bar */}
          <div className="w-full bg-slate-100 rounded-xl h-5 overflow-hidden flex shadow-inner">
            <div 
              style={{ width: `${collectedPercentage}%` }} 
              className="bg-emerald-600 h-full transition-all duration-500" 
              title={`Cobrado: ${collectedPercentage.toFixed(1)}%`}
            />
            <div 
              style={{ width: `${pendingPercentage}%` }} 
              className="bg-amber-500 h-full transition-all duration-500" 
              title={`Pendiente: ${pendingPercentage.toFixed(1)}%`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  Cobrado / Liquidado
                </span>
                <span className="font-mono font-black text-emerald-700 text-sm">
                  {collectedPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="text-xs font-bold font-mono text-slate-800 mt-1">
                {formatCurrency(totalCollectedBs)}
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">{paidTickets.length} órdenes liquidadas</span>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Pendiente de Cobro
                </span>
                <span className="font-mono font-black text-amber-700 text-sm">
                  {pendingPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="text-xs font-bold font-mono text-slate-800 mt-1">
                {formatCurrency(totalPendingBs)}
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">{pendingTickets.length} órdenes por cobrar</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: Funnel de las 4 Etapas con división en porcentaje de volumen y valor monetario */}
      <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Distribución Porcentual en las 4 Etapas del Taller (%)
            </h3>
            <p className="text-xs text-slate-500">
              Carga de trabajo y valor económico distribuido a lo largo del flujo técnico obligatorio.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Total en taller: <strong className="text-slate-900">{formatCurrency(totalBilled)}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {stageStats.map((st) => (
            <div key={st.stage} className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-mono flex items-center justify-center font-bold">
                    0{st.config.step}
                  </span>
                  {st.config.name}
                </span>
                <span className="text-xs font-extrabold font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  {st.volumePercent}% vol.
                </span>
              </div>

              {/* Volume Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Equipos ({st.count} un.)</span>
                  <span className="font-mono font-bold text-slate-800">{st.volumePercent}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(4, st.volumePercent)}%` }}
                  />
                </div>
              </div>

              {/* Value Share Progress Bar */}
              <div className="space-y-1 pt-1 border-t border-slate-200/60">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Valor ({formatCurrency(st.value)})</span>
                  <span className="font-mono font-bold text-slate-800">{st.valuePercent}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(4, st.valuePercent)}%` }}
                  />
                </div>
              </div>

              <div className="text-[10px] text-slate-400 pt-1 flex justify-between items-center">
                <span>Tiempo acumulado:</span>
                <span className="font-mono text-slate-700 font-bold">{st.minutes} mins</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: Technician Productivity Table with Percentages */}
      <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Rendimiento, Productividad & Aporte por Técnico (%)
            </h3>
            <p className="text-xs text-slate-500">
              Porcentaje de contribución a los ingresos y tasa de resolución por especialista.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600">
            {employees.length} profesionales registrados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Técnico / Especialidad</th>
                <th className="py-3.5 px-4 text-center">Órdenes Asignadas</th>
                <th className="py-3.5 px-4 text-center">Tasa de Cierre (%)</th>
                <th className="py-3.5 px-4 text-center">Labor Invertida</th>
                <th className="py-3.5 px-4 text-right">Facturación (Bs.)</th>
                <th className="py-3.5 px-4 text-right">Aporte al Taller (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {techStats.map((item) => (
                <tr key={item.tech.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.tech.avatar}
                        alt={item.tech.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{item.tech.name}</div>
                        <div className="text-[11px] text-slate-500">{item.tech.roleLabel} · {item.tech.specialty}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono tabular-nums font-bold text-slate-800">
                    {item.totalAssigned} equipos
                  </td>

                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.completionRatePercent}%
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono tabular-nums text-slate-700">
                    {item.hours} hrs
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-slate-900 text-xs">
                    {formatCurrency(item.billed)}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-bold font-mono text-purple-700 text-xs">
                        {item.shareOfTotalBilledPercent}%
                      </span>
                      <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-purple-600 h-1.5 rounded-full" 
                          style={{ width: `${Math.min(100, item.shareOfTotalBilledPercent)}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 5: Device Breakdown by percentage with visual meters */}
      <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Distribución Porcentual por Tipo de Dispositivo (%)
            </h3>
            <p className="text-xs text-slate-500">
              Composición de equipos recibidos en el servicio técnico.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {filteredTickets.length} dispositivos totales
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {deviceDistribution.map((item) => (
            <div key={item.type} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="capitalize font-bold text-slate-900 text-xs">{item.type}s</span>
                <span className="text-xs font-black font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  {item.percent}%
                </span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.max(5, item.percent)}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>{item.count} unidades</span>
                <span className="font-mono text-slate-700 font-bold">{item.percent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
