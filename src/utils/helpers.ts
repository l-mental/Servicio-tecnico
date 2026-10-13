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
  entrada: {
    step: 1,
    name: 'Entrada',
    description: 'Recepción, inspección física y registro inicial',
    shortDesc: 'Recepción & Diagnóstico',
    color: 'blue',
    borderActive: 'border-blue-500',
    bgActive: 'bg-blue-500/10',
    textColor: 'text-blue-700',
  },
  desarmado: {
    step: 2,
    name: 'Desarmado',
    description: 'Despiece seguro, microdiagnóstico y detección de fallas',
    shortDesc: 'Despiece & Microinspección',
    color: 'amber',
    borderActive: 'border-amber-500',
    bgActive: 'bg-amber-500/10',
    textColor: 'text-amber-700',
  },
  recomposicion: {
    step: 3,
    name: 'Recomposición',
    description: 'Sustitución de componentes, micro-soldadura y ensamble',
    shortDesc: 'Reparación & Reensamble',
    color: 'indigo',
    borderActive: 'border-indigo-500',
    bgActive: 'bg-indigo-500/10',
    textColor: 'text-indigo-700',
  },
  salida: {
    step: 4,
    name: 'Salida',
    description: 'Control de calidad QC final, garantía y entrega al cliente',
    shortDesc: 'Control QC & Entrega',
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
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
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
  const partsCost = ticket.parts.reduce((acc, p) => acc + p.unitCost * p.quantity, 0);
  const partsTotal = ticket.parts.reduce((acc, p) => acc + p.unitPrice * p.quantity, 0);
  const total = ticket.laborCost + partsTotal;
  const netMargin = total - (ticket.laborCost * 0.4 + partsCost); // Margen estimado

  return {
    partsCost,
    partsTotal,
    laborCost: ticket.laborCost,
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
  const stageName = STAGE_CONFIG[ticket.stage].name;
  const totals = calculateTicketTotals(ticket);

  let message = `Hola ${ticket.customer.name}! Le contactamos de *TechFix Pro Servicio Técnico* respecto a su orden *${ticket.code}* (${ticket.device.brand} ${ticket.device.model}).\n\n`;
  message += `📌 *Estado Actual:* Etapa ${STAGE_CONFIG[ticket.stage].step}/4 - *${stageName}*\n`;

  if (ticket.stage === 'entrada') {
    message += `Su equipo fue recibido exitosamente para diagnóstico y revisión inicial.`;
  } else if (ticket.stage === 'desarmado') {
    message += `El equipo se encuentra en mesa de trabajo para microinspección profunda de componentes.`;
  } else if (ticket.stage === 'recomposicion') {
    message += `Estamos ejecutando el procedimiento de reparación e instalación de piezas autorizadas. Total estimado: ${formatCurrency(totals.total)}.`;
  } else if (ticket.stage === 'salida') {
    if (ticket.status === 'listo_entrega') {
      message += `🎉 ¡Buenas noticias! Su equipo ha superado exitosamente el Control de Calidad (QC) y ya está *LISTO PARA RETIRO* en nuestro taller. Total a liquidar: ${formatCurrency(totals.total)}. Garantía: ${ticket.warrantyDays} días.`;
    } else {
      message += `El servicio concluyó con éxito y cuenta con garantía técnica de ${ticket.warrantyDays} días. ¡Gracias por su confianza!`;
    }
  }

  return `https://wa.me/${phoneClean}?text=${encodeURIComponent(message)}`;
}
