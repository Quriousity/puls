-- ============================================================
-- 001_workouts : 웨이트 "오늘 운동" 기록 테이블
-- 실행 위치: Supabase 대시보드 > SQL Editor 에 붙여넣고 Run
-- ------------------------------------------------------------
-- 설계 메모
--  - 오늘 운동 한 번 = 한 행(row). 운동들/세트/시간기록을 exercises(jsonb)에 통째로 저장.
--    (정규화 대신 스냅샷 방식 — MVP 단계라 단순함 우선. 통계 본격화 시 분리 고려)
--  - user_id 는 로그인한 본인으로 자동 채움(default auth.uid()), RLS 로 본인 것만 접근.
-- ============================================================

create table if not exists public.workouts (
  id            uuid        primary key default gen_random_uuid(),
  -- 로그인 사용자. 삭제되면 기록도 함께 삭제. insert 시 생략하면 현재 사용자로 자동 채움
  user_id       uuid        not null default auth.uid()
                            references auth.users (id) on delete cascade,
  -- 운동한 날짜 (기본: 오늘)
  performed_on  date        not null default current_date,
  -- 메모 토글로 입력한 텍스트 (없으면 null)
  memo          text,
  -- 운동 배열 스냅샷: [{ name, start?, end?, sets: [{ weight, reps, start?, end? }] }]
  exercises     jsonb       not null default '[]'::jsonb,
  created_at    timestamptz not null default now()
);

-- 본인 기록을 최신순/날짜순으로 빠르게 조회하기 위한 인덱스
create index if not exists workouts_user_perf_idx
  on public.workouts (user_id, performed_on desc);

-- ------------------------------------------------------------
-- RLS: 반드시 켜고, 본인 행만 CRUD 가능하도록 정책 4개
-- ------------------------------------------------------------
alter table public.workouts enable row level security;

create policy "workouts_select_own"
  on public.workouts for select
  using (auth.uid() = user_id);

create policy "workouts_insert_own"
  on public.workouts for insert
  with check (auth.uid() = user_id);

create policy "workouts_update_own"
  on public.workouts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "workouts_delete_own"
  on public.workouts for delete
  using (auth.uid() = user_id);
