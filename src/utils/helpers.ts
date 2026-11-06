import { Priority, Ticket, TicketStage, UserRole } from '../types';

export const STAGE_CONFIG: Record<
  TicketStage,
  {
    step: number;
    name: string;
    description: string;
    shortDesc: string;
    color: string;
    borderActive: string;
    bgActive: string;
    textColor: string;
  }
> = {
  // 4 ESTADOS OFICIALES SOLICITADOS
  por_asignar: {
    step: 1,
    name: 'Por asignar',
    description: 'Recepción del equipo, registro de costo fijo y anticipo inicial. Pendiente de asignar técnico.',
    shortDesc: 'Ingreso & Por Asignar',
    color: 'blue',
    borderActive: 'border-blue-500',
    bgActive: 'bg-blue-500/10',
    textColor: 'text-blue-700',
  },
  en_reparacion: {
    step: 2,
    name: 'En reparación',
    description: 'En mesa de laboratorio técnico: desensamble, diagnóstico y reparación de hardware.',
    shortDesc: 'En Reparación',
    color: 'amber',
    borderActive: 'border-amber-500',
    bgActive: 'bg-amber-500/10',
    textColor: 'text-amber-700',
  },
  en_prueba: {
    step: 3,
    name: 'En prueba',
    description: 'Control de calidad QC, pruebas de estrés térmico, calibración y test funcional.',
    shortDesc: 'En Prueba & QC',
    color: 'purple',
    borderActive: 'border-purple-500',
    bgActive: 'bg-purple-500/10',
    textColor: 'text-purple-700',
  },
  entregado: {
    step: 4,
    name: 'Entregado',
    description: 'Servicio concluido, cobro del saldo pendiente y entrega conforme con garantía.',
    shortDesc: 'Entregado & Liquidado',
    color: 'emerald',
    borderActive: 'border-emerald-500',
    bgActive: 'bg-emerald-500/10',
    textColor: 'text-emerald-700',
  },

  // Aliases retrocompatibles para mantener sincronía
  entrada: {
    step: 1,
    name: 'Por asignar',
    description: 'Recepción del equipo, registro de costo fijo y anticipo inicial. Pendiente de asignar técnico.',
    shortDesc: 'Ingreso & Por Asignar',
    color: 'blue',
    borderActive: 'border-blue-500',
    bgActive: 'bg-blue-500/10',
    textColor: 'text-blue-700',
  },
  desarmado: {
    step: 2,
    name: 'En reparación',
    description: 'En mesa de laboratorio técnico: desensamble, diagnóstico y reparación de hardware.',
    shortDesc: 'En Reparación',
    color: 'amber',
    borderActive: 'border-amber-500',
    bgActive: 'bg-amber-500/10',
    textColor: 'text-amber-700',
  },
  recomposicion: {
    step: 3,
    name: 'En prueba',
    description: 'Control de calidad QC, pruebas de estrés térmico, calibración y test funcional.',
    shortDesc: 'En Prueba & QC',
    color: 'purple',
    borderActive: 'border-purple-500',
    bgActive: 'bg-purple-500/10',
    textColor: 'text-purple-700',
  },
  salida: {
    step: 4,
    name: 'Entregado',
    description: 'Servicio concluido, cobro del saldo pendiente y entrega conforme con garantía.',
    shortDesc: 'Entregado & Liquidado',
    color: 'emerald',
    borderActive: 'border-emerald-500',
    bgActive: 'bg-emerald-500/10',
    textColor: 'text-emerald-700',
  },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  supervisor: 'Supervisor de Taller',
  tecnico: 'Técnico Especialista',
  recepcion: 'Atención al Cliente',
};

export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
  return `Bs. ${formatted}`;
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function formatDate(isoString?: string): string {
  if (!isoString) return 'Sin fecha';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function calculateTicketTotals(ticket: Ticket) {
  // Priorizar costo fijo explícito, o calcular suma de mano de obra y repuestos
  const fixedCost = ticket.fixedCost !== undefined && ticket.fixedCost !== null
    ? Number(ticket.fixedCost)
    : ((ticket.laborCost || 0) + (ticket.parts?.reduce((acc, p) => acc + p.unitPrice * p.quantity, 0) || 0));

  const advancePayment = Number(ticket.advancePayment || 0);
  
  // Saldo pendiente: Si ya está pagado o entregado con saldo 0
  const pendingBalance = ticket.isPaid 
    ? 0 
    : (ticket.pendingBalance !== undefined ? Number(ticket.pendingBalance) : Math.max(0, fixedCost - advancePayment));

  const partsCost = ticket.parts?.reduce((acc, p) => acc + p.unitCost * p.quantity, 0) || 0;
  const partsTotal = ticket.parts?.reduce((acc, p) => acc + p.unitPrice * p.quantity, 0) || 0;
  const laborCost = ticket.laborCost || fixedCost;
  const total = fixedCost;
  const netMargin = total - (partsCost + (laborCost * 0.35));

  return {
    fixedCost,
    advancePayment,
    pendingBalance,
    partsCost,
    partsTotal,
    laborCost,
    total,
    netMargin,
  };
}

export function getPriorityBadge(priority: Priority): { label: string; className: string } {
  switch (priority) {
    case 'urgente':
      return { label: 'Urgente', className: 'text-rose-600 bg-rose-50 border border-rose-200' };
    case 'alta':
      return { label: 'Alta', className: 'text-amber-700 bg-amber-50 border border-amber-200' };
    case 'media':
      return { label: 'Media', className: 'text-slate-700 bg-slate-100 border border-slate-200' };
    case 'baja':
      return { label: 'Baja', className: 'text-slate-500 bg-slate-50 border border-slate-200' };
  }
}

export function generateWhatsAppLink(ticket: Ticket): string {
  const phoneClean = ticket.customer.phone.replace(/[^0-9]/g, '');
  const stageCfg = STAGE_CONFIG[ticket.stage] || STAGE_CONFIG.por_asignar;
  const stageName = stageCfg.name;
  const totals = calculateTicketTotals(ticket);

  let message = `Hola ${ticket.customer.name}! Le contactamos de *SCANTEC MULTISERVICIOS* respecto a su orden *${ticket.code}* (${ticket.device.brand} ${ticket.device.model}).\n\n`;
  message += `📌 *Estado Actual:* Etapa ${stageCfg.step}/4 - *${stageName}*\n`;
  message += `💰 *Costo Fijo:* ${formatCurrency(totals.fixedCost)}\n`;
  message += `💵 *Anticipo Registrado:* ${formatCurrency(totals.advancePayment)}\n`;
  message += `⏳ *Saldo Pendiente:* ${formatCurrency(totals.pendingBalance)}\n\n`;

  if (ticket.stage === 'por_asignar' || ticket.stage === 'entrada') {
    message += `Su equipo fue recibido exitosamente en taller y está registrado para revisión e inicio de servicio.`;
  } else if (ticket.stage === 'en_reparacion' || ticket.stage === 'desarmado') {
    message += `Su equipo se encuentra actualmente en mesa técnica para procedimiento de reparación.`;
  } else if (ticket.stage === 'en_prueba' || ticket.stage === 'recomposicion') {
    message += `El equipo está en etapa de pruebas y control de calidad (QC) para garantizar su correcto funcionamiento.`;
  } else if (ticket.stage === 'entregado' || ticket.stage === 'salida') {
    if (totals.pendingBalance > 0 && !ticket.isPaid) {
      message += `🎉 ¡Su equipo está LISTO PARA ENTREGA! Saldo pendiente al momento del retiro: ${formatCurrency(totals.pendingBalance)}. Garantía: ${ticket.warrantyDays} días.`;
    } else {
      message += `🎉 El equipo fue entregado conforme con garantía de ${ticket.warrantyDays} días. ¡Gracias por confiar en SCANTEC!`;
    }
  }

  return `https://wa.me/${phoneClean}?text=${encodeURIComponent(message)}`;
}
