"use client";

import { useState, useTransition } from "react";
import { toggleCalendarAccess } from "@/app/actions/admin";
import { Loader2 } from "lucide-react";

interface Props {
  userId: string;
  initialValue: boolean;
}

export default function CalendarToggle({ userId, initialValue }: Props) {
  const [enabled, setEnabled]     = useState(initialValue);
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    const next = !enabled;
    setEnabled(next); // optimistic
    startTransition(async () => {
      const result = await toggleCalendarAccess(userId, next);
      if (result.error) setEnabled(!next); // revert
    });
  }

  if (pending) {
    return <Loader2 size={14} className="text-zinc-500 animate-spin" />;
  }

  return (
    <button
      onClick={handleToggle}
      title={enabled ? "Revocar acceso al calendario" : "Dar acceso al calendario"}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none shrink-0"
      style={{
        background: enabled ? "rgba(249,115,22,0.75)" : "rgba(63,63,70,1)",
        border:     enabled ? "1px solid rgba(249,115,22,0.4)" : "1px solid rgba(82,82,91,0.6)",
      }}
    >
      <span
        className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: enabled ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  );
}
