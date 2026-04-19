"use server";

import { createClient as createServiceClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export interface ContractStats {
  growthContracts: number;
  aiContracts: number;
  totalClients: number;
}

export async function getXBankStats(): Promise<ContractStats> {
  try {
    const ac = getAdminClient();

    const [
      { count: growthCount },
      { count: aiCount },
      { count: clientCount },
    ] = await Promise.all([
      ac
        .from("contracts")
        .select("*", { count: "exact", head: true })
        .eq("service_type", "X-VALUE GROWTH")
        .eq("status", "active"),
      ac
        .from("contracts")
        .select("*", { count: "exact", head: true })
        .eq("service_type", "X-Value AI")
        .eq("status", "active"),
      ac
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "client"),
    ]);

    return {
      growthContracts: growthCount ?? 0,
      aiContracts: aiCount ?? 0,
      totalClients: clientCount ?? 0,
    };
  } catch {
    return { growthContracts: 0, aiContracts: 0, totalClients: 0 };
  }
}

export async function joinXBankWaitlist(
  email: string,
  companyName: string
): Promise<{ error?: string }> {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Correo inválido." };
  }
  try {
    const ac = getAdminClient();
    const { error } = await ac.from("xbank_waitlist").insert({
      email: email.trim().toLowerCase(),
      company_name: companyName.trim() || null,
    });
    if (error) {
      // Duplicate email — treat as success so we don't leak info
      if (error.code === "23505") return {};
      return { error: "No se pudo registrar. Intenta de nuevo." };
    }
    return {};
  } catch {
    return { error: "Error de red. Intenta de nuevo." };
  }
}
