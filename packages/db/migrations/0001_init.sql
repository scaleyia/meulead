-- ============================================================
--  MeuLead — schema inicial (multi-tenant com RLS)
--  Cada linha pertence a uma "org" (empresa cliente).
--  O Postgres isola por org via Row Level Security.
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- Tabelas ----------

create table public.orgs (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

create table public.members (
  org_id      uuid not null references public.orgs (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        text not null default 'owner' check (role in ('owner', 'admin', 'member')),
  created_at  timestamptz not null default now(),
  primary key (org_id, user_id)
);

create table public.lead_lists (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.orgs (id) on delete cascade,
  name        text not null,
  source      text check (source in ('google_maps','instagram','linkedin','cnpj','manual','import')),
  created_at  timestamptz not null default now()
);

create table public.leads (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.orgs (id) on delete cascade,
  list_id     uuid references public.lead_lists (id) on delete set null,
  name        text,
  company     text,
  phone       text,
  email       text,
  source      text not null default 'manual'
                check (source in ('google_maps','instagram','linkedin','cnpj','manual','import')),
  raw         jsonb,
  created_at  timestamptz not null default now()
);

create table public.contacts (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.orgs (id) on delete cascade,
  lead_id     uuid references public.leads (id) on delete set null,
  name        text,
  phone       text,
  email       text,
  created_at  timestamptz not null default now()
);

create index on public.members (user_id);
create index on public.lead_lists (org_id);
create index on public.leads (org_id);
create index on public.leads (list_id);
create index on public.contacts (org_id);

-- ---------- Helper: orgs do usuário logado ----------
-- SECURITY DEFINER evita recursão de RLS ao consultar members dentro das policies.

create or replace function public.user_org_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from public.members where user_id = auth.uid()
$$;

-- ---------- RLS ----------

alter table public.orgs        enable row level security;
alter table public.members     enable row level security;
alter table public.lead_lists  enable row level security;
alter table public.leads       enable row level security;
alter table public.contacts    enable row level security;

-- orgs: vê/edita apenas as que é membro
create policy "orgs: membros leem" on public.orgs
  for select using (id in (select public.user_org_ids()));
create policy "orgs: membros atualizam" on public.orgs
  for update using (id in (select public.user_org_ids()));

-- members: vê os membros das próprias orgs
create policy "members: leem da própria org" on public.members
  for select using (org_id in (select public.user_org_ids()));

-- lead_lists / leads / contacts: CRUD só dentro das próprias orgs
create policy "lead_lists: acesso por org" on public.lead_lists
  for all using (org_id in (select public.user_org_ids()))
  with check (org_id in (select public.user_org_ids()));

create policy "leads: acesso por org" on public.leads
  for all using (org_id in (select public.user_org_ids()))
  with check (org_id in (select public.user_org_ids()));

create policy "contacts: acesso por org" on public.contacts
  for all using (org_id in (select public.user_org_ids()))
  with check (org_id in (select public.user_org_ids()));

-- ---------- Trigger: cria org + membership no cadastro ----------
-- Usa o org_name enviado no signup (options.data.org_name).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  org_label  text;
begin
  org_label := coalesce(nullif(new.raw_user_meta_data ->> 'org_name', ''), 'Minha empresa');

  insert into public.orgs (name) values (org_label) returning id into new_org_id;
  insert into public.members (org_id, user_id, role) values (new_org_id, new.id, 'owner');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
