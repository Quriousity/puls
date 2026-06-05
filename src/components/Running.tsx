"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Pause, Play, Stop, Trash, MapPin } from "@phosphor-icons/react";
import HeroCarousel, { unsplash, type HeroItem } from "@/components/HeroCarousel";
import { supabase } from "@/lib/supabase";

// 광고용 hero (러닝)
const heroes: HeroItem[] = [
  { img: unsplash("1542291026-7eec264c27ff"), title: "더 가볍게, 더 멀리", sub: "프리미엄 러닝화" },
  { img: unsplash("1486218119243-13883505764c"), title: "달리기 좋은 날", sub: "기능성 러닝 의류" },
  { img: unsplash("1434494878577-86c23bcb06b9"), title: "기록을 손목 위에", sub: "러닝 워치 · 기타용품" },
];

type Run = {
  id: string;
  distance_km: number;
  duration_seconds: number;
  performed_on: string;
  created_at: string;
};

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function formatPace(distanceKm: number, totalSeconds: number): string {
  if (distanceKm < 0.01) return "--'--\"";
  const paceSec = totalSeconds / distanceKm;
  const m = Math.floor(paceSec / 60);
  const s = Math.round(paceSec % 60);
  return `${m}'${String(s).padStart(2, "0")}"`;
}

function formatDuration(totalCentiseconds: number): string {
  const m = Math.floor(totalCentiseconds / 6000);
  const s = Math.floor((totalCentiseconds % 6000) / 100);
  const cs = totalCentiseconds % 100;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

// 총 초 → mm:ss (저장된 기록 표시용)
function formatDurationSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

type GpsStatus = "idle" | "acquiring" | "ready" | "denied" | "unavailable";
type TimerState = "idle" | "running" | "paused";

export default function Running() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("idle");
  const [countdown, setCountdown] = useState<number | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastPosRef = useRef<GeolocationCoordinates | null>(null);
  const timerStateRef = useRef<TimerState>("idle");

  function stopAll() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (countdownRef.current) clearTimeout(countdownRef.current);
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
  }

  useEffect(() => {
    return () => stopAll();
  }, []);

  // 저장된 러닝 기록 로드 (RLS 로 본인 것만)
  useEffect(() => {
    supabase
      .from("runs")
      .select("id, distance_km, duration_seconds, performed_on, created_at")
      .order("performed_on", { ascending: false })
      .then(({ data }) => {
        if (data) setRuns(data as Run[]);
      });
  }, []);

  // 카운트다운/러닝 중엔 모바일 탭바·헤더 숨김 (전체화면 몰입). 언마운트 시 해제.
  useEffect(() => {
    const immersive = timerState !== "idle" || countdown !== null;
    document.body.classList.toggle("run-active", immersive);
    return () => document.body.classList.remove("run-active");
  }, [timerState, countdown]);

  useEffect(() => {
    timerStateRef.current = timerState;
  }, [timerState]);

  // Run 누르면 3·2·1 카운트다운 후 실제 start()
  function beginCountdown() {
    if (!navigator.geolocation) {
      setGpsStatus("unavailable");
      return;
    }
    let n = 3;
    setCountdown(n);
    const tick = () => {
      n -= 1;
      if (n <= 0) {
        setCountdown(null);
        start();
      } else {
        setCountdown(n);
        countdownRef.current = setTimeout(tick, 1000);
      }
    };
    countdownRef.current = setTimeout(tick, 1000);
  }

  function start() {
    if (!navigator.geolocation) {
      setGpsStatus("unavailable");
      return;
    }
    setGpsStatus("acquiring");
    setElapsed(0);
    setDistance(0);
    lastPosRef.current = null;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (gpsStatus !== "ready") setGpsStatus("ready");

        if (timerStateRef.current === "paused") {
          // 일시정지 중엔 위치만 갱신, 거리 미적산
          lastPosRef.current = pos.coords;
          return;
        }

        if (pos.coords.accuracy > 25) return; // 정확도 낮으면 스킵

        if (lastPosRef.current) {
          const delta = haversine(
            lastPosRef.current.latitude,
            lastPosRef.current.longitude,
            pos.coords.latitude,
            pos.coords.longitude,
          );
          if (delta > 0.003) { // 3m 미만 노이즈 무시
            setDistance(d => d + delta);
          }
        }
        lastPosRef.current = pos.coords;
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setGpsStatus("denied");
      },
      { enableHighAccuracy: true, maximumAge: 0 },
    );

    setTimerState("running");
    intervalRef.current = setInterval(() => setElapsed(e => e + 1), 10);
  }

  function togglePause() {
    if (timerState === "running") {
      setTimerState("paused");
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      setTimerState("running");
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 10);
    }
  }

  async function stop() {
    stopAll();

    // 리셋 전에 값 캡처
    const distKm = distance;
    const durationSeconds = Math.floor(elapsed / 100); // 센티초 → 초
    const hadRun = elapsed > 0;

    // UI는 즉시 초기화
    setTimerState("idle");
    setElapsed(0);
    setDistance(0);
    setGpsStatus("idle");
    lastPosRef.current = null;

    if (!hadRun) return;

    // performed_on 은 로컬 날짜로 명시 (DB 기본값 current_date 는 UTC)
    const d = new Date();
    const performedOn = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const { data, error } = await supabase
      .from("runs")
      .insert({ performed_on: performedOn, distance_km: distKm, duration_seconds: durationSeconds })
      .select("id, distance_km, duration_seconds, performed_on, created_at")
      .single();
    if (!error && data) setRuns(prev => [data as Run, ...prev]);
  }

  async function deleteRun(id: string) {
    const { error } = await supabase.from("runs").delete().eq("id", id);
    if (!error) setRuns(prev => prev.filter(r => r.id !== id));
  }

  const isActive = timerState !== "idle";

  return (
    <div className="max-w-lg mx-auto px-6 py-8 space-y-6">

      {/* 3·2·1 카운트다운 — body 로 포털해서 viewport 전체를 확실히 덮음 */}
      {countdown !== null && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <span
            key={countdown}
            className="animate-count-pop text-[12rem] leading-none font-black italic text-orange-400 tabular-nums drop-shadow-[0_0_40px_rgba(249,115,22,0.55)]"
          >
            {countdown}
          </span>
        </div>,
        document.body,
      )}

      {/* 운동할 곳 찾기 — 카카오맵 공원 검색을 새창으로 */}
      <a
        href="https://map.kakao.com/?q=공원"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 transition-colors text-sm font-medium"
      >
        <MapPin size={16} weight="fill" />
        운동할 곳 찾기
      </a>

      {/* 광고 Hero (캐러셀) */}
      <HeroCarousel items={heroes} />

      {isActive ? (
        // 모바일: 전체화면으로 꽉 차게 (정지 및 저장 전까지) / 데스크탑: 기존 카드
        <div className="fixed inset-0 z-50 flex flex-col justify-center gap-6 bg-surface p-6 overflow-auto md:static md:z-auto md:justify-start md:rounded-xl md:border md:border-border md:p-6">

          {/* GPS 상태 */}
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${
              gpsStatus === "ready" ? "bg-emerald-500 animate-pulse" :
              gpsStatus === "acquiring" ? "bg-yellow-500 animate-pulse" :
              "bg-red-500"
            }`} />
            <span className="text-xs text-fg-subtle">
              {gpsStatus === "ready" ? "GPS 연결됨" :
               gpsStatus === "acquiring" ? "GPS 신호 잡는 중..." :
               "GPS 오류"}
            </span>
          </div>

          {/* 거리 */}
          <div className="text-center">
            <p className="text-8xl md:text-7xl font-bold text-fg tabular-nums">
              {distance.toFixed(2)}
            </p>
            <p className="text-fg-muted mt-1">km</p>
          </div>

          {/* 타이머 + 페이스 */}
          <div className="flex justify-between items-center px-2">
            <div>
              <p className="text-xs text-fg-subtle mb-0.5">시간</p>
              <p className="text-2xl font-mono font-semibold text-fg tabular-nums">
                {formatDuration(elapsed)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-fg-subtle mb-0.5">페이스</p>
              <p className="text-2xl font-semibold text-fg">
                {formatPace(distance, elapsed / 100)}
                <span className="text-sm text-fg-muted ml-1">/km</span>
              </p>
            </div>
          </div>

          {/* 컨트롤 */}
          <div className="flex gap-2">
            <button
              onClick={togglePause}
              className="flex-1 py-3 rounded-xl bg-surface-overlay hover:bg-surface-raised border border-border text-fg transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              {timerState === "running"
                ? <><Pause size={16} weight="fill" /> 일시정지</>
                : <><Play size={16} weight="fill" /> 재개</>
              }
            </button>
            <button
              onClick={stop}
              className="flex-1 py-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <Stop size={16} weight="fill" />
              정지 및 저장
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* GPS 에러 메시지 */}
          {(gpsStatus === "denied" || gpsStatus === "unavailable") && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {gpsStatus === "denied"
                ? "위치 권한이 거부되었습니다. 브라우저 설정에서 허용해주세요."
                : "이 기기에서는 위치 서비스를 사용할 수 없습니다."}
            </div>
          )}

          <button
            onClick={beginCountdown}
            className="w-full py-4 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 transition-colors text-base font-semibold"
          >
            Run
          </button>
        </>
      )}

      {/* 최근 기록 */}
      {runs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-fg-subtle uppercase tracking-widest px-1">최근 기록</p>
          {runs.map(run => (
            <div key={run.id} className="rounded-xl bg-surface-raised border border-border px-4 py-3 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-fg">{run.distance_km.toFixed(2)} km</p>
                <div className="flex items-center gap-3 text-xs text-fg-muted">
                  <span>{formatDurationSeconds(run.duration_seconds)}</span>
                  <span>{formatPace(run.distance_km, run.duration_seconds)} /km</span>
                  <span>{new Date(run.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}</span>
                </div>
              </div>
              <button
                onClick={() => deleteRun(run.id)}
                className="text-fg-subtle hover:text-red-400 transition-colors flex-shrink-0"
              >
                <Trash size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
