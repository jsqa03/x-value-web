import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AdminView from "@/components/dashboard/AdminView";
import ManagerView from "@/components/dashboard/ManagerView";
import SalesView from "@/components/dashboard/SalesView";
import ClientView from "@/components/dashboard/ClientView";
import EditProfile from "@/components/dashboard/EditProfile";
import RealtimeLeadsListener from "@/components/dashboard/RealtimeLeadsListener";
import Sidebar from "@/components/dashboard/Sidebar";
import type { Profile, Role } from "@/components/dashboard/types";

// ─── Type guard ───────────────────────────────────────────────────────────────
const VALID_ROLES: Role[] = ["admin", "manager", "sales", "client"];
function isRole(v: unknown): v is Role {
  return VALID_ROLES.includes(v as Role);
}

// Default landing section per role
const DEFAULT_SECTION: Record<Role, string> = {
  admin:   "overview",
  manager: "overview",
  sales:   "leads",
  client:  "agent",
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function DashboardPage(props: {
  searchParams: Promise<{ view?: string; section?: string }>;
}) {
  const searchParams = await props.searchParams;

  // 1 — Auth guard
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2 — Fetch profile + all extended fields
  const { data: profileData } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url, email, university, birth_date, country, nationality, client_type")
    .eq("id", user.id)
    .single();

  if (!profileData || !isRole(profileData.role)) redirect("/dashboard/setup");

  const profile = profileData as Profile;

  // 3 — Effective role (admin can simulate others)
  const simulated = searchParams.view;
  const effectiveRole: Role =
    profile.role === "admin" && isRole(simulated) ? simulated : profile.role;

  // 4 — Active section (falls back to role default)
  const section = searchParams.section ?? DEFAULT_SECTION[effectiveRole];

  // 5 — Current view string for the simulator
  const currentView = simulated ?? profile.role;

  return (
    <div
      className="flex min-h-screen text-white"
      style={{ background: "#0a0812" }}
    >
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <Sidebar
        profile={profile}
        effectiveRole={effectiveRole}
        activeSection={section}
        isAdmin={profile.role === "admin"}
        currentView={currentView}
      />

      {/* Realtime leads sync — invisible, active for all roles */}
      <RealtimeLeadsListener />

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex-1 min-h-screen overflow-y-auto" style={{ marginLeft: "240px" }}>
        <div className="max-w-5xl mx-auto px-8 py-10">
          {/* Mi Perfil — available to all roles */}
          {section === "profile" ? (
            <EditProfile profile={profile} userId={user.id} />
          ) : (
            <>
              {effectiveRole === "admin"   && <AdminView   profile={profile} section={section} userId={user.id} />}
              {effectiveRole === "manager" && <ManagerView profile={profile} section={section} userId={user.id} />}
              {effectiveRole === "sales"   && <SalesView   profile={profile} section={section} />}
              {effectiveRole === "client"  && <ClientView  profile={profile} section={section} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
