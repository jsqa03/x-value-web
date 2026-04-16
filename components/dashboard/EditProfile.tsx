"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/app/actions/admin";
import AvatarUpload from "./AvatarUpload";
import { COUNTRIES, computeAge } from "./types";
import type { Profile } from "./types";
import {
  User, GraduationCap, Globe, CalendarDays,
  CheckCircle2, AlertCircle, Loader2, Save,
} from "lucide-react";

interface Props {
  profile: Profile;
  userId: string;
}

const inputBase: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
};

function Field({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
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

export default function EditProfile({ profile, userId }: Props) {
  const [result, setResult]       = useState<{ success?: boolean; error?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Local controlled state for select fields
  const [country, setCountry]         = useState(profile.country ?? "");
  const [nationality, setNationality] = useState(profile.nationality ?? "");

  const age = computeAge(profile.birth_date);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    const fd = new FormData(e.currentTarget);
    if (country)     fd.set("country",     country);
    if (nationality) fd.set("nationality", nationality);

    startTransition(async () => {
      const res = await updateProfile(fd);
      setResult(res);
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Heading */}
      <div>
        <p className="text-zinc-500 text-xs tracking-widest uppercase mb-1">Cuenta</p>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Mi <span style={{ color: "#a855f7" }}>Perfil</span>
        </h1>
      </div>

      {/* Avatar section */}
      <div
        className="rounded-2xl p-6 flex flex-col items-center gap-4"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p className="text-zinc-400 text-sm font-medium self-start">Foto de perfil</p>
        <AvatarUpload
          userId={userId}
          initialAvatarUrl={profile.avatar_url}
          displayName={profile.full_name ?? "U"}
          accentColor="#a855f7"
          size="lg"
        />
        <p className="text-zinc-600 text-xs text-center">
          Máximo 50 MB · JPG, PNG, WebP
        </p>
      </div>

      {/* Profile form */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p className="text-zinc-400 text-sm font-medium mb-5">Información personal</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Email — read only */}
          <Field label="Email" icon={User}>
            <div
              className="rounded-xl px-4 py-2.5 text-sm text-zinc-500 select-all"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {profile.email ?? "—"}
            </div>
          </Field>

          {/* Full name */}
          <Field label="Nombre completo" icon={User}>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.22)" }} />
              <input
                name="full_name"
                type="text"
                defaultValue={profile.full_name ?? ""}
                required
                className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-700 outline-none transition-all"
                style={inputBase}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(168,85,247,0.4)")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
          </Field>

          {/* University */}
          <Field label="Universidad / Institución" icon={GraduationCap}>
            <div className="relative">
              <GraduationCap size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.22)" }} />
              <input
                name="university"
                type="text"
                defaultValue={profile.university ?? ""}
                placeholder="Universidad Nacional…"
                className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-700 outline-none transition-all"
                style={inputBase}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(168,85,247,0.4)")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
          </Field>

          {/* Birth date + age */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha de nacimiento" icon={CalendarDays}>
              <div className="relative">
                <CalendarDays size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.22)" }} />
                <input
                  name="birth_date"
                  type="date"
                  defaultValue={profile.birth_date ?? ""}
                  min="1930-01-01"
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split("T")[0]}
                  className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-white outline-none transition-all"
                  style={inputBase}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(168,85,247,0.4)")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
            </Field>
            <Field label="Edad" icon={CalendarDays}>
              <div
                className="rounded-xl px-4 py-2.5 text-sm select-none"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", color: age !== null ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)" }}
              >
                {age !== null ? `${age} años` : "—"}
              </div>
            </Field>
          </div>

          {/* Country + Nationality */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="País" icon={Globe}>
              <div className="relative">
                <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" style={{ color: "rgba(255,255,255,0.22)" }} />
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-white outline-none transition-all appearance-none"
                  style={{ ...inputBase, color: country ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(168,85,247,0.4)")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                >
                  <option value="" style={{ background: "#0a0812" }}>— Seleccionar —</option>
                  {COUNTRIES.map((c) => <option key={c} value={c} style={{ background: "#0a0812" }}>{c}</option>)}
                </select>
              </div>
            </Field>
            <Field label="Nacionalidad" icon={Globe}>
              <div className="relative">
                <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" style={{ color: "rgba(255,255,255,0.22)" }} />
                <select
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-white outline-none transition-all appearance-none"
                  style={{ ...inputBase, color: nationality ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(168,85,247,0.4)")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                >
                  <option value="" style={{ background: "#0a0812" }}>— Seleccionar —</option>
                  {COUNTRIES.map((c) => <option key={c} value={c} style={{ background: "#0a0812" }}>{c}</option>)}
                </select>
              </div>
            </Field>
          </div>

          {/* Feedback */}
          {result?.error && (
            <div className="flex items-start gap-2 rounded-xl px-3 py-2.5" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-400 text-xs leading-relaxed">{result.error}</p>
            </div>
          )}
          {result?.success && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <p className="text-emerald-400 text-xs">Perfil actualizado correctamente.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-black transition-all disabled:opacity-60 hover:opacity-90 mt-1"
            style={{ background: "#a855f7", color: "#fff" }}
          >
            {isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Guardando…
              </>
            ) : (
              <>
                <Save size={14} />
                Guardar cambios
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
