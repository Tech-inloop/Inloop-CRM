"use client";
// One brand waiting for its content calendar: "I'll make it" or give it to a strategist (as a task).
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/Icon";
import { tint } from "@/components/ui";
import { pickCalendar } from "@/app/(crm)/calendar/actions";

export default function CalendarPickRow({ brand, since, team }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [who, setWho] = useState("");
  const [error, setError] = useState("");
  const pick = (id) =>
    start(async () => {
      setError("");
      const r = await pickCalendar(brand.id, id).catch((e) => ({ ok: false, error: e.message }));
      if (!r.ok) return setError(r.error);
      if (r.mine) router.push(`/calendar?brand=${brand.id}`);
      else router.refresh();
    });
  return (
    <li className="flex flex-col gap-2 border-b border-line py-3 last:border-0">
      <div className="flex items-center gap-2.5">
        <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: tint(brand.name) }} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-medium">{brand.name}</span>
          {since && <span className="block text-[11.5px] text-muted">Onboarded {since}</span>}
        </span>
        {!team && (
          <Link href={`/calendar?brand=${brand.id}`} className="btn-ghost btn-sm">
            <Icon name="calendar" size={12} /> Calendar
          </Link>
        )}
      </div>
      {team && (
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" disabled={pending} onClick={() => pick("")} className="btn-primary btn-sm whitespace-nowrap">
            <Icon name="check" size={12} /> I&apos;ll make it
          </button>
          {team.length > 0 && (
            <>
              <select className="field h-8 min-w-0 flex-1 py-0 text-[12.5px]" value={who} onChange={(e) => setWho(e.target.value)} disabled={pending}>
                <option value="">Give to…</option>
                {team.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <button type="button" disabled={pending || !who} onClick={() => pick(who)} className="btn-ghost btn-sm whitespace-nowrap">
                <Icon name="arrow" size={12} /> Give
              </button>
            </>
          )}
        </div>
      )}
      {error && <p className="text-[12px] text-rose-400">{error}</p>}
    </li>
  );
}
