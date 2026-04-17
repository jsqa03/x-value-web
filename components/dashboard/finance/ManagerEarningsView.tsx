import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  TrendingUp, DollarSign, Award, Users,
  Wallet, CheckCircle2, Clock,
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

interface TeamPayment {
  id: string;
  amount: number;
  paid_date: string | null;
  payment_month: number;
  contract: { client_name: string; service_type: string; currency: string } | null;
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

interface Props { managerId: string }

export default async function ManagerEarningsView({ managerId }: Props) {
  const ac = getAdminClient();

  // ── Team member IDs ───────────────────────────────────────────────────────
  const { data: teamData } = await ac
    .from("profiles")
    .select("id, full_name, email, avatar_url")
    .eq("manager_id", managerId);
  const teamIds = (teamData ?? []).map((m: { id: string }) => m.id);
  const allIds  = [managerId, ...teamIds];

  // ── Team recaudo: all payments for contracts where anyone in team is assigned ──
  const { data: teamContractsData } = await ac
    .from("contracts")
    .select("id")
    .or(`assigned_sales_id.in.(${allIds.join(",")}),assigned_manager_id.in.(${allIds.join(",")})`);

  const teamContractIds = (teamContractsData ?? []).map((c: { id: string }) => c.id);

  let teamPayments: TeamPayment[] = [];
  if (teamContractIds.length > 0) {
    const { data } = await ac
      .from("payments")
      .select("id, amount, paid_date, payment_month, contract:contracts!contract_id(client_name, service_type, currency)")
      .in("contract_id", teamContractIds)
      .order("paid_date", { ascending: false });
    teamPayments = (data ?? []) as unknown as TeamPayment[];
  }

  const paidTeamPayments = teamPayments.filter((p) => p.paid_date);

  // Split by currency
  const paidGrowthPayments = paidTeamPayments.filter((p) => p.contract?.service_type === "X-VALUE GROWTH");
  const paidAIPayments     = paidTeamPayments.filter((p) => p.contract?.service_type === "X-Value AI");
  const teamRecaudoCOP     = paidGrowthPayments.reduce((s, p) => s + p.amount, 0);
  const teamRecaudoUSD     = paidAIPayments.reduce((s, p) => s + p.amount, 0);
  const pendingTeam        = teamPayments.filter((p) => !p.paid_date).length;

  // ── Personal commissions ──────────────────────────────────────────────────
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
    .eq("beneficiary_id", managerId)
    .order("contract_id");

  const commissions = (commissionsRaw ?? []) as unknown as Commission[];

  // Split commissions by service type / currency
  const growthCommissions = commissions.filter((c) => c.service_type === "X-VALUE GROWTH");
  const aiCommissions     = commissions.filter((c) => c.service_type === "X-Value AI");

  function splitEarnedPending(list: Commission[]) {
    const earned  = list.filter((c) => {
      const pmts = c.contract?.payments ?? [];
      return pmts.some((p) => p.payment_month === c.payment_month && p.paid_date);
    });
    const pending = list.filter((c) => {
      const pmts = c.contract?.payments ?? [];
      return !pmts.some((p) => p.payment_month === c.payment_month && p.paid_date);
    });
    return { earned, pending };
  }

  const { earned: growthEarned,  pending: growthPending  } = splitEarnedPending(growthCommissions);
  const { earned: aiEarned,      pending: aiPending      } = splitEarnedPending(aiCommissions);

  const growthEarnedTotal  = growthEarned.reduce((s, c) => s + c.commission_amount, 0);
  const growthPendingTotal = growthPending.reduce((s, c) => s + c.commission_amount, 0);
  const aiEarnedTotal      = aiEarned.reduce((s, c) => s + c.commission_amount, 0);
  const aiPendingTotal     = aiPending.reduce((s, c) => s + c.commission_amount, 0);

  function CommissionTable({ list, currency }: { list: Commission[]; currency: "COP" | "USD" }) {
    if (list.length === 0) return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <Award size={24} className="text-zinc-700" />
        <p className="text-zinc-500 text-sm">Sin comisiones registradas</p>
      </div>
    );
    return (
      <>
        {/* Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/60">
                {["Cliente", "Mes", "Tipo", `Base (${currency})`, "Tasa", "Comisión", "Estado"].map((col, i) => (
                  <th key={i} className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider uppercase text-zinc-600">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {list.map((c) => {
                const pmts   = c.contract?.payments ?? [];
                const isPaid = pmts.some((p) => p.payment_month === c.payment_month && p.paid_date);
                return (
                  <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="text-white text-sm font-medium truncate max-w-[140px]">{c.contract?.client_name ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-zinc-400 text-xs font-semibold">
                        {c.commission_type === "one_time" ? "Único" : `#${c.payment_month}`}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-zinc-500 text-xs">
                        {c.commission_type === "one_time" ? "Pago único" : "Mensual"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-zinc-400 text-xs">{formatMoney(c.base_amount, currency)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-orange-400 text-xs font-semibold">{(c.rate * 100).toFixed(0)}%</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-sm" style={{ color: isPaid ? "#22c55e" : "#f59e0b" }}>
                        {formatMoney(c.commission_amount, currency)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                          <CheckCircle2 size={9} /> Liquidada
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
          {list.map((c) => {
            const pmts   = c.contract?.payments ?? [];
            const isPaid = pmts.some((p) => p.payment_month === c.payment_month && p.paid_date);
            return (
              <div key={c.id} className="px-5 py-4 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-white text-sm font-medium">{c.contract?.client_name ?? "—"}</p>
                  <span className="font-semibold text-sm" style={{ color: isPaid ? "#22c55e" : "#f59e0b" }}>
                    {formatMoney(c.commission_amount, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-zinc-600">
                    <span>{c.commission_type === "one_time" ? "Único" : `Mes #${c.payment_month}`}</span>
                    <span className="text-orange-400 font-semibold">{(c.rate * 100).toFixed(0)}%</span>
                  </div>
                  {isPaid ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                      <CheckCircle2 size={9} /> Liquidada
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
    );
  }

  return (
    <div className="flex flex-col gap-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <p className="text-zinc-600 text-xs tracking-widest uppercase mb-1">Reporte personal</p>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Mis Ganancias</h1>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          BLOQUE 1 — X-Value Growth (COP)
      ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <h2 className="text-base font-semibold text-white">X-Value Growth</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">COP</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Recaudo equipo (COP)"
            value={formatMoney(teamRecaudoCOP, "COP")}
            sub={`${paidGrowthPayments.length} pagos Growth recibidos`}
            accent="#38bdf8"
            icon={Users}
          />
          <KpiCard
            label="Comisiones ganadas"
            value={formatMoney(growthEarnedTotal, "COP")}
            sub={`${growthEarned.length} comisión${growthEarned.length !== 1 ? "es" : ""} liquidada${growthEarned.length !== 1 ? "s" : ""}`}
            accent="#22c55e"
            icon={Award}
          />
          <KpiCard
            label="Por cobrar"
            value={formatMoney(growthPendingTotal, "COP")}
            sub={`${growthPending.length} pendiente${growthPending.length !== 1 ? "s" : ""}`}
            accent="#f59e0b"
            icon={Clock}
          />
          <KpiCard
            label="Cuotas pendientes equipo"
            value={String(pendingTeam)}
            sub="sin confirmar pago"
            accent="#a78bfa"
            icon={Wallet}
          />
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
          <SectionHeader
            title="Comisiones Growth (10% meses 3-6)"
            badge={`${growthCommissions.length} registro${growthCommissions.length !== 1 ? "s" : ""}`}
            color="emerald"
          />
          <CommissionTable list={growthCommissions} currency="COP" />
        </div>

        {/* Growth team recaudo detail */}
        {paidGrowthPayments.length > 0 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <SectionHeader title="Recaudo del Equipo Growth (últimos pagos)" badge="COP" color="emerald" />
            <div className="divide-y divide-zinc-800/60">
              {paidGrowthPayments.slice(0, 10).map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-white text-sm font-medium">{p.contract?.client_name ?? "—"}</p>
                    <p className="text-zinc-600 text-xs">Mes {p.payment_month}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-semibold text-sm">{formatMoney(p.amount, "COP")}</p>
                    <p className="text-zinc-600 text-xs">{p.paid_date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          BLOQUE 2 — X-Value AI (USD)
      ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-sky-400" />
          <h2 className="text-base font-semibold text-white">X-Value AI</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400">USD</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard
            label="Recaudo equipo (USD)"
            value={formatMoney(teamRecaudoUSD, "USD")}
            sub={`${paidAIPayments.length} pagos AI recibidos`}
            accent="#38bdf8"
            icon={Users}
          />
          <KpiCard
            label="Comisiones ganadas"
            value={formatMoney(aiEarnedTotal, "USD")}
            sub={`${aiEarned.length} comisión${aiEarned.length !== 1 ? "es" : ""} liquidada${aiEarned.length !== 1 ? "s" : ""}`}
            accent="#22c55e"
            icon={Award}
          />
          <KpiCard
            label="Por cobrar"
            value={formatMoney(aiPendingTotal, "USD")}
            sub={`${aiPending.length} pendiente${aiPending.length !== 1 ? "s" : ""}`}
            accent="#f59e0b"
            icon={Clock}
          />
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
          <SectionHeader
            title="Comisiones AI (10% si cierre propio · 3% si cierre por comercial)"
            badge={`${aiCommissions.length} registro${aiCommissions.length !== 1 ? "s" : ""}`}
            color="sky"
          />
          <CommissionTable list={aiCommissions} currency="USD" />
        </div>

        {/* AI team recaudo detail */}
        {paidAIPayments.length > 0 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <SectionHeader title="Recaudo del Equipo AI (últimos pagos)" badge="USD" color="sky" />
            <div className="divide-y divide-zinc-800/60">
              {paidAIPayments.slice(0, 10).map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-white text-sm font-medium">{p.contract?.client_name ?? "—"}</p>
                    <p className="text-zinc-600 text-xs">Mes {p.payment_month}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sky-400 font-semibold text-sm">{formatMoney(p.amount, "USD")}</p>
                    <p className="text-zinc-600 text-xs">{p.paid_date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
