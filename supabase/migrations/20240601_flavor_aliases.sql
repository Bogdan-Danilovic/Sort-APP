-- ============================================================
-- MergeKit — flavor_aliases tabela
-- Globalni aliases: svi korisnici dijele iste ukuse.
-- Vercel ima read-only filesystem, pa se korisnički dodaci
-- čuvaju ovdje umjesto u flavorAliases.json.
-- ============================================================

create table if not exists flavor_aliases (
  id         uuid        primary key default gen_random_uuid(),
  canonical  text        not null,
  aliases    text[]      not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indeks za brzo pretraživanje po canonical nazivu
create unique index if not exists flavor_aliases_canonical_idx
  on flavor_aliases (lower(canonical));

-- Automatski update updated_at pri izmjeni
create or replace function flavor_aliases_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists flavor_aliases_updated_at on flavor_aliases;
create trigger flavor_aliases_updated_at
  before update on flavor_aliases
  for each row execute procedure flavor_aliases_set_updated_at();

-- RLS: globalna tabela — svi mogu čitati i pisati (bez auth)
alter table flavor_aliases enable row level security;

drop policy if exists "Anyone can read flavor aliases" on flavor_aliases;
create policy "Anyone can read flavor aliases"
  on flavor_aliases for select using (true);

drop policy if exists "Anyone can insert flavor aliases" on flavor_aliases;
create policy "Anyone can insert flavor aliases"
  on flavor_aliases for insert with check (true);

drop policy if exists "Anyone can update flavor aliases" on flavor_aliases;
create policy "Anyone can update flavor aliases"
  on flavor_aliases for update using (true);
