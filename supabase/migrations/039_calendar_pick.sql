-- 039: content calendar for a newly onboarded brand. The brand shows up for the creative strategists; their
-- team lead (or manager) picks it up — makes the calendar themselves or gives it to a strategist as a task.
alter table brands add column if not exists calendar_owner_id uuid references members (id) on delete set null;
alter table brands add column if not exists calendar_pick_open boolean not null default false;

-- "Make content calendar" tasks
alter table tasks drop constraint if exists tasks_kind_check;
alter table tasks add constraint tasks_kind_check
  check (kind in ('post', 'carousel', 'reel', 'story', 'video', 'design', 'website', 'shoot', 'posting', 'calendar', 'other'));
