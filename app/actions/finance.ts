"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "./admin";

// ═══════════════════════════════════════════════════════════════════════════════
//  COMMISSION RULES — HARD-CODED, never modify without explicit business approval
//
//  RULE 1 · X-Value AI → Manager (USD)
//    Rate : 3% of the setup_fee (one-time, USD)
//    Who  : assigned_manager_id
//    When : payment_month = 1 (the setup payment)
//
//  RULE 2 · X-VALUE GROWTH → Comercial/Sales (COP)
//    Rate : 10% of monthly_fee per month
//    Who  : assigned_sales_id
//    When : payment_month IN (1, 2)
//
//  RULE 3 · X-VALUE GROWTH → Manager (COP)
//    Rate : 10% of monthly_fee per month
//    Who  : assigned_manager_id
//    When : payment_month IN (3, 4)
//
//  Currency rules (STRICT, no conversion):
//    X-Value AI     → currency = "USD"  (setup_fee + optional monthly_fee in USD)
//    X-VALUE GROWTH → currency = "COP"  (single monthly_fee in COP, all months)
// ═══════════════════════════════════════════════════════════════════════════════
const AI_MANAGER_RATE            = 0.03 as const;  // Rule 1a — 3% of setup_fee when team-close (USD)
const AI_MANAGER_SELF_CLOSE_RATE = 0.10 as const;  // Rule 1b — 10% of setup_fee when self-close (USD)
const GROWTH_SALES_RATE          = 0.10 as const;  // Rule 2 — 10% of monthly_fee (COP)
const GROWTH_MANAGER_RATE        = 0.10 as const;  // Rule 3 — 10% of monthly_fee (COP)
const GROWTH_SALES_MONTHS        = [1, 2] as const;
const GROWTH_MANAGER_MONTHS      = [3, 4, 5, 6] as const; // Rule 3 revised: months 3-6
const GROWTH_PAYMENT_MONTHS = 12     as const; // schedule horizon
const AI_MAINTENANCE_MONTHS = 12     as const; // maintenance schedule horizon

// ─── Utilities ────────────────────────────────────────────────────────────────

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/** Add N calendar months — anchored to a base date. */
function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Parse a monetary input string to a JS number.
 *  USD: remove commas (thousands sep), keep decimal dot  → parseFloat
 *  COP: remove every non-digit (dots/commas/spaces)      → parseInt
 */
function parseMoney(raw: FormDataEntryValue | null, currency: "USD" | "COP"): number {
  if (!raw) return NaN;
  const s = String(raw).trim();
  if (currency === "USD") {
    const n = parseFloat(s.replace(/,/g, ""));
    return isNaN(n) ? NaN : n;
  }
  // COP — integer only
  const n = Number(s.replace(/[^0-9]/g, ""));
  return isNaN(n) ? NaN : n;
}

/** Verify the caller is authenticated and has one of the accepted roles. */
async function requireRole(accepted: string[]): Promise<{ id: string; role: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = data?.role as string | undefined;
  if (!role || !accepted.includes(role)) return null;
  return { id: user.id, role };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  activateClient — creates contract, payment schedule, and commission records
// ═══════════════════════════════════════════════════════════════════════════════
export async function activateClient(formData: FormData): Promise<ActionResult> {
  const caller = await requireRole(["admin", "manager", "sales"]);
  if (!caller) return { error: "No autenticado o sin permisos." };

  // ── Parse common fields ──────────────────────────────────────────────────
  const lead_id              = (formData.get("lead_id")              as string | null) ?? "";
  const client_name          = (formData.get("client_name")          as string | null)?.trim() ?? "";
  const service_type         = (formData.get("service_type")         as string | null) ?? "";
  const currency             = (formData.get("currency")             as "USD" | "COP" | null) ?? "COP";
  const contract_signed_date = (formData.get("contract_signed_date") as string | null) ?? "";
  const first_payment_date   = (formData.get("first_payment_date")   as string | null) ?? "";
  const assigned_sales_id    = (formData.get("assigned_sales_id")    as string | null) || null;
  const assigned_manager_id  = (formData.get("assigned_manager_id")  as string | null) || null;
  const notes                = (formData.get("notes")                as string | null)?.trim() || null;

  const isAI     = service_type === "X-Value AI";
  const isGrowth = service_type === "X-VALUE GROWTH";

  // ── Parse monetary fields ────────────────────────────────────────────────
  // AI   (USD): setup_fee required, monthly_fee optional (0 = no maintenance)
  // GROWTH (COP): monthly_fee required, no setup
  const setup_fee   = isAI     ? parseMoney(formData.get("setup_fee"),   "USD") : null;
  const monthly_fee = isGrowth ? parseMoney(formData.get("monthly_fee"), "COP")
                    : isAI     ? parseMoney(formData.get("monthly_fee"), "USD")
                    : null;

  // ── Validate ─────────────────────────────────────────────────────────────
  if (!lead_id)              return { error: "Lead ID requerido."              };
  if (!client_name)          return { error: "Nombre del cliente requerido."   };
  if (!["X-Value AI", "X-VALUE GROWTH"].includes(service_type))
                             return { error: "Tipo de servicio inválido."       };
  if (!contract_signed_date) return { error: "Fecha de firma requerida."       };
  if (!first_payment_date)   return { error: "Fecha del primer pago requerida."};

  if (isAI) {
    if (setup_fee === null || isNaN(setup_fee) || setup_fee <= 0)
      return { error: "Setup fee inválido (debe ser mayor que 0 USD)." };
    // monthly_fee can be 0 — treat NaN as 0 for optional field
    const mf = monthly_fee ?? 0;
    if (isNaN(mf) || mf < 0) return { error: "Fee de mantenimiento inválido." };
  }
  if (isGrowth) {
    if (monthly_fee === null || isNaN(monthly_fee) || monthly_fee <= 0)
      return { error: "Fee mensual inválido (debe ser mayor que 0 COP)." };
  }

  const ac = getAdminClient();

  // ── Idempotency guard ────────────────────────────────────────────────────
  const { data: existing } = await ac
    .from("contracts")
    .select("id")
    .eq("lead_id", lead_id)
    .maybeSingle();
  if (existing) return { error: "Este lead ya tiene un contrato activo." };

  // Resolved monthly fee (0 if omitted for AI)
  const mfResolved = monthly_fee ?? 0;

  // ── Insert contract ──────────────────────────────────────────────────────
  const { data: contract, error: cErr } = await ac
    .from("contracts")
    .insert({
      lead_id,
      client_name,
      service_type,
      currency,
      setup_fee:        isAI     ? setup_fee   : null,
      monthly_fee:      isGrowth ? monthly_fee : (mfResolved > 0 ? mfResolved : null),
      // Backward-compat: closing_amount = AI setup fee / GROWTH monthly fee
      closing_amount:   isAI ? Math.round(setup_fee! * 100) : Math.round(monthly_fee! * 100),
      // fee_month_1_2/3_plus for GROWTH (single fee — same for all months now)
      fee_month_1_2:    isGrowth ? Math.round(monthly_fee! * 100) : null,
      fee_month_3_plus: isGrowth ? Math.round(monthly_fee! * 100) : null,
      assigned_sales_id,
      assigned_manager_id,
      contract_signed_date,
      first_payment_date,
      notes,
      created_by: caller.id,
    })
    .select("id")
    .single();

  if (cErr || !contract) return { error: cErr?.message ?? "Error al crear contrato." };
  const contractId = contract.id;

  // ── Generate payment schedule ────────────────────────────────────────────
  const firstDate = new Date(first_payment_date + "T12:00:00");
  let paymentRows: { contract_id: string; payment_month: number; scheduled_date: string; amount: number }[] = [];

  if (isAI) {
    // Month 1: setup (one-time)
    paymentRows.push({ contract_id: contractId, payment_month: 1, scheduled_date: first_payment_date, amount: setup_fee! });
    // Months 2–13: maintenance (if > 0)
    if (mfResolved > 0) {
      for (let i = 0; i < AI_MAINTENANCE_MONTHS; i++) {
        const d      = addMonths(firstDate, i + 1);
        const dateStr = d.toISOString().split("T")[0];
        paymentRows.push({ contract_id: contractId, payment_month: i + 2, scheduled_date: dateStr, amount: mfResolved });
      }
    }
  } else {
    // X-VALUE GROWTH: 12 equal monthly payments
    for (let i = 0; i < GROWTH_PAYMENT_MONTHS; i++) {
      const d       = addMonths(firstDate, i);
      const dateStr  = d.toISOString().split("T")[0];
      paymentRows.push({ contract_id: contractId, payment_month: i + 1, scheduled_date: dateStr, amount: monthly_fee! });
    }
  }

  const { data: insertedPayments, error: pErr } = await ac
    .from("payments")
    .insert(paymentRows)
    .select("id, payment_month");

  if (pErr) {
    await ac.from("contracts").delete().eq("id", contractId); // rollback
    return { error: `Error generando schedule: ${pErr.message}` };
  }

  const monthToPaymentId: Record<number, string> = {};
  for (const p of insertedPayments ?? []) monthToPaymentId[p.payment_month] = p.id;

  // ── Calculate and insert commissions ─────────────────────────────────────
  const commissionRows: object[] = [];

  if (isAI) {
    // Rule 1 (revised): Manager gets 10% if self-close, 3% if a sales rep closed the deal
    if (assigned_manager_id) {
      const isSelfClose = !assigned_sales_id || assigned_sales_id === assigned_manager_id;
      const rate = isSelfClose ? AI_MANAGER_SELF_CLOSE_RATE : AI_MANAGER_RATE;
      commissionRows.push({
        contract_id:      contractId,
        beneficiary_id:   assigned_manager_id,
        beneficiary_role: "manager",
        service_type,
        payment_month:    1,
        commission_type:  "one_time",
        base_amount:      setup_fee,
        rate,
        commission_amount: Math.round(setup_fee! * rate * 100) / 100,
      });
    }
  } else {
    // Rule 2: Comercial 10% of monthly_fee (COP) for months 1-2
    for (const month of GROWTH_SALES_MONTHS) {
      if (assigned_sales_id) {
        commissionRows.push({
          contract_id:      contractId,
          beneficiary_id:   assigned_sales_id,
          beneficiary_role: "sales",
          service_type,
          payment_month:    month,
          commission_type:  "monthly",
          base_amount:      monthly_fee,
          rate:             GROWTH_SALES_RATE,
          commission_amount: Math.round(monthly_fee! * GROWTH_SALES_RATE),
        });
      }
    }
    // Rule 3: Manager 10% of monthly_fee (COP) for months 3-4
    for (const month of GROWTH_MANAGER_MONTHS) {
      if (assigned_manager_id) {
        commissionRows.push({
          contract_id:      contractId,
          beneficiary_id:   assigned_manager_id,
          beneficiary_role: "manager",
          service_type,
          payment_month:    month,
          commission_type:  "monthly",
          base_amount:      monthly_fee,
          rate:             GROWTH_MANAGER_RATE,
          commission_amount: Math.round(monthly_fee! * GROWTH_MANAGER_RATE),
        });
      }
    }
  }

  if (commissionRows.length > 0) {
    const { error: commErr } = await ac
      .from("commissions")
      .insert(commissionRows);
    if (commErr) console.error("[finance] commissions insert error:", commErr.message);
    // Non-fatal: contract + payments are already committed
  }

  revalidatePath("/dashboard", "layout");
  return { success: true };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  registerPayment — marks a payment as received (admin/manager only)
// ═══════════════════════════════════════════════════════════════════════════════
export async function registerPayment(
  paymentId: string,
  paidDate:  string,
  notes?:    string
): Promise<ActionResult> {
  const caller = await requireRole(["admin", "manager"]);
  if (!caller) return { error: "Solo admin o manager puede registrar pagos." };

  const ac = getAdminClient();

  const { data: payment, error: fetchErr } = await ac
    .from("payments")
    .select("paid_date, contract_id, payment_month")
    .eq("id", paymentId)
    .single();

  if (fetchErr || !payment) return { error: "Pago no encontrado." };
  if (payment.paid_date)    return { error: "Este pago ya fue registrado anteriormente." };

  const { error } = await ac
    .from("payments")
    .update({ paid_date: paidDate, registered_by: caller.id, notes: notes || null })
    .eq("id", paymentId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return { success: true };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  addExpense — records a company expense (admin only)
// ═══════════════════════════════════════════════════════════════════════════════
export async function addExpense(formData: FormData): Promise<ActionResult> {
  const caller = await requireRole(["admin"]);
  if (!caller) return { error: "Solo el admin puede registrar gastos." };

  const expense_date    = (formData.get("expense_date")   as string | null) ?? "";
  const concept         = (formData.get("concept")        as string | null)?.trim() ?? "";
  const category        = (formData.get("category")       as string | null)?.trim() ?? "";
  const responsible_id  = (formData.get("responsible_id") as string | null) || null;
  const currency        = ((formData.get("currency")      as string | null) ?? "COP") as "USD" | "COP";
  const amount          = parseMoney(formData.get("amount"), currency);

  if (!expense_date)               return { error: "Fecha requerida."     };
  if (!concept)                    return { error: "Concepto requerido."  };
  if (!category)                   return { error: "Categoría requerida." };
  if (isNaN(amount) || amount <= 0) return { error: "Monto inválido."     };

  const ac = getAdminClient();
  const { error } = await ac.from("expenses").insert({
    expense_date, concept, amount, category, currency, responsible_id,
    created_by: caller.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  deleteExpense — removes a company expense (admin only)
// ═══════════════════════════════════════════════════════════════════════════════
export async function deleteExpense(expenseId: string): Promise<ActionResult> {
  const caller = await requireRole(["admin"]);
  if (!caller) return { error: "Solo el admin puede eliminar gastos." };

  const ac = getAdminClient();
  const { error } = await ac.from("expenses").delete().eq("id", expenseId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  return { success: true };
}
