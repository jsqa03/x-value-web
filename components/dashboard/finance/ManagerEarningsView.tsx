import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  TrendingUp, DollarSign, Award, Users,
  Wallet, CheckCircle2, Clock,
} from "lucide-react";
import { formatCOP } from "@/lib/finance-utils";

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
    payments: { payment_month: number; paid_date: string | null }[];
  } | null;
}

interface TeamPayment {
  id: string;
  amount: number;
  paid_date: string | null;
  payment_month: number;
  contract: { client_name: string; service_type: string } | null;
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

interface Props { managerId: string }

export default async function ManagerEarningsView({ managerId }: Props) {
  const ac = getAdminClient();

  // ── Team member IDs ───────────────────────────────────────────────────────
  const { data: teamData } = await ac
    .from("profiles")
    .select("id, full_name, email, avatar_url")
    .eq("manager_id", managerId);
  const teamIds  = (teamData ?? []).map((m: { id: string }) => m.id);
  const allIds   = [managerId, ...teamIds];

  // ── Team recaudo: all payments for contracts where sales or manager is in team ──
  const { data: teamContractsData } = await ac
    .from("contracts")
    .select("id")
    .or(`assigned_sales_id.in.(${allIds.join(",")}),assigned_manager_id.in.(${allIds.join(",")})`);

  const teamContractIds = (teamContractsData ?? []).map((c: { id: string }) => c.id);

  let teamPayments: TeamPayment[] = [];
  if (teamContractIds.length > 0) {
    const { data } = await ac
      .from("payments")
      .select("id, amount, paid_date, payment_month, contract:contracts!contract_id(client_name, service_type)")
      .in("contract_id", teamContractIds)
      .order("paid_date", { ascending: false });
    teamPayments = (data ?? []) as unknown as TeamPayment[];
  }

  const paidTeamPayments = teamPayments.filter((p) => p.paid_date);
  const teamRecaudo      = paidTeamPayments.reduce((s, p) => s + p.amount, 0);
  const pendingTeam      = teamPayments.filter((p) => !p.paid_date).length;

  // ── Personal commissions ──────────────────────────────────────────────────
  const { data: commissionsRaw } = await ac
    .from("commissions")
    .select(`
      id, contract_id, service_type, payment_month,
      commission_type, base_amount, rate, commission_amount,
      contract:contracts!contract_id(
        client_name,
        payments(payment_month, paid_date)
      )
    `)
    .eq("beneficiary_id", managerId)
    .order("contract_id");

  const commissions = (commissionsRaw ?? []) as unknown as Commission[];

  // Calculate earned (payment is paid) vs pending commissions
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

      {/* ── KPI Row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Recaudo del equipo"
          value={formatCOP(teamRecaudo)}
          sub={`${paidTeamPayments.length} pagos recibidos`}
          accent="#38bdf8"
          icon={Users}
        />
        <KpiCard
          label="Comisiones ganadas"
          value={formatCOP(totalEarned)}
          sub={`${earned.length} comisión${earned.length !== 1 ? "es" : ""} liquidada${earned.length !== 1 ? "s" : ""}`}
          accent="#22c55e"
          icon={Award}
        />
        <KpiCard
          label="Comisiones por cobrar"
          value={formatCOP(totalPending)}
          sub={`${pending.length} pendiente${pending.length !== 1 ? "s" : ""}`}
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

      {/* ── Personal Commission Breakdown ──────────────────────────────── */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Award size={14} className="text-zinc-500" />
            <p className="text-zinc-300 text-sm font-medium">Detalle de Comisiones</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium">
            {commissions.length} registro{commissions.length !== 1 ? "s" : ""}
          </span>
        </div>

        {commissions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Award size={24} className="text-zinc-700" />
            <p className="text-zinc-500 text-sm">Sin comisiones registradas</p>
            <p className="text-zinc-700 text-xs">Las comisiones se generan al activar un cliente</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    {["Cliente", "Servicio", "Mes", "Tipo", "Base", "Tasa", "Comisión", "Estado"].map((col, i) => (
                      <th key={i} className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider uppercase text-zinc-600">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {commissions.map((c) => {
                    const pmts    = c.contract?.payments ?? [];
                    const isPaid  = pmts.some((p) => p.payment_month === c.payment_month && p.paid_date);
                    return (
                      <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="px-4 py-3.5">
                          <p className="text-white text-sm font-medium truncate max-w-[140px]">
                            {c.contract?.client_name ?? "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-zinc-500 text-xs">{c.service_type}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-zinc-400 text-xs font-semibold">
                            {c.commission_type === "one_time" ? "Único" : `#${c.payment_month}`}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-zinc-500 text-xs capitalize">
                            {c.commission_type === "one_time" ? "Pago único" : "Mensual"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-zinc-400 text-xs">{formatCOP(c.base_amount)}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-orange-400 text-xs font-semibold">
                            {(c.rate * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className="font-semibold text-sm"
                            style={{ color: isPaid ? "#22c55e" : "#f59e0b" }}
                          >
                            {formatCOP(c.commission_amount)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                              <CheckCircle2 size={9} />
                              Liquidada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400">
                              <Clock size={9} />
                              Pendiente
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
                      <span
                        className="font-semibold text-sm"
                        style={{ color: isPaid ? "#22c55e" : "#f59e0b" }}
                      >
                        {formatCOP(c.commission_amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-zinc-600">
                        <span>{c.service_type}</span>
                        <span>·</span>
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
        )}
      </div>

      {/* ── Team Recaudo Detail ─────────────────────────────────────────── */}
      {paidTeamPayments.length > 0 && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-zinc-800">
            <TrendingUp size={14} className="text-zinc-500" />
            <p className="text-zinc-300 text-sm font-medium">Recaudo del Equipo (últimos pagos)</p>
          </div>
          <div className="divide-y divide-zinc-800/60">
            {paidTeamPayments.slice(0, 10).map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-white text-sm font-medium">{p.contract?.client_name ?? "—"}</p>
                  <p className="text-zinc-600 text-xs">{p.contract?.service_type ?? "—"} · Mes {p.payment_month}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-semibold text-sm">{formatCOP(p.amount)}</p>
                  <p className="text-zinc-600 text-xs">{p.paid_date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
