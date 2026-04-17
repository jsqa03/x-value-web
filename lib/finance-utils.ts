// Pure finance utilities — no server-only code, safe to import anywhere

export type PaymentStatus = "paid" | "overdue" | "warning" | "pending";

/** Add N **business** days (skip Sat/Sun). */
export function addBusinessDays(date: Date, days: number): Date {
  const d = new Date(date);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return d;
}

export function getPaymentStatus(scheduled: string, paid: string | null): PaymentStatus {
  if (paid) return "paid";
  const now           = new Date();
  const scheduledDate = new Date(scheduled + "T12:00:00");
  const overdueDate   = addBusinessDays(scheduledDate, 2);
  if (now > overdueDate) return "overdue";
  const ms = scheduledDate.getTime() - now.getTime();
  if (ms <= 5 * 24 * 60 * 60 * 1000) return "warning";
  return "pending";
}

export function daysUntil(scheduled: string): number {
  const d = new Date(scheduled + "T12:00:00");
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}
