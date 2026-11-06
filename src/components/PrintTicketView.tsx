import React from 'react';
import { ArrowLeft, Printer, Download, CheckSquare, Square } from 'lucide-react';
import { Employee, Ticket } from '../types';
import { formatCurrency, calculateTicketTotals } from '../utils/helpers';

interface PrintTicketViewProps {
  ticket: Ticket;
  employees: Employee[];
  onBack: () => void;
}

export const PrintTicketView: React.FC<PrintTicketViewProps> = ({
  ticket,
  onBack,
}) => {
  const totals = calculateTicketTotals(ticket);

  const handlePrint = () => {
    window.print();
  };

  // Format date DD / MM / YYYY
  const getFormattedDate = (dateStr?: string) => {
    try {
      const d = dateStr ? new Date(dateStr) : new Date();
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return { day, month, year };
    } catch {
      return { day: '--', month: '--', year: '----' };
    }
  };

  const { day, month, year } = getFormattedDate(ticket.createdAt);

  const category = ticket.device.equipmentCategory || (
    ticket.device.type === 'laptop' ? 'laptop' :
    ticket.device.type === 'pc' ? 'pc' : 'otro'
  );

  return (
    <div className="space-y-6">
      
      {/* Control bar (hidden during print) */}
      <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Directorio</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden md:inline">
            Formato oficial: <strong>Nota de Recepción de Equipos SCANTEC</strong>
          </span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0B3558] hover:bg-[#082742] text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Nota / PDF</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE OFFICIAL SHEET - SCANTEC MULTISERVICIOS */}
      <div 
        id="scantec-print-document"
        className="bg-white p-6 sm:p-8 max-w-3xl mx-auto border-2 border-[#0B3558] shadow-md text-slate-900 font-sans text-xs print:p-0 print:border-none print:shadow-none print:max-w-none print:w-full"
        style={{ fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif" }}
      >
        
        {/* HEADER BLOCK */}
        <div className="bg-[#042442] text-white p-3 sm:p-4 rounded-t-sm flex flex-col sm:flex-row items-center justify-between gap-2 border-b-2 border-[#0B3558]">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            {/* Scantec Geometric Tech Logo */}
            <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
              <svg viewBox="0 0 100 100" className="w-12 h-12 text-[#00A3FF]">
                <polygon points="50,5 95,85 5,85" fill="none" stroke="currentColor" strokeWidth="9" strokeLinejoin="round" />
                <polygon points="50,30 78,80 22,80" fill="#042442" stroke="white" strokeWidth="5" strokeLinejoin="round" />
                <path d="M40,65 L50,45 L60,65" stroke="#00A3FF" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black tracking-wider uppercase text-white font-mono">
                SCANTEC
              </div>
              <div className="text-[9px] tracking-widest text-[#00A3FF] uppercase font-bold -mt-0.5">
                MULTISERVICIOS
              </div>
            </div>
          </div>

          {/* Central Title */}
          <div className="text-center">
            <h1 className="text-base sm:text-xl font-black tracking-wide uppercase text-white drop-shadow-xs">
              NOTA DE RECEPCION DE EQUIPOS
            </h1>
            <div className="flex items-center justify-center gap-3 text-[10px] sm:text-[11px] text-slate-200 mt-0.5 flex-wrap">
              <span><strong>Whatsapp:</strong> 68808160</span>
              <span>·</span>
              <span><strong>NIT:</strong> 8983914018</span>
            </div>
          </div>

          {/* Order Number Box */}
          <div className="bg-white text-slate-900 px-3 py-1.5 rounded-sm border-2 border-white text-center shrink-0 min-w-[130px]">
            <span className="text-[9px] font-extrabold uppercase tracking-wider block text-slate-500">
              Orden Nº:
            </span>
            <span className="text-sm sm:text-base font-black font-mono tracking-tight text-[#0B3558] block">
              {ticket.code}
            </span>
          </div>
        </div>

        {/* SECTION 1: DATOS DEL CLIENTE */}
        <div className="mt-3">
          <div className="bg-[#0B3558] text-white text-center font-black uppercase tracking-wider text-[11px] py-1">
            DATOS DEL CLIENTE
          </div>
          <div className="border border-t-0 border-[#0B3558] divide-y divide-[#0B3558]">
            <div className="p-2 flex items-center">
              <span className="font-bold text-[11px] uppercase mr-2 shrink-0">NOMBRE Y APELLIDO:</span>
              <span className="font-bold text-[12px] uppercase text-slate-800 tracking-wide flex-1">
                {ticket.customer.name}
              </span>
            </div>
            <div className="grid grid-cols-12 divide-y sm:divide-y-0 sm:divide-x divide-[#0B3558]">
              <div className="col-span-12 sm:col-span-5 p-2 flex items-center">
                <span className="font-bold text-[10px] uppercase mr-2 shrink-0">TELEFONO:</span>
                <span className="font-mono font-bold text-[11px] text-slate-800">
                  {ticket.customer.phone}
                </span>
              </div>
              <div className="col-span-12 sm:col-span-4 p-2 flex items-center">
                <span className="font-bold text-[10px] uppercase mr-2 shrink-0">REF:</span>
                <span className="font-mono text-[11px] text-slate-800">
                  {ticket.customer.refPhone || '71234567'}
                </span>
              </div>
              <div className="col-span-12 sm:col-span-3 p-2 flex items-center justify-between sm:justify-start">
                <span className="font-bold text-[10px] uppercase mr-2 shrink-0">FECHA :</span>
                <span className="font-mono font-bold text-[11px] text-slate-800 tracking-wider">
                  {day} / {month} / {year}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: DATOS DEL EQUIPO */}
        <div className="mt-3">
          <div className="bg-[#0B3558] text-white text-center font-black uppercase tracking-wider text-[11px] py-1">
            DATOS DEL EQUIPO
          </div>
          <div className="border border-t-0 border-[#0B3558] divide-y divide-[#0B3558]">
            
            {/* Equipment Checkboxes */}
            <div className="p-2 bg-slate-50/70 grid grid-cols-3 sm:grid-cols-6 gap-2 text-[10px] font-bold">
              <label className="flex items-center gap-1.5 cursor-default">
                <span>Laptop</span>
                <span className="w-4 h-4 border border-slate-700 bg-white inline-flex items-center justify-center font-mono text-[10px] font-bold">
                  {category === 'laptop' ? '✓' : ''}
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-default">
                <span>PC</span>
                <span className="w-4 h-4 border border-slate-700 bg-white inline-flex items-center justify-center font-mono text-[10px] font-bold">
                  {category === 'pc' ? '✓' : ''}
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-default">
                <span className="truncate">Equipo de Sonido</span>
                <span className="w-4 h-4 border border-slate-700 bg-white inline-flex items-center justify-center font-mono text-[10px] font-bold">
                  {category === 'equipo_sonido' ? '✓' : ''}
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-default">
                <span>Televisor</span>
                <span className="w-4 h-4 border border-slate-700 bg-white inline-flex items-center justify-center font-mono text-[10px] font-bold">
                  {category === 'televisor' ? '✓' : ''}
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-default">
                <span>Microonda</span>
                <span className="w-4 h-4 border border-slate-700 bg-white inline-flex items-center justify-center font-mono text-[10px] font-bold">
                  {category === 'microonda' ? '✓' : ''}
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-default">
                <span>Cafeteras</span>
                <span className="w-4 h-4 border border-slate-700 bg-white inline-flex items-center justify-center font-mono text-[10px] font-bold">
                  {category === 'cafeteras' ? '✓' : ''}
                </span>
              </label>
            </div>

            {/* Model & Other */}
            <div className="grid grid-cols-12 divide-y sm:divide-y-0 sm:divide-x divide-[#0B3558]">
              <div className="col-span-12 sm:col-span-7 p-2 flex items-center">
                <span className="font-bold text-[10px] uppercase mr-2 shrink-0">Modelo :</span>
                <span className="font-bold text-[11px] text-slate-800">
                  {ticket.device.brand} {ticket.device.model} {ticket.device.serialNumber ? `(S/N: ${ticket.device.serialNumber})` : ''}
                </span>
              </div>
              <div className="col-span-12 sm:col-span-5 p-2 flex items-center">
                <span className="font-bold text-[10px] uppercase mr-2 shrink-0">Otro Equipo:</span>
                <span className="text-[11px] text-slate-700">
                  {category === 'otro' ? (ticket.device.otherEquipmentName || ticket.device.brand) : '--------------------'}
                </span>
              </div>
            </div>

            {/* Usage Time & First Owner / Repaired Before */}
            <div className="p-2 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-[10px]">
              <div className="sm:col-span-4 flex items-center">
                <span className="font-bold uppercase mr-2 shrink-0">Tiempo de uso:</span>
                <span className="text-slate-800 font-medium">
                  {ticket.device.usageTime || '1 año y 6 meses'}
                </span>
              </div>
              <div className="sm:col-span-4 flex items-center gap-2">
                <span className="font-bold uppercase">Primer dueño:</span>
                <span className="flex items-center gap-1">
                  <span>Si</span>
                  <span className="w-3.5 h-3.5 border border-slate-700 inline-flex items-center justify-center font-mono text-[9px] font-bold">
                    {ticket.device.isFirstOwner !== false ? '✓' : ''}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span>NO</span>
                  <span className="w-3.5 h-3.5 border border-slate-700 inline-flex items-center justify-center font-mono text-[9px] font-bold">
                    {ticket.device.isFirstOwner === false ? '✓' : ''}
                  </span>
                </span>
              </div>
              <div className="sm:col-span-4 flex items-center gap-2">
                <span className="font-bold uppercase">¿Fue reparado antes?</span>
                <span className="flex items-center gap-1">
                  <span>SI</span>
                  <span className="w-3.5 h-3.5 border border-slate-700 inline-flex items-center justify-center font-mono text-[9px] font-bold">
                    {ticket.device.wasRepairedBefore === true ? '✓' : ''}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span>NO</span>
                  <span className="w-3.5 h-3.5 border border-slate-700 inline-flex items-center justify-center font-mono text-[9px] font-bold">
                    {ticket.device.wasRepairedBefore !== true ? '✓' : ''}
                  </span>
                </span>
              </div>
            </div>

            {/* Previous Repair notes */}
            <div className="p-2 space-y-1">
              <div className="flex items-baseline">
                <span className="font-bold text-[10px] uppercase mr-2 shrink-0">Antecedentes de Reparaciones :</span>
                <span className="text-slate-700 text-[10px] font-mono border-b border-dotted border-slate-400 flex-1">
                  {ticket.device.repairHistoryNotes || 'Ninguna reparación previa en laboratorios no autorizados.'}
                </span>
              </div>
              <div className="flex items-baseline">
                <span className="font-bold text-[10px] uppercase mr-2 shrink-0">Cuanto Tiempo:</span>
                <span className="text-slate-700 text-[10px] font-mono border-b border-dotted border-slate-400 flex-1">
                  {ticket.device.repairHistoryTime || 'Sin antecedentes previos.'}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 3: DESCRIPCION DEL PROBLEMA */}
        <div className="mt-3">
          <div className="bg-[#0B3558] text-white text-center font-black uppercase tracking-wider text-[11px] py-1">
            DESCRIPCION DEL PROBLEMA
          </div>
          <div className="border border-t-0 border-[#0B3558] p-3 space-y-1.5 bg-slate-50/30">
            <p className="text-[11px] text-slate-800 leading-relaxed font-mono">
              {ticket.problemReported}
            </p>
            {ticket.device.physicalCondition && ticket.device.physicalCondition.length > 0 && (
              <p className="text-[10px] text-slate-500 font-mono">
                <strong>Estado Físico / Accesorios:</strong> {ticket.device.physicalCondition.join(', ')} · Accesorios: {ticket.device.accessories.join(', ') || 'Sin accesorios adicionales'}
              </p>
            )}
            <div className="border-b border-dotted border-slate-300 h-2"></div>
            <div className="border-b border-dotted border-slate-300 h-2"></div>
          </div>
        </div>

        {/* SECTION 4: PRESUPUESTO & CONDICIONES ECONÓMICAS */}
        <div className="mt-3">
          <div className="bg-[#0B3558] text-white text-center font-black uppercase tracking-wider text-[11px] py-1">
            PRESUPUESTO
          </div>
          <div className="border border-t-0 border-[#0B3558] divide-y divide-[#0B3558]">
            
            {/* Row 1: Diagnóstico, Min y Max */}
            <div className="grid grid-cols-12 divide-y sm:divide-y-0 sm:divide-x divide-[#0B3558] text-[10px]">
              <div className="col-span-12 sm:col-span-6 p-2 flex items-center">
                <span className="font-bold uppercase mr-2 shrink-0">Diagnostico:</span>
                <span className="text-slate-800 truncate">
                  {ticket.technicalDiagnosis || 'Revisión y diagnóstico de circuito principal y periféricos.'}
                </span>
              </div>
              <div className="col-span-6 sm:col-span-3 p-2 flex items-center">
                <span className="font-bold uppercase mr-2 shrink-0">Costo Minimo:</span>
                <span className="font-mono font-bold text-slate-800">
                  {formatCurrency(ticket.minCost || Math.round(totals.fixedCost * 0.85))}
                </span>
              </div>
              <div className="col-span-6 sm:col-span-3 p-2 flex items-center">
                <span className="font-bold uppercase mr-2 shrink-0">Costo maximo:</span>
                <span className="font-mono font-bold text-slate-800">
                  {formatCurrency(ticket.maxCost || Math.round(totals.fixedCost * 1.25))}
                </span>
              </div>
            </div>

            {/* Row 2: COSTO FIJO, ANTICIPO INICIAL Y SALDO PENDIENTE (SOLICITADO POR EL USUARIO) */}
            <div className="grid grid-cols-3 divide-x divide-[#0B3558] bg-slate-50 text-[11px] font-bold">
              <div className="p-2.5 text-center">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block">COSTO FIJO TOTAL</span>
                <span className="text-sm font-black font-mono text-[#0B3558]">
                  {formatCurrency(totals.fixedCost)}
                </span>
              </div>
              <div className="p-2.5 text-center bg-emerald-50/50">
                <span className="text-[9px] uppercase tracking-wider text-emerald-700 block">ANTICIPO INICIAL REGISTRADO</span>
                <span className="text-sm font-black font-mono text-emerald-800">
                  {formatCurrency(totals.advancePayment)}
                </span>
              </div>
              <div className="p-2.5 text-center bg-amber-50/50">
                <span className="text-[9px] uppercase tracking-wider text-amber-700 block">SALDO PENDIENTE A LA ENTREGA</span>
                <span className="text-sm font-black font-mono text-amber-900">
                  {totals.pendingBalance <= 0 ? 'Bs. 0.00 (LIQUIDADO)' : formatCurrency(totals.pendingBalance)}
                </span>
              </div>
            </div>

            {/* Row 3: Tiempos de Reparación */}
            <div className="grid grid-cols-2 divide-x divide-[#0B3558] text-[10px]">
              <div className="p-2 flex items-center">
                <span className="font-bold uppercase mr-2 shrink-0">Tiempo Mín. de Reparación:</span>
                <span className="font-mono text-slate-800">
                  {ticket.minRepairTime || '24 Horas Hábiles'}
                </span>
              </div>
              <div className="p-2 flex items-center">
                <span className="font-bold uppercase mr-2 shrink-0">Tiempo Máximo de Reparación:</span>
                <span className="font-mono text-slate-800">
                  {ticket.maxRepairTime || '72 Horas Hábiles'}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 5: TÉRMINOS Y POLÍTICAS DE SERVICIO TÉCNICO (VERBATIM DE LA IMAGEN) */}
        <div className="mt-3">
          <div className="bg-[#0B3558] text-white text-center font-black uppercase tracking-wider text-[11px] py-1">
            TERMINOS Y POLITICAS DE SERVICIO TECNICO
          </div>
          <div className="border border-t-0 border-[#0B3558] p-3 text-[9.5px] leading-tight space-y-1.5 text-slate-800 bg-slate-50/20">
            <p>
              <strong>1.</strong> El Costo de diagnóstico Aplica cuando no es posible reparar por falta de repuestos comerciales, daños múltiples, imposibilidad del cliente para asumir costos adicionales o retiro inesperado del equipo antes del tiempo acordado.
            </p>
            <p>
              <strong>2.</strong> El tiempo de reparación se contabiliza en días hábiles según nuestro horario de atención, estableciéndose un plazo mínimo y máximo según la complejidad del servicio y disponibilidad de repuestos.
            </p>
            <p>
              <strong>3.</strong> El cliente debe notificar con anticipación su llegada al taller para el retiro del equipo.
            </p>
            <p>
              <strong>4.</strong> El cliente tiene un plazo máximo de 7 días calendario para retirar su equipo una vez reparado o declarado no reparable. Pasado este plazo, el equipo será trasladado a almacenamiento.
            </p>
            <p>
              <strong>5.</strong> El costo por almacenamiento es de Bs. 120 por mes. El taller no se responsabiliza por deterioro o daños que puedan ocurrir durante este tiempo.
            </p>
            <p>
              <strong>6.</strong> Transcurridos 3 meses en almacenamiento sin retiro, el equipo se considerará abandonado y se procederá a su disposición final, reciclaje o desecho, según corresponda.
            </p>
            <p>
              <strong>7.</strong> La garantía inicia desde que el equipo es notificado como reparado.
            </p>
            <p>
              <strong>8.</strong> Equipos de procedencia no justificada que se encuentren en alguna situacion legal por terceros sera puesto a dispocición de autoridades pertinentes.
            </p>

            <div className="pt-1.5 text-center font-black text-[10px] text-slate-900 uppercase tracking-tight">
              SI ESTA DE ACUERDO CON LO MENCIONADO FIRME ABAJO PARA CONSTANCIA Y RESPALDO DE AMBAS PARTES.
            </div>
          </div>
        </div>

        {/* FOOTER: SIGNATURE BLOCK */}
        <div className="mt-8 pt-4 flex items-end justify-between px-6 pb-2 text-xs">
          <div className="w-1/2 flex items-center">
            <span className="font-bold uppercase text-[11px] mr-2">Firma:</span>
            <span className="border-b-2 border-slate-800 flex-1 h-6"></span>
          </div>
          <div className="w-1/3 flex items-center ml-6">
            <span className="font-bold uppercase text-[11px] mr-2">CI:</span>
            <span className="border-b-2 border-slate-800 flex-1 h-6 font-mono text-[11px] pl-1 font-bold">
              {ticket.customer.documentId || ''}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
