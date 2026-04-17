"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, User } from "lucide-react";

interface UserOption {
  id: string;
  full_name: string | null;
  email: string;
}

export default function AgendaUserSelect({
  users,
  currentUserId,
  selectedId,
}: {
  users: UserOption[];
  currentUserId: string;
  selectedId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === currentUserId || !e.target.value) {
      params.delete("agendaUser");
    } else {
      params.set("agendaUser", e.target.value);
    }
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="relative">
      <User size={12} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
      <select
        value={selectedId ?? currentUserId}
        onChange={handleChange}
        className="appearance-none bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-8 py-2 text-xs font-semibold text-zinc-300 outline-none focus:border-orange-500/50 transition-colors cursor-pointer"
      >
        <option value={currentUserId} className="bg-zinc-950">Mi Agenda (yo)</option>
        {users
          .filter((u) => u.id !== currentUserId)
          .map((u) => (
            <option key={u.id} value={u.id} className="bg-zinc-950">
              {u.full_name ?? u.email}
            </option>
          ))}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
    </div>
  );
}
