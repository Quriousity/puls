-- ============================================================
-- 002_runs : 러닝 기록 테이블
-- 실행 위치: Supabase 대시보드 > SQL Editor 에 붙여넣고 Run
-- ------------------------------------------------------------
-- 설계 메모
--  - 러닝 1회 = 1행. 거리(km)·소요시간(초)만 저장하는 단순 평면 구조.
--  - distance_km 는 double precision (numeric 은 supabase-js 가 문자열로 줘서 계산 불편)
--  - user_id 는 본인 자동(default auth.uid()), RLS 로 본인 것만 접근. workouts 와 동일 패턴.
-- ============================================================

create table if not exists public.runs (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null default auth.uid()
                                references auth.users (id) on delete cascade,
  performed_on      date        not null default current_date,
  distance_km       double precision not null default 0,
  duration_seconds  integer     not null default 0,
  created_at        timestamptz not null default now()
);

create index if not exists runs_user_perf_idx
  on public.runs (user_id, performed_on desc);

-- ------------------------------------------------------------
-- RLS: 본인 행만 CRUD
-- ------------------------------------------------------------
alter table public.runs enable row level security;

create policy "runs_select_own"
  on public.runs for select
  using (auth.uid() = user_id);

create policy "runs_insert_own"
  on public.runs for insert
  with check (auth.uid() = user_id);

create policy "runs_update_own"
  on public.runs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "runs_delete_own"
  on public.runs for delete
  using (auth.uid() = user_id);
