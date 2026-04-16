"use client";

import { useState, useRef } from "react";
import { Camera, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { revalidateDashboard } from "@/app/actions/admin";

interface Props {
  userId: string;
  initialAvatarUrl: string | null | undefined;
  displayName: string;
  accentColor?: string;
  size?: "sm" | "md" | "lg";
}

export default function AvatarUpload({
  userId,
  initialAvatarUrl,
  displayName,
  accentColor = "#f97316",
  size = "md",
}: Props) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl ?? null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const fileRef                   = useRef<HTMLInputElement>(null);

  const initial = (displayName[0] ?? "?").toUpperCase();

  const dim = size === "sm" ? "w-8 h-8 text-xs" :
              size === "lg" ? "w-24 h-24 text-3xl" :
                              "w-16 h-16 text-xl";

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) { setError("Máximo 50 MB por imagen."); return; }
    if (!file.type.startsWith("image/")) { setError("Solo se permiten imágenes."); return; }

    setLoading(true);
    setError(null);

    const supabase = createClient();

    // Use the REAL authenticated user id for storage RLS compliance
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("No autenticado."); setLoading(false); return; }

    const realUserId = user.id;
    const timestamp  = Date.now();
    const path       = `${realUserId}/${timestamp}-${file.name}`;

    // Remove previous files in user's folder
    const { data: existing } = await supabase.storage.from("avatars").list(realUserId);
    if (existing && existing.length > 0) {
      await supabase.storage
        .from("avatars")
        .remove(existing.map((f) => `${realUserId}/${f.name}`));
    }

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: false, contentType: file.type });

    if (uploadError) { setError(uploadError.message); setLoading(false); return; }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = `${urlData.publicUrl}?t=${timestamp}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: urlData.publicUrl })
      .eq("id", userId);

    if (updateError) { setError(updateError.message); setLoading(false); return; }

    setAvatarUrl(publicUrl);
    setLoading(false);
    if (fileRef.current) fileRef.current.value = "";
    await revalidateDashboard();
  }

  async function handleDelete() {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("No autenticado."); setLoading(false); return; }

    const realUserId = user.id;
    const { data: existing } = await supabase.storage.from("avatars").list(realUserId);
    if (existing && existing.length > 0) {
      await supabase.storage
        .from("avatars")
        .remove(existing.map((f) => `${realUserId}/${f.name}`));
    }

    await supabase.from("profiles").update({ avatar_url: null }).eq("id", userId);
    setAvatarUrl(null);
    setLoading(false);
    await revalidateDashboard();
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar with hover overlay */}
      <div
        className="relative group cursor-pointer"
        onClick={() => !loading && fileRef.current?.click()}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={displayName} className={`${dim} rounded-2xl object-cover`} />
        ) : (
          <div
            className={`${dim} rounded-2xl flex items-center justify-center font-bold`}
            style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}25` }}
          >
            {initial}
          </div>
        )}
        <div className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/55">
          {loading ? <Loader2 size={18} className="animate-spin text-white" /> : <Camera size={18} className="text-white" />}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors disabled:opacity-40"
        >
          {avatarUrl ? "Cambiar foto" : "Subir foto"}
        </button>
        {avatarUrl && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-full bg-zinc-900 border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
          >
            <Trash2 size={11} className="inline mr-1" />
            Eliminar
          </button>
        )}
      </div>

      {error && <p className="text-red-400 text-xs text-center max-w-[200px]">{error}</p>}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
    </div>
  );
}
