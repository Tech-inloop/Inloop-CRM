import "server-only";
// Content calendar for a newly onboarded brand. When a brand is onboarded it shows up for the creative
// strategists ("New brand — content calendar"). Their team lead (Abhay) or manager picks it up: makes the
// calendar themselves, or gives it to a strategist as a task. It isn't a task for the team lead.
import { db } from "@/lib/supabase/server";
import { pushTo } from "@/lib/push";
import { listGroups } from "@/lib/leads";
import { runnersOf, teamLeadIdsOf } from "@/lib/groups";
import { needsCalendar } from "@/lib/constants";

/**
 * Which of these brands get a content calendar: what the client needs (picked on the lead), else the brand's
 * services; nothing known → yes. Brands: [{ id, lead_id, services }].
 */
export async function calendarBrandIds(brands) {
  const leadIds = brands.map((b) => b.lead_id).filter(Boolean);
  const { data, error } = leadIds.length ? await db().from("leads").select("id, needs").in("id", leadIds) : { data: [] };
  const needs = Object.fromEntries((error ? [] : data || []).map((l) => [l.id, l.needs || []]));
  return new Set(
    brands
      .filter((b) => {
        const n = needs[b.lead_id] || [];
        return needsCalendar(n.length ? n : (b.services || []).map((s) => s.name).filter(Boolean));
      })
      .map((b) => b.id),
  );
}

/** The creative strategists: their team leads, the people who run the group, and the members. */
export async function strategyPeople() {
  const groups = (await listGroups()).filter((g) => g.kind === "strategy");
  const members = new Map();
  for (const g of groups) for (const m of g.members) if (m.active) members.set(m.id, { id: m.id, name: m.name });
  const leads = [...new Set(groups.flatMap(teamLeadIdsOf))];
  const runners = [...new Set(groups.flatMap(runnersOf))];
  return { leads, runners, members: [...members.values()].sort((a, b) => a.name.localeCompare(b.name)) };
}

/** Who picks: the team leads; if the group has none, whoever runs it. */
export async function pickerIds() {
  const { leads, runners } = await strategyPeople();
  return leads.length ? leads : runners;
}

/** Onboarding: open the brand's calendar for picking and tell the team lead. Never fails the onboarding. */
export async function openCalendarPick(brand) {
  try {
    // Website-only / performance-only clients don't get a content calendar
    if (!(await calendarBrandIds([brand])).has(brand.id)) return;
    const { error } = await db().from("brands").update({ calendar_pick_open: true }).eq("id", brand.id).is("calendar_owner_id", null);
    if (error) return;
    await pushTo(await pickerIds(), {
      title: `🗓️ ${brand.name}: content calendar`,
      body: `New brand onboarded — make its content calendar yourself or give it to a strategist.`,
      url: "/",
      tag: `cal-pick-${brand.id}`,
    });
  } catch (e) {
    console.error("Calendar pick:", e);
  }
}

/** Brands waiting for someone to pick up their content calendar (oldest first). [] before migration 039. */
export async function calendarPicks() {
  const { data, error } = await db().from("brands").select("id, name, onboarded_at").eq("stage", "active").eq("calendar_pick_open", true).order("onboarded_at");
  return error ? [] : data || [];
}
