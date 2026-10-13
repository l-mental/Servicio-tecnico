import React from 'react';
import { Printer, ArrowLeft, ShieldCheck, CheckCircle2, Wrench } from 'lucide-react';
import { Employee, Ticket } from '../types';
import { STAGE_CONFIG, formatCurrency, formatDateTime, calculateTicketTotals } from '../utils/helpers';

interface PrintTicketViewProps {
  ticket: Ticket;
  employees: Employee[];
  onBack: () => void;
}

export const PrintTicketView: React.FC<PrintTicketViewProps> = ({
  ticket,
  employees,
  onBack,
}) => {
  const totals = calculateTicketTotals(ticket);
  const tech = employees.find(e => e.id === ticket.assignedTechnicianId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Control bar (hidden during print) */}
      <div className="no-print flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Sistema</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            Vista previa del documento técnico oficial para impresión.
          </span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Orden / PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="bg-white p-8 max-w-4xl mx-auto border border-slate-200 shadow-sm rounded-xl text-slate-900 font-sans text-xs space-y-6">
        
        {/* Document Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold">
                <Wrench className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                TechFix Pro
              </h1>
            </div>
            <p className="text-[11px] text-slate-600 font-medium mt-1">
              Servicio Técnico Especializado en Microelectrónica & Hardware
            </p>
            <p className="text-[10px] text-slate-500">
              Av. 6 de Agosto #2410, Zona Central · Tel: +591 (2) 244-8900 · NIT: 1029384756
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              ORDEN DE TRABAJO TÉCNICO
            </span>
            <span className="text-xl font-bold font-mono text-slate-900 tracking-tight block">
              {ticket.code}
            </span>
            <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
              Fecha de Emisión: {formatDateTime(new Date().toISOString())}
            </span>
            <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
              Etapa: {STAGE_CONFIG[ticket.stage].name} ({STAGE_CONFIG[ticket.stage].shortDesc})
            </span>
          </div>
        </div>

        {/* Section 1: Customer & Equipment Info */}
        <div className="grid grid-cols-2 gap-6 border border-slate-200 rounded-lg p-4 bg-slate-50/50">
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider border-b border-slate-200 pb-1">
              Datos del Propietario / Cliente
            </h3>
            <div>
              <span className="text-slate-500 text-[10px] block">Nombre Completo:</span>
              <strong className="text-slate-900 text-xs">{ticket.customer.name}</strong>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 text-[10px] block">Teléfono / WhatsApp:</span>
                <span className="font-mono text-slate-800">{ticket.customer.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">C.I. / DNI:</span>
                <span className="font-mono text-slate-800">{ticket.customer.documentId}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Email:</span>
              <span className="text-slate-800">{ticket.customer.email}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider border-b border-slate-200 pb-1">
              Datos del Dispositivo en Taller
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 text-[10px] block">Marca / Tipo:</span>
                <strong className="text-slate-900 text-xs">{ticket.device.brand} ({ticket.device.type})</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Modelo Exacto:</span>
                <strong className="text-slate-900 text-xs">{ticket.device.model}</strong>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 text-[10px] block">Número de Serie (S/N):</span>
                <span className="font-mono font-bold text-slate-900">{ticket.device.serialNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Estado de Encendido:</span>
                <span className="capitalize text-slate-800">{ticket.device.powerState.replace('_', ' ')}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Accesorios Recibidos:</span>
              <span className="text-slate-800">{ticket.device.accessories.join(', ') || 'Sin accesorios'}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Technical Diagnosis & Reported Problem */}
        <div className="border border-slate-200 rounded-lg p-4 space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              1. Motivo de Ingreso / Falla Reportada por el Cliente
            </span>
            <p className="text-slate-800 text-xs mt-0.5 leading-relaxed bg-white p-2 rounded border border-slate-100">
              {ticket.problemReported}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              2. Diagnóstico Técnico de Laboratorio (Desarmado e Inspección)
            </span>
            <p className="text-slate-800 text-xs mt-0.5 leading-relaxed bg-white p-2 rounded border border-slate-100">
              {ticket.technicalDiagnosis || 'Diagnóstico preliminar efectuado conforme a protocolo de laboratorio.'}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              3. Procedimiento de Recomposición Aplicado
            </span>
            <p className="text-slate-800 text-xs mt-0.5 leading-relaxed bg-white p-2 rounded border border-slate-100">
              {ticket.solutionApplied || 'Sustitución de componentes según presupuesto autorizado y pruebas de estabilidad.'}
            </p>
          </div>
        </div>

        {/* Section 3: Parts & Economic Breakdown */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Detalle de Conceptos & Repuestos</th>
                <th className="p-2.5 text-center">Cant.</th>
                <th className="p-2.5 text-right">Precio Unit.</th>
                <th className="p-2.5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-2.5 font-medium text-slate-900">
                  Mano de Obra Especializada (Diagnóstico, Desensamble, Recomposición y QC)
                </td>
                <td className="p-2.5 text-center font-mono">1</td>
                <td className="p-2.5 text-right font-mono">{formatCurrency(ticket.laborCost)}</td>
                <td className="p-2.5 text-right font-mono font-bold">{formatCurrency(ticket.laborCost)}</td>
              </tr>
              {ticket.parts.map((p) => (
                <tr key={p.id}>
                  <td className="p-2.5 text-slate-800">
                    {p.name}
                  </td>
                  <td className="p-2.5 text-center font-mono">{p.quantity}</td>
                  <td className="p-2.5 text-right font-mono">{formatCurrency(p.unitPrice)}</td>
                  <td className="p-2.5 text-right font-mono font-bold">{formatCurrency(p.unitPrice * p.quantity)}</td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                <td colSpan={3} className="p-2.5 text-right uppercase text-[11px]">
                  TOTAL A PAGAR:
                </td>
                <td className="p-2.5 text-right font-mono text-sm text-slate-900">
                  {formatCurrency(totals.total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 4: Warranty Policy */}
        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-[10px] text-slate-600 space-y-1">
          <strong className="text-slate-900 block font-bold text-[11px]">
            TÉRMINOS Y PÓLIZA DE GARANTÍA TÉCNICA ({ticket.warrantyDays} DÍAS)
          </strong>
          <p>
            1. El servicio técnico otorga una garantía de <strong>{ticket.warrantyDays} días calendario</strong> a partir de la fecha de entrega, cubriendo exclusivamente la mano de obra realizada y los componentes reemplazados señalados en esta orden.
          </p>
          <p>
            2. La garantía quedará automáticamente anulada si el equipo presenta sellos de seguridad rotos, evidencias de manipulación por terceros, contacto posterior con líquidos (LDI activados), golpes o sobretensiones eléctricas.
          </p>
          <p>
            3. Para cualquier reclamo o revisión es indispensable presentar el presente comprobante o documento de identidad del titular registrado.
          </p>
        </div>

        {/* Section 5: Signature Blocks */}
        <div className="grid grid-cols-2 gap-12 pt-8">
          <div className="text-center">
            <div className="border-t border-slate-400 pt-2 w-3/4 mx-auto" />
            <span className="font-bold text-slate-900 text-xs block">
              {ticket.customer.name}
            </span>
            <span className="text-[10px] text-slate-500 block">
              Firma del Cliente / Aceptación Conforme
            </span>
            <span className="text-[9px] text-slate-400 block font-mono">
              C.I. {ticket.customer.documentId}
            </span>
          </div>

          <div className="text-center">
            <div className="border-t border-slate-400 pt-2 w-3/4 mx-auto" />
            <span className="font-bold text-slate-900 text-xs block">
              {tech?.name || 'Técnico Responsable'}
            </span>
            <span className="text-[10px] text-slate-500 block">
              Firma y Sello de Control de Calidad
            </span>
            <span className="text-[9px] text-slate-400 block">
              TechFix Pro Laboratorio Central
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
