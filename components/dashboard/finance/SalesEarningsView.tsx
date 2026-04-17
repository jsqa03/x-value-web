import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  Award, DollarSign, Clock, TrendingUp,
  CheckCircle2, Zap, Inbox,
} from "lucide-react";
import { formatMoney } from "@/lib/finance-utils";

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Contract {
  id: string;
  client_name: string;
  service_type: string;
  currency: string;
  setup_fee: number | null;
  monthly_fee: number | null;
  closing_amount: number;
  first_payment_date: string;
  created_at: string;
}

interface Commission {
  id: string;
  contract_id: string;
  service_type: string;
  payment_month: number;
  commission_type: string;
  base_amount: number;
  rate: number;
  commission_amount: number;
  contract: {
    client_name: string;
    currency: string;
    payments: { payment_month: number; paid_date: string | null }[];
  } | null;
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

function SectionHeader({ title, badge, color }: { title: string; badge: string; color: "emerald" | "sky" }) {
  const styles = {
    emerald: { border: "border-emerald-500/20", bg: "bg-emerald-500/8", text: "text-emerald-400", dot: "#22c55e" },
    sky:     { border: "border-sky-500/20",     bg: "bg-sky-500/8",     text: "text-sky-400",     dot: "#38bdf8" },
  }[color];
  return (
    <div className={`flex items-center gap-3 px-5 py-3.5 border-b ${styles.border} ${styles.bg}`}>
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: styles.dot }} />
      <p className="text-white text-sm font-semibold">{title}</p>
      <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles.border} ${styles.text}`}>
        {badge}
      </span>
    </div>
  );
}

interface Props { userId: string }

export default async function SalesEarningsView({ userId }: Props) {
  const ac = getAdminClient();

  // ── All contracts where this sales rep was assigned ───────────────────────
  const { data: contractsRaw } = await ac
    .from("contracts")
    .select("id, client_name, service_type, currency, setup_fee, monthly_fee, closing_amount, first_payment_date, created_at")
    .eq("assigned_sales_id", userId)
    .order("created_at", { ascending: false });

  const contracts = (contractsRaw ?? []) as Contract[];
  const growthContracts = contracts.filter((c) => c.service_type === "X-VALUE GROWTH");
  const aiContracts     = contracts.filter((c) => c.service_type === "X-Value AI");

  // ── Personal commissions (GROWTH only — sales role earns COP months 1-2) ──
  const { data: commissionsRaw } = await ac
    .from("commissions")
    .select(`
      id, contract_id, service_type, payment_month,
      commission_type, base_amount, rate, commission_amount,
      contract:contracts!contract_id(
        client_name,
        currency,
        payments(payment_month, paid_date)
      )
    `)
    .eq("beneficiary_id", userId)
    .eq("beneficiary_role", "sales")
    .order("contract_id");

  const commissions = (commissionsRaw ?? []) as unknown as Commission[];

  // ── KPI computations (GROWTH / COP) ──────────────────────────────────────
  const totalGrowthSold = growthContracts.reduce((s, c) => s + (c.monthly_fee ?? c.closing_amount), 0);
  const totalAISold     = aiContracts.reduce((s, c) => s + (c.setup_fee ?? c.closing_amount), 0);

  const earned  = commissions.filter((c) => {
    const pmts = c.contract?.payments ?? [];
    return pmts.some((p) => p.payment_month === c.payment_month && p.paid_date);
  });
  const pending = commissions.filter((c) => {
    const pmts = c.contract?.payments ?? [];
    return !pmts.some((p) => p.payment_month === c.payment_month && p.paid_date);
  });

  const totalEarned  = earned.reduce((s, c) => s + c.commission_amount, 0);
  const totalPending = pending.reduce((s, c) => s + c.commission_amount, 0);

  return (
    <div className="flex flex-col gap-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <p className="text-zinc-600 text-xs tracking-widest uppercase mb-1">Reporte personal</p>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Mis Ganancias</h1>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          BLOQUE 1 — X-VALUE GROWTH (COP)
      ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <h2 className="text-base font-semibold text-white">X-Value Growth</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">COP</span>
        </div>

        {/* KPI Row — GROWTH */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total vendido"
            value={formatMoney(totalGrowthSold, "COP")}
            sub={`${growthContracts.length} contrato${growthContracts.length !== 1 ? "s" : ""} Growth`}
            accent="#f97316"
            icon={TrendingUp}
          />
          <KpiCard
            label="Comisiones ganadas"
            value={formatMoney(totalEarned, "COP")}
            sub={`${earned.length} pago${earned.length !== 1 ? "s" : ""} confirmado${earned.length !== 1 ? "s" : ""}`}
            accent="#22c55e"
            icon={Award}
          />
          <KpiCard
            label="Por cobrar"
            value={formatMoney(totalPending, "COP")}
            sub={`${pending.length} pago${pending.length !== 1 ? "s" : ""} pendiente${pending.length !== 1 ? "s" : ""}`}
            accent="#f59e0b"
            icon={Clock}
          />
          <KpiCard
            label="Total comisiones"
            value={formatMoney(totalEarned + totalPending, "COP")}
            sub="ganadas + por cobrar"
            accent="#a78bfa"
            icon={DollarSign}
          />
        </div>

        {/* Commission breakdown */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
          <SectionHeader title="Detalle de Comisiones Growth" badge={`${commissions.length} registro${commissions.length !== 1 ? "s" : ""}`} color="emerald" />

          {commissions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Award size={24} className="text-zinc-700" />
              <p className="text-zinc-500 text-sm">Sin comisiones registradas</p>
              <p className="text-zinc-700 text-xs">
                Las comisiones se generan automáticamente al activar contratos X-VALUE GROWTH
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/60">
                      {["Cliente", "Mes", "Base (COP)", "Tasa", "Comisión", "Estado"].map((col, i) => (
                        <th key={i} className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider uppercase text-zinc-600">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {commissions.map((c) => {
                      const pmts   = c.contract?.payments ?? [];
                      const isPaid = pmts.some((p) => p.payment_month === c.payment_month && p.paid_date);
                      return (
                        <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="px-4 py-3.5">
                            <p className="text-white text-sm font-medium truncate max-w-[150px]">
                              {c.contract?.client_name ?? "—"}
                            </p>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-zinc-400 text-xs font-semibold">#{c.payment_month}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-zinc-400 text-xs">{formatMoney(c.base_amount, "COP")}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-orange-400 text-xs font-semibold">
                              {(c.rate * 100).toFixed(0)}%
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-semibold text-sm"
                              style={{ color: isPaid ? "#22c55e" : "#f59e0b" }}>
                              {formatMoney(c.commission_amount, "COP")}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                                <CheckCircle2 size={9} /> Pagada
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400">
                                <Clock size={9} /> Pendiente
                              </span>
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
                {commissions.map((c) => {
                  const pmts   = c.contract?.payments ?? [];
                  const isPaid = pmts.some((p) => p.payment_month === c.payment_month && p.paid_date);
                  return (
                    <div key={c.id} className="px-5 py-4 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-white text-sm font-medium">{c.contract?.client_name ?? "—"}</p>
                        <span className="font-semibold text-sm"
                          style={{ color: isPaid ? "#22c55e" : "#f59e0b" }}>
                          {formatMoney(c.commission_amount, "COP")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-zinc-600">
                          <span>Mes #{c.payment_month}</span>
                          <span className="text-orange-400 font-semibold">{(c.rate * 100).toFixed(0)}%</span>
                        </div>
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                            <CheckCircle2 size={9} /> Pagada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400">
                            <Clock size={9} /> Pendiente
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Growth contracts history */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
          <SectionHeader title="Historial de Cierres Growth" badge={`${growthContracts.length} contrato${growthContracts.length !== 1 ? "s" : ""}`} color="emerald" />

          {growthContracts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Inbox size={24} className="text-zinc-700" />
              <p className="text-zinc-500 text-sm">Sin contratos Growth cerrados aún</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {growthContracts.map((c) => {
                const dateStr = new Date(c.created_at).toLocaleDateString("es-ES", {
                  day: "2-digit", month: "short", year: "numeric",
                });
                return (
                  <div key={c.id} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)" }}>
                        <Zap size={13} className="text-violet-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate max-w-[180px]">{c.client_name}</p>
                        <p className="text-zinc-600 text-xs">{dateStr}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-white font-semibold text-sm">{formatMoney(c.monthly_fee ?? c.closing_amount, "COP")}</p>
                      <p className="text-zinc-600 text-xs">fee mensual</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          BLOQUE 2 — X-Value AI (USD)
      ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-sky-400" />
          <h2 className="text-base font-semibold text-white">X-Value AI</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400">USD</span>
          <span className="text-zinc-600 text-xs ml-1">· Sin comisiones directas para comerciales</span>
        </div>

        {/* KPI row — AI */}
        <div className="grid grid-cols-2 gap-4">
          <KpiCard
            label="Setup fees vendidos"
            value={formatMoney(totalAISold, "USD")}
            sub={`${aiContracts.length} contrato${aiContracts.length !== 1 ? "s" : ""} AI`}
            accent="#38bdf8"
            icon={TrendingUp}
          />
          <KpiCard
            label="Contratos activos"
            value={String(aiContracts.length)}
            sub="X-Value AI cerrados"
            accent="#f97316"
            icon={Zap}
          />
        </div>

        {/* AI contracts history */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
          <SectionHeader title="Historial de Cierres AI" badge={`${aiContracts.length} contrato${aiContracts.length !== 1 ? "s" : ""}`} color="sky" />

          {aiContracts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Inbox size={24} className="text-zinc-700" />
              <p className="text-zinc-500 text-sm">Sin contratos AI cerrados aún</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {aiContracts.map((c) => {
                const dateStr = new Date(c.created_at).toLocaleDateString("es-ES", {
                  day: "2-digit", month: "short", year: "numeric",
                });
                return (
                  <div key={c.id} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)" }}>
                        <Zap size={13} className="text-sky-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate max-w-[180px]">{c.client_name}</p>
                        <p className="text-zinc-600 text-xs">{dateStr}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-white font-semibold text-sm">{formatMoney(c.setup_fee ?? c.closing_amount, "USD")}</p>
                      <p className="text-zinc-600 text-xs">setup fee</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
