"use client";
// What the client needs (Social Media Management, Website, Performance…). The sales head and admin pick it after
// the proposal meeting; the lead can't be marked Won without it. Social media / content → a content calendar.
import { useState, useTransition } from "react";
import Icon from "@/components/Icon";
import { setLeadNeeds } from "@/app/(crm)/actions";
import { CALENDAR_NEEDS, NEEDS, needsCalendar } from "@/lib/constants";

export default function LeadNeeds({ leadId, needs = [], canEdit }) {
  const [picked, setPicked] = useState(needs);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const toggle = (n) => {
    const before = picked;
    const next = picked.includes(n) ? picked.filter((x) => x !== n) : [...picked, n];
    setPicked(next);
    start(async () => {
      setError("");
      const r = await setLeadNeeds(leadId, next).catch((e) => ({ ok: false, error: e.message }));
      if (!r.ok) {
        setPicked(before);
        setError(r.error);
      }
    });
  };
  const shown = canEdit ? NEEDS : picked;
  return (
    <div className="flex flex-col gap-3">
      {shown.length ? (
        <div className="flex flex-wrap gap-2">
          {shown.map((n) => {
            const on = picked.includes(n);
            return canEdit ? (
              <button
                key={n}
                type="button"
                disabled={pending}
                onClick={() => toggle(n)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] transition ${on ? "border-brand bg-brand/10 text-brand" : "border-line text-muted hover:border-line-strong hover:text-ink"}`}
              >
                {on && <Icon name="check" size={12} />} {n}
              </button>
            ) : (
              <span key={n} className="chip text-[12.5px]">
                {n}
              </span>
            );
          })}
        </div>
      ) : (
        <p className="text-[13px] text-muted">Not picked yet.</p>
      )}
      {picked.length > 0 && (
        <p className="text-[12px] text-muted">
          {needsCalendar(picked)
            ? "Gets a content calendar — the creative strategists' team lead picks it up once the client is onboarded."
            : `No content calendar (only for ${CALENDAR_NEEDS.join(" / ")}).`}
        </p>
      )}
      {error && <p className="text-[12px] text-rose-400">{error}</p>}
    </div>
  );
}
