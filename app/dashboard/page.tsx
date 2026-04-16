import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AdminView from "@/components/dashboard/AdminView";
import ManagerView from "@/components/dashboard/ManagerView";
import SalesView from "@/components/dashboard/SalesView";
import ClientView from "@/components/dashboard/ClientView";
import EditProfile from "@/components/dashboard/EditProfile";
import CalendarView from "@/components/dashboard/CalendarView";
import RealtimeLeadsListener from "@/components/dashboard/RealtimeLeadsListener";
import DashboardLayoutClient from "@/components/dashboard/DashboardLayoutClient";
import type { Profile, Role } from "@/components/dashboard/types";

// ─── Type guard ───────────────────────────────────────────────────────────────
const VALID_ROLES: Role[] = ["admin", "manager", "sales", "client"];
function isRole(v: unknown): v is Role {
  return VALID_ROLES.includes(v as Role);
}

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

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url, email, university, birth_date, country, nationality, client_type, can_view_calendar")
    .eq("id", user.id)
    .single();

  if (!profileData || !isRole(profileData.role)) redirect("/dashboard/setup");

  const profile = profileData as Profile;

  const simulated = searchParams.view;
  const effectiveRole: Role =
    profile.role === "admin" && isRole(simulated) ? simulated : profile.role;

  const section    = searchParams.section ?? DEFAULT_SECTION[effectiveRole];
  const currentView = simulated ?? profile.role;

  const canSeeCalendar = profile.role === "admin" || profile.can_view_calendar === true;

  return (
    <DashboardLayoutClient
      sidebarProps={{
        profile,
        effectiveRole,
        activeSection: section,
        isAdmin: profile.role === "admin",
        currentView,
        canViewCalendar: profile.can_view_calendar ?? false,
      }}
    >
      {/* Realtime leads sync — invisible, active for all roles */}
      <RealtimeLeadsListener />

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
        {section === "profile" ? (
          <EditProfile profile={profile} userId={user.id} />
        ) : section === "calendar" && canSeeCalendar ? (
          <CalendarView />
        ) : (
          <>
            {effectiveRole === "admin"   && <AdminView   profile={profile} section={section} userId={user.id} />}
            {effectiveRole === "manager" && <ManagerView profile={profile} section={section} userId={user.id} />}
            {effectiveRole === "sales"   && <SalesView   profile={profile} section={section} />}
            {effectiveRole === "client"  && <ClientView  profile={profile} section={section} />}
          </>
        )}
      </div>
    </DashboardLayoutClient>
  );
}
