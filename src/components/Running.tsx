"use client";

import { useState, useEffect, useRef } from "react";
import { Pause, Play, Stop, Trash } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase";

type Run = {
  id: string;
  date: string;
  distance: number;
  minutes: number;
  seconds: number;
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

function formatDurationFromMinSec(minutes: number, seconds: number): string {
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

type GpsStatus = "idle" | "acquiring" | "ready" | "denied" | "unavailable";
type TimerState = "idle" | "running" | "paused";

export default function Running() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("idle");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastPosRef = useRef<GeolocationCoordinates | null>(null);
  const timerStateRef = useRef<TimerState>("idle");
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("runs")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setRuns(data.map(r => ({ ...r, date: r.created_at })));
    }
    load();
    return () => stopAll();
  }, []);

  useEffect(() => {
    timerStateRef.current = timerState;
  }, [timerState]);

  function stopAll() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
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

    if (elapsed > 0) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("runs")
          .insert({
            user_id: user.id,
            distance,
            minutes: Math.floor(elapsed / 6000),
            seconds: Math.floor((elapsed % 6000) / 100),
          })
          .select()
          .single();
        if (data) setRuns(prev => [{ ...data, date: data.created_at }, ...prev]);
      }
    }

    setTimerState("idle");
    setElapsed(0);
    setDistance(0);
    setGpsStatus("idle");
    lastPosRef.current = null;
  }

  async function deleteRun(id: string) {
    await supabase.from("runs").delete().eq("id", id);
    setRuns(prev => prev.filter(r => r.id !== id));
  }

  const isActive = timerState !== "idle";

  return (
    <div className="max-w-lg mx-auto px-6 py-8 space-y-6">

      {isActive ? (
        <div className="rounded-xl bg-surface border border-border p-6 space-y-6">

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
            <p className="text-7xl font-bold text-fg tabular-nums">
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
            onClick={start}
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
                <p className="text-lg font-bold text-fg">{run.distance.toFixed(2)} km</p>
                <div className="flex items-center gap-3 text-xs text-fg-muted">
                  <span>{formatDurationFromMinSec(run.minutes, run.seconds)}</span>
                  <span>{formatPace(run.distance, run.minutes * 60 + run.seconds)} /km</span>
                  <span>{new Date(run.date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}</span>
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
