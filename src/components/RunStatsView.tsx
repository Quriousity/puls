// 러닝 통계 표시(거리 · 시간 · 페이스) — 달릴 때 화면과 기록 상세가 공용으로 사용.
// time/pace 는 이미 포맷된 문자열을 받음 (라이브는 센티초까지, 저장 기록은 mm:ss).
export default function RunStatsView({
  distance,
  time,
  pace,
}: {
  distance: number;
  time: string;
  pace: string;
}) {
  return (
    <>
      {/* 거리 */}
      <div className="text-center">
        <p className="text-8xl md:text-7xl font-bold text-fg tabular-nums">
          {distance.toFixed(2)}
        </p>
        <p className="text-fg-muted mt-1">km</p>
      </div>

      {/* 시간 + 페이스 */}
      <div className="flex justify-between items-center px-2">
        <div>
          <p className="text-xs text-fg-subtle mb-0.5">시간</p>
          <p className="text-2xl font-mono font-semibold text-fg tabular-nums">{time}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-fg-subtle mb-0.5">페이스</p>
          <p className="text-2xl font-semibold text-fg">
            {pace}
            <span className="text-sm text-fg-muted ml-1">/km</span>
          </p>
        </div>
      </div>
    </>
  );
}
