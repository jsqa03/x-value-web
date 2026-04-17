import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  DollarSign, TrendingDown, TrendingUp, Percent,
  Clock, AlertTriangle, CheckCircle2, Calendar,
  ReceiptText, Wallet, Globe,
} from "lucide-react";
import { getPaymentStatus, daysUntil, formatMoney, type PaymentStatus } from "@/lib/finance-utils";
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
  contract: { client_name: string; service_type: string; currency: string } | null;
}

interface Expense {
  id: string;
  expense_date: string;
  concept: string;
  amount: number;
  category: string;
  currency: string;
  responsible: { full_name: string | null; email: string } | null;
}

interface Commission {
  id: string;
  service_type: string;
  commission_amount: number;
  beneficiary_role: string;
  contract: { client_name: string } | null;
}

interface AssignableUser {
  id: string;
  full_name: string | null;
  email: string;
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_META: Record<PaymentStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  paid:    { label: "Pagado",    color: "#22c55e", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.25)",   icon: CheckCircle2  },
  warning: { label: "Próximo",   color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.25)",  icon: Clock         },
  overdue: { label: "En mora",   color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)",   icon: AlertTriangle },
  pending: { label: "Pendiente", color: "#71717a", bg: "rgba(113,113,122,0.06)", border: "rgba(113,113,122,0.2)",  icon: Calendar      },
};

function StatusBadge({ status }: { status: PaymentStatus }) {
  const m = STATUS_META[status];
  const Icon = m.icon;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ color: m.color, background: m.bg, border: `1px solid ${m.border}` }}>
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
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${accent}12`, border: `1px solid ${accent}20` }}>
          <Icon size={13} style={{ color: accent }} />
        </div>
      </div>
      <p className="text-white font-bold text-xl tracking-tight leading-none">{value}</p>
      <p className="text-zinc-600 text-xs">{sub}</p>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function CurrencySection({ currency, accent, children }: {
  currency: string; accent: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${accent}12`, border: `1px solid ${accent}25` }}>
          <Globe size={13} style={{ color: accent }} />
        </div>
        <h2 className="text-white font-semibold text-base tracking-tight">
          Finanzas X-Value {currency === "COP" ? "Growth" : "AI"}
          <span className="ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full align-middle"
            style={{ background: `${accent}12`, color: accent, border: `1px solid ${accent}25` }}>
            {currency}
          </span>
        </h2>
      </div>
      {children}
    </div>
  );
}

// ─── Payment table (shared for both currencies) ───────────────────────────────
function PaymentTable({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <Wallet size={22} className="text-zinc-700" />
        <p className="text-zinc-500 text-sm">Sin pagos en este bloque</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60">
              {["Cliente", "Mes", "Programado", "Monto", "Estado", ""].map((col, i) => (
                <th key={i} className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider uppercase text-zinc-600">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {payments.map((p) => {
              const currency = p.contract?.currency ?? "COP";
              const status   = getPaymentStatus(p.scheduled_date, p.paid_date);
              const days     = p.paid_date ? null : daysUntil(p.scheduled_date);
              return (
                <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="text-white text-sm font-medium truncate max-w-[140px]">
                      {p.contract?.client_name ?? "—"}
                    </p>
                    <p className="text-zinc-600 text-xs">{p.contract?.service_type ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-zinc-400 text-xs font-semibold">#{p.payment_month}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-zinc-400 text-xs">{p.scheduled_date}</p>
                    {p.paid_date && <p className="text-zinc-600 text-[10px]">Recibido: {p.paid_date}</p>}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-white text-sm font-semibold">{formatMoney(p.amount, currency)}</span>
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
                        amount={formatMoney(p.amount, currency)}
                        contractName={p.contract?.client_name ?? "—"}
                        paymentMonth={p.payment_month}
                        currency={currency}
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
          const currency = p.contract?.currency ?? "COP";
          const status   = getPaymentStatus(p.scheduled_date, p.paid_date);
          const days     = p.paid_date ? null : daysUntil(p.scheduled_date);
          return (
            <div key={p.id} className="px-5 py-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{p.contract?.client_name ?? "—"}</p>
                  <p className="text-zinc-600 text-xs">{p.contract?.service_type ?? "—"} · Mes {p.payment_month}</p>
                </div>
                <span className="text-white font-semibold text-sm">{formatMoney(p.amount, currency)}</span>
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
                    amount={formatMoney(p.amount, currency)}
                    contractName={p.contract?.client_name ?? "—"}
                    paymentMonth={p.payment_month}
                    currency={currency}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default async function FinanceView() {
  const ac = getAdminClient();

  // Fetch payments with contract currency
  const { data: paymentsRaw } = await ac
    .from("payments")
    .select("id, contract_id, payment_month, scheduled_date, paid_date, amount, notes, contract:contracts!contract_id(client_name, service_type, currency)")
    .order("scheduled_date", { ascending: true });

  // Fetch expenses with currency
  const { data: expensesRaw } = await ac
    .from("expenses")
    .select("id, expense_date, concept, amount, category, currency, responsible:profiles!responsible_id(full_name, email)")
    .order("expense_date", { ascending: false });

  // Fetch commissions for net calculation
  const { data: commissionsRaw } = await ac
    .from("commissions")
    .select("id, service_type, commission_amount, beneficiary_role, contract:contracts!contract_id(client_name)")
    .order("service_type");

  // Fetch users for expense modal
  const { data: usersRaw } = await ac
    .from("profiles")
    .select("id, full_name, email")
    .in("role", ["admin", "manager", "sales"])
    .order("full_name");

  const allPayments    = (paymentsRaw    ?? []) as unknown as Payment[];
  const allExpenses    = (expensesRaw    ?? []) as unknown as Expense[];
  const allCommissions = (commissionsRaw ?? []) as unknown as Commission[];
  const users          = (usersRaw       ?? []) as AssignableUser[];

  // ── Separate by currency ──────────────────────────────────────────────────
  const copPayments = allPayments.filter((p) => (p.contract?.currency ?? "COP") === "COP");
  const usdPayments = allPayments.filter((p) => (p.contract?.currency ?? "COP") === "USD");

  const copExpenses = allExpenses.filter((e) => (e.currency ?? "COP") === "COP");
  const usdExpenses = allExpenses.filter((e) => (e.currency ?? "COP") === "USD");

  const copCommissions = allCommissions.filter((c) => c.service_type === "X-VALUE GROWTH");
  const usdCommissions = allCommissions.filter((c) => c.service_type === "X-Value AI");

  // ── COP KPIs ──────────────────────────────────────────────────────────────
  const copPaidPayments  = copPayments.filter((p) => p.paid_date);
  const copRevenue       = copPaidPayments.reduce((s, p) => s + p.amount, 0);
  const copExpenseTotal  = copExpenses.reduce((s, e) => s + e.amount, 0);
  const copCommTotal     = copCommissions.reduce((s, c) => s + c.commission_amount, 0);
  const copNet           = copRevenue - copExpenseTotal - copCommTotal;
  const copMargin        = copRevenue > 0 ? (copNet / copRevenue) * 100 : 0;
  const copOverdue       = copPayments.filter((p) => !p.paid_date && getPaymentStatus(p.scheduled_date, null) === "overdue").length;

  // ── USD KPIs ──────────────────────────────────────────────────────────────
  const usdPaidPayments  = usdPayments.filter((p) => p.paid_date);
  const usdRevenue       = usdPaidPayments.reduce((s, p) => s + p.amount, 0);
  const usdExpenseTotal  = usdExpenses.reduce((s, e) => s + e.amount, 0);
  const usdCommTotal     = usdCommissions.reduce((s, c) => s + c.commission_amount, 0);
  const usdNet           = usdRevenue - usdExpenseTotal - usdCommTotal;
  const usdMargin        = usdRevenue > 0 ? (usdNet / usdRevenue) * 100 : 0;
  const usdOverdue       = usdPayments.filter((p) => !p.paid_date && getPaymentStatus(p.scheduled_date, null) === "overdue").length;

  return (
    <div className="flex flex-col gap-10">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-zinc-600 text-xs tracking-widest uppercase mb-1">Panel Financiero</p>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Finanzas</h1>
        </div>
        <ExpenseModal users={users} />
      </div>

      {/* ══ BLOQUE 1: X-VALUE GROWTH (COP) ════════════════════════════════ */}
      <CurrencySection currency="COP" accent="#a78bfa">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Ingresos COP" value={formatMoney(copRevenue, "COP")}
            sub={`${copPaidPayments.length} pagos confirmados`} accent="#22c55e" icon={DollarSign} />
          <KpiCard label="Egresos COP" value={formatMoney(copExpenseTotal, "COP")}
            sub={`${copExpenses.length} registro${copExpenses.length !== 1 ? "s" : ""}`} accent="#ef4444" icon={TrendingDown} />
          <KpiCard label="Comisiones COP" value={formatMoney(copCommTotal, "COP")}
            sub={`${copCommissions.length} comisión${copCommissions.length !== 1 ? "es" : ""}`} accent="#a78bfa" icon={TrendingUp} />
          <KpiCard label="Utilidad Neta COP"
            value={formatMoney(copNet, "COP")}
            sub={copRevenue > 0 ? `Margen ${copMargin.toFixed(1)}%${copOverdue > 0 ? ` · ${copOverdue} mora${copOverdue !== 1 ? "s" : ""}` : ""}` : "Sin ingresos aún"}
            accent={copNet >= 0 ? "#22c55e" : "#ef4444"} icon={Percent} />
        </div>

        {/* Payment schedule */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Wallet size={14} className="text-zinc-500" />
              <p className="text-zinc-300 text-sm font-medium">Schedule de Pagos · COP</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium">
              {copPayments.length} cuotas
            </span>
          </div>
          <PaymentTable payments={copPayments} />
        </div>

        {/* COP Expenses */}
        {copExpenses.length > 0 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <ReceiptText size={14} className="text-zinc-500" />
                <p className="text-zinc-300 text-sm font-medium">Egresos COP</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium">
                {copExpenses.length}
              </span>
            </div>
            <ExpenseRows expenses={copExpenses} />
          </div>
        )}
      </CurrencySection>

      {/* ══ BLOQUE 2: X-VALUE AI (USD) ════════════════════════════════════ */}
      <CurrencySection currency="USD" accent="#38bdf8">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Ingresos USD" value={formatMoney(usdRevenue, "USD")}
            sub={`${usdPaidPayments.length} pagos confirmados`} accent="#22c55e" icon={DollarSign} />
          <KpiCard label="Egresos USD" value={formatMoney(usdExpenseTotal, "USD")}
            sub={`${usdExpenses.length} registro${usdExpenses.length !== 1 ? "s" : ""}`} accent="#ef4444" icon={TrendingDown} />
          <KpiCard label="Comisiones USD" value={formatMoney(usdCommTotal, "USD")}
            sub={`${usdCommissions.length} comisión${usdCommissions.length !== 1 ? "es" : ""}`} accent="#38bdf8" icon={TrendingUp} />
          <KpiCard label="Utilidad Neta USD"
            value={formatMoney(usdNet, "USD")}
            sub={usdRevenue > 0 ? `Margen ${usdMargin.toFixed(1)}%${usdOverdue > 0 ? ` · ${usdOverdue} mora${usdOverdue !== 1 ? "s" : ""}` : ""}` : "Sin ingresos aún"}
            accent={usdNet >= 0 ? "#22c55e" : "#ef4444"} icon={Percent} />
        </div>

        {/* Payment schedule */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Wallet size={14} className="text-zinc-500" />
              <p className="text-zinc-300 text-sm font-medium">Schedule de Pagos · USD</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium">
              {usdPayments.length} cuotas
            </span>
          </div>
          <PaymentTable payments={usdPayments} />
        </div>

        {/* USD Expenses */}
        {usdExpenses.length > 0 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <ReceiptText size={14} className="text-zinc-500" />
                <p className="text-zinc-300 text-sm font-medium">Egresos USD</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium">
                {usdExpenses.length}
              </span>
            </div>
            <ExpenseRows expenses={usdExpenses} />
          </div>
        )}
      </CurrencySection>
    </div>
  );
}

// ─── Shared expense rows component ───────────────────────────────────────────
function ExpenseRows({ expenses }: { expenses: { id: string; expense_date: string; concept: string; amount: number; category: string; currency: string; responsible: { full_name: string | null; email: string } | null }[] }) {
  return (
    <>
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60">
              {["Fecha", "Concepto", "Categoría", "Responsable", "Monto"].map((col, i) => (
                <th key={i} className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider uppercase text-zinc-600">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {expenses.map((ex) => (
              <tr key={ex.id} className="hover:bg-zinc-900/40 transition-colors">
                <td className="px-4 py-3.5"><span className="text-zinc-500 text-xs">{ex.expense_date}</span></td>
                <td className="px-4 py-3.5"><p className="text-white text-sm truncate max-w-[200px]">{ex.concept}</p></td>
                <td className="px-4 py-3.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">{ex.category}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-zinc-500 text-xs">{ex.responsible?.full_name ?? ex.responsible?.email ?? "—"}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-red-400 font-semibold text-sm">−{formatMoney(ex.amount, ex.currency)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="lg:hidden divide-y divide-zinc-800/60">
        {expenses.map((ex) => (
          <div key={ex.id} className="px-5 py-4 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{ex.concept}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-zinc-600 text-xs">{ex.expense_date}</span>
                <span className="text-[10px] text-zinc-500 px-1.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700">{ex.category}</span>
              </div>
            </div>
            <span className="text-red-400 font-semibold text-sm shrink-0">−{formatMoney(ex.amount, ex.currency)}</span>
          </div>
        ))}
      </div>
    </>
  );
}
