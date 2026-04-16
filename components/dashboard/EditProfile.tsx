"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/app/actions/admin";
import AvatarUpload from "./AvatarUpload";
import { COUNTRIES } from "./types";
import type { Profile } from "./types";
import {
  User, GraduationCap, Globe, CalendarDays,
  CheckCircle2, AlertCircle, Loader2, Save,
} from "lucide-react";

interface Props { profile: Profile; userId: string }

function Field({ label, icon: Icon, children }: {
  label: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-zinc-500 text-xs font-semibold tracking-wide uppercase flex items-center gap-1.5">
        <Icon size={10} className="text-zinc-600" />
        {label}
      </label>
      {children}
    </div>
  );
}

function calcAge(dateStr: string): number | null {
  if (!dateStr) return null;
  const birth = new Date(dateStr);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

export default function EditProfile({ profile, userId }: Props) {
  const [result, setResult]           = useState<{ success?: boolean; error?: string } | null>(null);
  const [isPending, startTransition]  = useTransition();
  const [birthDate, setBirthDate]     = useState(profile.birth_date ?? "");
  const [country, setCountry]         = useState(profile.country ?? "");
  const [nationality, setNationality] = useState(profile.nationality ?? "");

  const age = calcAge(birthDate);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    const fd = new FormData(e.currentTarget);
    if (country)     fd.set("country",     country);
    if (nationality) fd.set("nationality", nationality);
    if (birthDate)   fd.set("birth_date",  birthDate);
    startTransition(async () => { setResult(await updateProfile(fd)); });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Heading */}
      <div>
        <p className="text-zinc-500 text-xs tracking-widest uppercase mb-1">Cuenta</p>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Mi Perfil</h1>
      </div>

      {/* Avatar section */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center gap-4">
        <p className="text-zinc-400 text-sm font-medium self-start">Foto de perfil</p>
        <AvatarUpload
          userId={userId}
          initialAvatarUrl={profile.avatar_url}
          displayName={profile.full_name ?? "U"}
          accentColor="#f97316"
          size="lg"
        />
        <p className="text-zinc-600 text-xs text-center">Máximo 50 MB · JPG, PNG, WebP</p>
      </div>

      {/* Profile form */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
        <p className="text-zinc-400 text-sm font-medium mb-5">Información personal</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Email — display only */}
          <Field label="Email" icon={User}>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-500 select-all">
              {profile.email ?? "—"}
            </div>
          </Field>

          {/* Full name */}
          <Field label="Nombre completo" icon={User}>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
              <input
                name="full_name"
                type="text"
                defaultValue={profile.full_name ?? ""}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>
          </Field>

          {/* University */}
          <Field label="Universidad / Institución" icon={GraduationCap}>
            <div className="relative">
              <GraduationCap size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
              <input
                name="university"
                type="text"
                defaultValue={profile.university ?? ""}
                placeholder="Universidad Nacional…"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>
          </Field>

          {/* Birth date (controlled) + live age display */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha de nacimiento" icon={CalendarDays}>
              <div className="relative">
                <CalendarDays size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" />
                <input
                  type="date"
                  value={birthDate}
                  min="1930-01-01"
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split("T")[0]}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>
            </Field>
            <Field label="Edad" icon={CalendarDays}>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm select-none">
                <span className={age !== null ? "text-white/80" : "text-white/20"}>
                  {age !== null ? `${age} años` : "—"}
                </span>
              </div>
            </Field>
          </div>

          {/* Country + Nationality */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="País" icon={Globe}>
              <div className="relative">
                <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-zinc-600" />
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 transition-colors appearance-none"
                >
                  <option value="" className="bg-zinc-950">— Seleccionar —</option>
                  {COUNTRIES.map((c) => <option key={c} value={c} className="bg-zinc-950">{c}</option>)}
                </select>
              </div>
            </Field>
            <Field label="Nacionalidad" icon={Globe}>
              <div className="relative">
                <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-zinc-600" />
                <select
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 transition-colors appearance-none"
                >
                  <option value="" className="bg-zinc-950">— Seleccionar —</option>
                  {COUNTRIES.map((c) => <option key={c} value={c} className="bg-zinc-950">{c}</option>)}
                </select>
              </div>
            </Field>
          </div>

          {/* Feedback */}
          {result?.error && (
            <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2.5">
              <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-400 text-xs leading-relaxed">{result.error}</p>
            </div>
          )}
          {result?.success && (
            <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2.5">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <p className="text-emerald-400 text-xs">Perfil actualizado correctamente.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {isPending ? (
              <><Loader2 size={14} className="animate-spin" /> Guardando…</>
            ) : (
              <><Save size={14} /> Guardar cambios</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
