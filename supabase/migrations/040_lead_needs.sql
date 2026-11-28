-- 040: what the client needs (Social Media Management, Website, Performance…), picked by the sales head or admin
-- after the proposal meeting and before the lead is marked Won. Only brands that need social media / content get
-- a content calendar (the pick-up card and the weekly "next week isn't planned" reminder).
alter table leads add column if not exists needs text[] not null default '{}';
