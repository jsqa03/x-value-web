import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  DollarSign, TrendingDown, TrendingUp, Percent,
  Clock, AlertTriangle, CheckCircle2, Calendar,
  ReceiptText, Wallet,
} from "lucide-react";
import { getPaymentStatus, daysUntil, formatCOP, type PaymentStatus } from "@/lib/finance-utils";
import RegisterPaymentModal from "./RegisterPaymentModal";
import ExpenseModal from "./ExpenseModal";

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Payment {
  id: string;
  contract_id: string;
  payment_month: number;
  scheduled_date: string;
  paid_date: string | null;
  amount: number;
  notes: string | null;
  contract: { client_name: string; service_type: string } | null;
}

interface Expense {
  id: string;
  expense_date: string;
  concept: string;
  amount: number;
  category: string;
  responsible: { full_name: string | null; email: string } | null;
}

interface AssignableUser {
  id: string;
  full_name: string | null;
  email: string;
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_META: Record<PaymentStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  paid:    { label: "Pagado",   color: "#22c55e", bg: "rgba(34,197,94,0.08)",    border: "rgba(34,197,94,0.25)",    icon: CheckCircle2  },
  warning: { label: "Próximo",  color: "#f59e0b", bg: "rgba(245,158,11,0.08)",   border: "rgba(245,158,11,0.25)",   icon: Clock         },
  overdue: { label: "En mora",  color: "#ef4444", bg: "rgba(239,68,68,0.08)",    border: "rgba(239,68,68,0.25)",    icon: AlertTriangle },
  pending: { label: "Pendiente",color: "#71717a", bg: "rgba(113,113,122,0.06)",  border: "rgba(113,113,122,0.2)",   icon: Calendar      },
};

function StatusBadge({ status }: { status: PaymentStatus }) {
  const m = STATUS_META[status];
  const Icon = m.icon;
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ color: m.color, background: m.bg, border: `1px solid ${m.border}` }}
    >
      <Icon size={9} />
      {m.label}
    </span>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, accent, icon: Icon }: {
  label: string; value: string; sub: string; accent: string; icon: React.ElementType;
}) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">{label}</p>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${accent}12`, border: `1px solid ${accent}20` }}>
          <Icon size={13} style={{ color: accent }} />
        </div>
      </div>
      <p className="text-white font-bold text-xl tracking-tight leading-none">{value}</p>
      <p className="text-zinc-600 text-xs">{sub}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default async function FinanceView() {
  const ac = getAdminClient();

  // Fetch all payments with contract info
  const { data: paymentsRaw } = await ac
    .from("payments")
    .select("id, contract_id, payment_month, scheduled_date, paid_date, amount, notes, contract:contracts!contract_id(client_name, service_type)")
    .order("scheduled_date", { ascending: true });

  // Fetch all expenses with responsible info
  const { data: expensesRaw } = await ac
    .from("expenses")
    .select("id, expense_date, concept, amount, category, responsible:profiles!responsible_id(full_name, email)")
    .order("expense_date", { ascending: false });

  // Fetch users for expense modal
  const { data: usersRaw } = await ac
    .from("profiles")
    .select("id, full_name, email")
    .in("role", ["admin", "manager", "sales"])
    .order("full_name");

  const payments = (paymentsRaw ?? []) as unknown as Payment[];
  const expenses = (expensesRaw ?? []) as unknown as Expense[];
  const users    = (usersRaw    ?? []) as AssignableUser[];

  // ── KPI calculations ──────────────────────────────────────────────────────
  const paidPayments  = payments.filter((p) => p.paid_date);
  const totalRevenue  = paidPayments.reduce((s, p) => s + p.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const grossProfit   = totalRevenue - totalExpenses;
  const netMargin     = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // ── Upcoming & overdue counts ─────────────────────────────────────────────
  const unpaid  = payments.filter((p) => !p.paid_date);
  const overdue = unpaid.filter((p) => getPaymentStatus(p.scheduled_date, null) === "overdue").length;

  return (
    <div className="flex flex-col gap-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-zinc-600 text-xs tracking-widest uppercase mb-1">Panel Financiero</p>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Finanzas</h1>
        </div>
        <ExpenseModal users={users} />
      </div>

      {/* ── KPI Row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Ingresos recaudados"
          value={formatCOP(totalRevenue)}
          sub={`${paidPayments.length} pagos confirmados`}
          accent="#22c55e"
          icon={DollarSign}
        />
        <KpiCard
          label="Egresos totales"
          value={formatCOP(totalExpenses)}
          sub={`${expenses.length} registro${expenses.length !== 1 ? "s" : ""}`}
          accent="#ef4444"
          icon={TrendingDown}
        />
        <KpiCard
          label="Utilidad bruta"
          value={formatCOP(grossProfit)}
          sub={grossProfit >= 0 ? "Positivo" : "Déficit"}
          accent={grossProfit >= 0 ? "#22c55e" : "#ef4444"}
          icon={TrendingUp}
        />
        <KpiCard
          label="Margen neto"
          value={`${netMargin.toFixed(1)}%`}
          sub={overdue > 0 ? `${overdue} pago${overdue !== 1 ? "s" : ""} en mora` : "Sin moras activas"}
          accent="#f97316"
          icon={Percent}
        />
      </div>

      {/* ── Payment Schedule Table ─────────────────────────────────────── */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Wallet size={14} className="text-zinc-500" />
            <p className="text-zinc-300 text-sm font-medium">Schedule de Pagos</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium">
            {payments.length} cuotas
          </span>
        </div>

        {payments.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Wallet size={24} className="text-zinc-700" />
            <p className="text-zinc-500 text-sm">No hay pagos registrados</p>
            <p className="text-zinc-700 text-xs">Activa un cliente para generar el schedule</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    {["Cliente", "Servicio", "Mes", "Programado", "Monto", "Estado", ""].map((col, i) => (
                      <th key={i} className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider uppercase text-zinc-600">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {payments.map((p) => {
                    const status = getPaymentStatus(p.scheduled_date, p.paid_date);
                    const days   = p.paid_date ? null : daysUntil(p.scheduled_date);
                    return (
                      <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="px-4 py-3.5">
                          <p className="text-white text-sm font-medium truncate max-w-[140px]">
                            {p.contract?.client_name ?? "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-zinc-500 text-xs">{p.contract?.service_type ?? "—"}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-zinc-400 text-xs font-semibold">#{p.payment_month}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-zinc-400 text-xs">{p.scheduled_date}</p>
                          {p.paid_date && (
                            <p className="text-zinc-600 text-[10px]">Recibido: {p.paid_date}</p>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-white text-sm font-semibold">{formatCOP(p.amount)}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col items-start gap-1">
                            <StatusBadge status={status} />
                            {!p.paid_date && days !== null && status !== "overdue" && Math.abs(days) <= 14 && (
                              <span className="text-[10px] text-zinc-600">
                                {days >= 0 ? `en ${days}d` : `hace ${Math.abs(days)}d`}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {!p.paid_date && (
                            <RegisterPaymentModal
                              paymentId={p.id}
                              scheduledDate={p.scheduled_date}
                              amount={formatCOP(p.amount)}
                              contractName={p.contract?.client_name ?? "—"}
                              paymentMonth={p.payment_month}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="lg:hidden divide-y divide-zinc-800/60">
              {payments.map((p) => {
                const status = getPaymentStatus(p.scheduled_date, p.paid_date);
                const days   = p.paid_date ? null : daysUntil(p.scheduled_date);
                return (
                  <div key={p.id} className="px-5 py-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">{p.contract?.client_name ?? "—"}</p>
                        <p className="text-zinc-600 text-xs">{p.contract?.service_type ?? "—"} · Mes {p.payment_month}</p>
                      </div>
                      <span className="text-white font-semibold text-sm">{formatCOP(p.amount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={status} />
                        {!p.paid_date && days !== null && status !== "overdue" && Math.abs(days) <= 14 && (
                          <span className="text-[10px] text-zinc-600">
                            {days >= 0 ? `en ${days}d` : `hace ${Math.abs(days)}d`}
                          </span>
                        )}
                      </div>
                      {!p.paid_date && (
                        <RegisterPaymentModal
                          paymentId={p.id}
                          scheduledDate={p.scheduled_date}
                          amount={formatCOP(p.amount)}
                          contractName={p.contract?.client_name ?? "—"}
                          paymentMonth={p.payment_month}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Expenses Table ─────────────────────────────────────────────── */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <ReceiptText size={14} className="text-zinc-500" />
            <p className="text-zinc-300 text-sm font-medium">Egresos Registrados</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium">
            {expenses.length} registro{expenses.length !== 1 ? "s" : ""}
          </span>
        </div>

        {expenses.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <ReceiptText size={24} className="text-zinc-700" />
            <p className="text-zinc-500 text-sm">Sin egresos registrados</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    {["Fecha", "Concepto", "Categoría", "Responsable", "Monto"].map((col, i) => (
                      <th key={i} className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider uppercase text-zinc-600">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {expenses.map((ex) => (
                    <tr key={ex.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="text-zinc-500 text-xs">{ex.expense_date}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-white text-sm truncate max-w-[200px]">{ex.concept}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {ex.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-zinc-500 text-xs">
                          {ex.responsible?.full_name ?? ex.responsible?.email ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-red-400 font-semibold text-sm">−{formatCOP(ex.amount)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="lg:hidden divide-y divide-zinc-800/60">
              {expenses.map((ex) => (
                <div key={ex.id} className="px-5 py-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{ex.concept}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-zinc-600 text-xs">{ex.expense_date}</span>
                      <span className="text-[10px] text-zinc-500 px-1.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700">
                        {ex.category}
                      </span>
                    </div>
                  </div>
                  <span className="text-red-400 font-semibold text-sm shrink-0">−{formatCOP(ex.amount)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
