// Dashboard card: newly onboarded brands whose content calendar nobody has picked up yet. Every creative
// strategist sees it; the team lead / manager (and admin) picks it up — "I'll make it" or "Give to" a strategist.
import { Block } from "@/components/Home";
import CalendarPickRow from "@/components/CalendarPickRow";
import { calendarPicks, strategyPeople } from "@/lib/calendarPick";
import { canLockCalendar, isStrategist } from "@/lib/permissions";

const day = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short" });

export default async function CalendarPicks({ me }) {
  const picker = canLockCalendar(me);
  if (!picker && !isStrategist(me)) return null;
  const brands = await calendarPicks();
  if (!brands.length) return null;
  const { members, leads } = await strategyPeople();
  const leadNames = members.filter((m) => leads.includes(m.id)).map((m) => m.name.split(" ")[0]);
  const team = members.filter((m) => m.id !== me.id);
  return (
    <Block title="New brands — content calendar" count={brands.length}>
      <p className="mb-1 text-[12px] text-muted">{picker ? "Make it yourself or give it to a strategist." : `${leadNames.join(" / ") || "The team lead"} picks who makes it.`}</p>
      <ul>
        {brands.map((b) => (
          <CalendarPickRow key={b.id} brand={{ id: b.id, name: b.name }} since={b.onboarded_at ? day.format(new Date(b.onboarded_at)) : ""} team={picker ? team : null} />
        ))}
      </ul>
    </Block>
  );
}
