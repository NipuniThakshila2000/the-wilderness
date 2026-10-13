-- Allowlist for Mighty Networks members.
create table if not exists members_allowlist (
  email text primary key,
  active boolean not null default true,
  added_at timestamptz default now()
);
alter table members_allowlist enable row level security;

-- Practice sessions.
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'deposition',
  case_file jsonb,
  charges jsonb,
  current_charge int not null default 0,
  ground_given int not null default 0,
  score jsonb,
  created_at timestamptz default now(),
  constraint sessions_status_check check (
    status in ('deposition', 'casefile', 'selecting', 'trial', 'testify', 'verdict', 'adjourned', 'stopped')
  )
);

-- Transcripts / messages.
create table if not exists messages (
  id bigserial primary key,
  session_id uuid not null references sessions(id) on delete cascade,
  speaker text not null,
  content text not null,
  created_at timestamptz default now(),
  constraint messages_speaker_check check (speaker in ('user', 'clerk', 'court', 'accusations'))
);

alter table sessions enable row level security;
alter table messages enable row level security;

drop policy if exists "own sessions" on sessions;
create policy "own sessions"
on sessions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "own messages" on messages;
create policy "own messages"
on messages
for all
using (
  exists (
    select 1
    from sessions s
    where s.id = session_id
      and s.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from sessions s
    where s.id = session_id
      and s.user_id = auth.uid()
  )
);
