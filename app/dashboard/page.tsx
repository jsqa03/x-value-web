import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import AdminView from "@/components/dashboard/AdminView";
import ManagerView from "@/components/dashboard/ManagerView";
import SalesView from "@/components/dashboard/SalesView";
import ClientView from "@/components/dashboard/ClientView";
import RoleSimulator from "@/components/dashboard/RoleSimulator";
import { ROLE_META } from "@/components/dashboard/types";
import type { Profile, Role } from "@/components/dashboard/types";

// ─── Type guard ───────────────────────────────────────────────────────────────
const VALID_ROLES: Role[] = ["admin", "manager", "sales", "client"];
function isRole(v: unknown): v is Role {
  return VALID_ROLES.includes(v as Role);
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function DashboardPage(props: {
  searchParams: Promise<{ view?: string }>;
}) {
  const searchParams = await props.searchParams;

  // 1 — Auth guard
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 2 — Fetch profile + role
  const { data: profileData } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profileData || !isRole(profileData.role)) {
    redirect("/dashboard/setup");
  }

  const profile = profileData as Profile;

  // 3 — Determine effective role (admin can simulate others)
  const simulated = searchParams.view;
  const effectiveRole: Role =
    profile.role === "admin" && isRole(simulated) ? simulated : profile.role;

  // 4 — Role meta for badge
  const roleMeta = ROLE_META[profile.role];

  return (
    <main className="min-h-screen bg-[#05010d] text-white">
      {/* Ambient glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${roleMeta.color}08 0%, transparent 70%)`,
        }}
      />

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 border-b"
        style={{
          background: "rgba(5,1,13,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: "rgba(255,255,255,0.05)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="X-Value"
              width={110}
              height={28}
              style={{ height: "28px", width: "auto" }}
              priority
            />
            {/* Role badge */}
            <span
              className="hidden sm:inline-block text-xs px-2.5 py-0.5 rounded-full font-semibold"
              style={{
                background: roleMeta.bg,
                border: `1px solid ${roleMeta.border}`,
                color: roleMeta.color,
              }}
            >
              {roleMeta.label}
            </span>
            {/* Simulating badge */}
            {profile.role === "admin" && simulated && isRole(simulated) && (
              <span
                className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                Vista simulada
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:block text-xs text-white/30">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-20">

        {/* Admin role simulator */}
        {profile.role === "admin" && (
          <RoleSimulator currentView={simulated ?? "admin"} />
        )}

        {/* Role-based view dispatch */}
        {effectiveRole === "admin"   && <AdminView   profile={profile} />}
        {effectiveRole === "manager" && <ManagerView profile={profile} />}
        {effectiveRole === "sales"   && <SalesView   profile={profile} />}
        {effectiveRole === "client"  && <ClientView  profile={profile} />}
      </div>
    </main>
  );
}
