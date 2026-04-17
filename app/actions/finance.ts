"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "./admin";

// ═══════════════════════════════════════════════════════════════════════════════
//  COMMISSION RATES — HARD-CODED, never modify without explicit business approval
// ═══════════════════════════════════════════════════════════════════════════════
const AI_MANAGER_RATE        = 0.03 as const;  // 3%  — X-Value AI closing, one-time
const GROWTH_SALES_RATE      = 0.10 as const;  // 10% — X-VALUE GROWTH months 1-2 (sales)
const GROWTH_MANAGER_RATE    = 0.10 as const;  // 10% — X-VALUE GROWTH months 3-4 (manager)
const GROWTH_SALES_MONTHS    = [1, 2]          as const;
const GROWTH_MANAGER_MONTHS  = [3, 4]          as const;
const GROWTH_PAYMENT_MONTHS  = 12              as const;  // schedule horizon

// ─── Utilities ────────────────────────────────────────────────────────────────

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/** Add N calendar months — anchored to first_payment_date. */
function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/** Parse a Colombian-formatted integer (remove dots/commas). */
function parseCOP(raw: FormDataEntryValue | null): number {
  if (!raw) return NaN;
  const n = Number(String(raw).replace(/[^0-9]/g, ""));
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

  // ── Parse fields ────────────────────────────────────────────────────────────
  const lead_id              = (formData.get("lead_id")              as string | null) ?? "";
  const client_name          = (formData.get("client_name")          as string | null)?.trim() ?? "";
  const service_type         = (formData.get("service_type")         as string | null) ?? "";
  const contract_signed_date = (formData.get("contract_signed_date") as string | null) ?? "";
  const first_payment_date   = (formData.get("first_payment_date")   as string | null) ?? "";
  const assigned_sales_id    = (formData.get("assigned_sales_id")    as string | null) || null;
  const assigned_manager_id  = (formData.get("assigned_manager_id")  as string | null) || null;
  const notes                = (formData.get("notes")                as string | null)?.trim() || null;

  const closing_amount = parseCOP(formData.get("closing_amount"));
  const fee_1_2        = service_type === "X-VALUE GROWTH" ? parseCOP(formData.get("fee_month_1_2"))   : null;
  const fee_3plus      = service_type === "X-VALUE GROWTH" ? parseCOP(formData.get("fee_month_3_plus")) : null;

  // ── Validate ────────────────────────────────────────────────────────────────
  if (!lead_id)              return { error: "Lead ID requerido."              };
  if (!client_name)          return { error: "Nombre del cliente requerido."   };
  if (!["X-Value AI", "X-VALUE GROWTH"].includes(service_type))
                             return { error: "Tipo de servicio inválido."       };
  if (isNaN(closing_amount) || closing_amount <= 0)
                             return { error: "Monto de cierre inválido."        };
  if (!contract_signed_date) return { error: "Fecha de firma requerida."       };
  if (!first_payment_date)   return { error: "Fecha del primer pago requerida."};

  if (service_type === "X-VALUE GROWTH") {
    if (!fee_1_2   || isNaN(fee_1_2)   || fee_1_2   <= 0) return { error: "Fee meses 1-2 inválido."  };
    if (!fee_3plus || isNaN(fee_3plus) || fee_3plus <= 0) return { error: "Fee mes 3+ inválido."     };
  }

  const ac = getAdminClient();

  // ── Idempotency guard ───────────────────────────────────────────────────────
  const { data: existing } = await ac
    .from("contracts")
    .select("id")
    .eq("lead_id", lead_id)
    .maybeSingle();
  if (existing) return { error: "Este lead ya tiene un contrato activo." };

  // ── Insert contract ─────────────────────────────────────────────────────────
  const { data: contract, error: cErr } = await ac
    .from("contracts")
    .insert({
      lead_id,
      client_name,
      service_type,
      assigned_sales_id,
      assigned_manager_id,
      closing_amount,
      fee_month_1_2:    fee_1_2   ?? null,
      fee_month_3_plus: fee_3plus ?? null,
      contract_signed_date,
      first_payment_date,
      notes,
      created_by: caller.id,
    })
    .select("id")
    .single();

  if (cErr || !contract) return { error: cErr?.message ?? "Error al crear contrato." };
  const contractId = contract.id;

  // ── Generate payment schedule ───────────────────────────────────────────────
  const firstDate = new Date(first_payment_date + "T12:00:00"); // noon to avoid TZ drift

  const paymentRows =
    service_type === "X-Value AI"
      ? [{ contract_id: contractId, payment_month: 1, scheduled_date: first_payment_date, amount: closing_amount }]
      : Array.from({ length: GROWTH_PAYMENT_MONTHS }, (_, i) => {
          const month = i + 1;
          const d     = addMonths(firstDate, i);
          const dateStr = d.toISOString().split("T")[0];
          const amount  = month <= 2 ? fee_1_2! : fee_3plus!;
          return { contract_id: contractId, payment_month: month, scheduled_date: dateStr, amount };
        });

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

  // ── Calculate and insert commissions (hard-coded logic) ─────────────────────
  const commissionRows: object[] = [];

  if (service_type === "X-Value AI") {
    // Manager 3% of closing_amount — one-time, linked to month-1 payment
    if (assigned_manager_id) {
      commissionRows.push({
        contract_id:      contractId,
        beneficiary_id:   assigned_manager_id,
        beneficiary_role: "manager",
        service_type,
        payment_month:    1,
        commission_type:  "one_time",
        base_amount:      closing_amount,
        rate:             AI_MANAGER_RATE,
        commission_amount: Math.round(closing_amount * AI_MANAGER_RATE),
      });
    }
  } else {
    // X-VALUE GROWTH: Sales months 1-2, Manager months 3-4
    for (const month of GROWTH_SALES_MONTHS) {
      if (assigned_sales_id) {
        const base = fee_1_2!;
        commissionRows.push({
          contract_id:      contractId,
          beneficiary_id:   assigned_sales_id,
          beneficiary_role: "sales",
          service_type,
          payment_month:    month,
          commission_type:  "monthly",
          base_amount:      base,
          rate:             GROWTH_SALES_RATE,
          commission_amount: Math.round(base * GROWTH_SALES_RATE),
        });
      }
    }
    for (const month of GROWTH_MANAGER_MONTHS) {
      if (assigned_manager_id) {
        const base = fee_3plus!;
        commissionRows.push({
          contract_id:      contractId,
          beneficiary_id:   assigned_manager_id,
          beneficiary_role: "manager",
          service_type,
          payment_month:    month,
          commission_type:  "monthly",
          base_amount:      base,
          rate:             GROWTH_MANAGER_RATE,
          commission_amount: Math.round(base * GROWTH_MANAGER_RATE),
        });
      }
    }
  }

  if (commissionRows.length > 0) {
    const { error: commErr } = await ac
      .from("commissions")
      .insert(commissionRows)
      .select("id");
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

  const expense_date    = (formData.get("expense_date")    as string | null) ?? "";
  const concept         = (formData.get("concept")         as string | null)?.trim() ?? "";
  const category        = (formData.get("category")        as string | null)?.trim() ?? "";
  const responsible_id  = (formData.get("responsible_id")  as string | null) || null;
  const amount          = parseCOP(formData.get("amount"));

  if (!expense_date)                       return { error: "Fecha requerida."     };
  if (!concept)                            return { error: "Concepto requerido."  };
  if (!category)                           return { error: "Categoría requerida." };
  if (isNaN(amount) || amount <= 0)        return { error: "Monto inválido."      };

  const ac = getAdminClient();
  const { error } = await ac.from("expenses").insert({
    expense_date, concept, amount, category, responsible_id,
    created_by: caller.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

