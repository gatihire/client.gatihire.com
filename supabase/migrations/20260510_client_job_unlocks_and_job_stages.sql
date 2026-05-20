-- Client app: job-scoped unlocks + per-job pipeline stages

-- 1) Track unlocks scoped to a job (used by Job Dashboard "Unlocked Profiles" tab)
create table if not exists public.client_job_unlocked_candidates (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  source text not null default 'suggested',
  unlocked_at timestamptz not null default now(),
  unique (client_id, job_id, candidate_id)
);

-- 2) Per-job stage definitions (default + custom)
create table if not exists public.job_pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  slug text not null,
  name text not null,
  position int not null default 0,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (client_id, job_id, slug)
);

-- 3) Helpful index for stage lookups
create index if not exists job_pipeline_stages_job_pos_idx on public.job_pipeline_stages (job_id, position);

-- 4) RLS (API uses service role server-side, but keep defense-in-depth)
alter table public.client_job_unlocked_candidates enable row level security;
alter table public.job_pipeline_stages enable row level security;

