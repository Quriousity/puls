"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Gear,
  Sun,
  CalendarBlank,
  Calendar,
  CalendarCheck,
  ChartBar,
  ChartLine,
  ChatCircle,
  Sparkle,
  HandCoins,
  Flask,
  Info,
  X,
} from "@phosphor-icons/react";
import DailyReport from "@/components/DailyReport";

const reports = [
  { icon: Sun, label: "일일리포트" },
  { icon: CalendarBlank, label: "주간리포트" },
  { icon: Calendar, label: "월간리포트" },
  { icon: CalendarCheck, label: "연간리포트" },
  { icon: ChartBar, label: "전체리포트" },
];

const aiTools = [
  { icon: ChartLine, label: "AI분석" },
  { icon: ChatCircle, label: "AI상담" },
  { icon: Sparkle, label: "AI추천" },
];

// 더미 — 연구용 데이터 수집 공고
const researchCalls = [
  { org: "서울대학교 스포츠과학연구소", title: "주 3회 이상 러닝 기록 (6개월)", reward: "50,000 크레딧", deadline: "D-12" },
  { org: "세브란스병원 재활의학과", title: "무릎 부상 후 웨이트 재활 데이터", reward: "80,000 크레딧", deadline: "D-5" },
  { org: "KAIST 헬스데이터랩", title: "체중 변화 · 운동 빈도 1년치", reward: "30,000 크레딧", deadline: "상시" },
];

// 설정 모달에서 켜고/끌 수 있는 항목들 (key 로 visible 상태 관리)
const SETTINGS_GROUPS = [
  { title: "리포트", items: reports.map(r => ({ key: r.label, label: r.label })) },
  { title: "AI", items: aiTools.map(a => ({ key: a.label, label: a.label })) },
  {
    title: "데이터",
    items: [
      { key: "data-sell", label: "내 데이터 골라서 판매하기" },
      { key: "data-research", label: "연구용 데이터 수집 계획 제출하기" },
      { key: "research-calls", label: "연구용 데이터 수집 공고" },
    ],
  },
];

const STORAGE_KEY = "puls.dashboard.visible";
const DEFAULT_VISIBLE: Record<string, boolean> = Object.fromEntries(
  SETTINGS_GROUPS.flatMap(g => g.items.map(it => [it.key, true]))
);

// 아직 동작 안 하는(더미) 요소 표시용 배지
function DummyTag() {
  return (
    <span className="ml-auto flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-surface-overlay text-fg-subtle">
      dummy
    </span>
  );
}

// 토글 스위치
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onChange}
      className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${
        on ? "bg-orange-500/70" : "bg-surface-overlay border border-border"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-4" : ""
        }`}
      />
    </button>
  );
}

export default function Dashboard() {
  const [showDaily, setShowDaily] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // localStorage 에서 초기 로드 (이 화면은 인증 전 SSR 렌더가 없어 lazy init 으로 안전)
  const [visible, setVisible] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return DEFAULT_VISIBLE;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULT_VISIBLE, ...JSON.parse(raw) };
    } catch {
      /* 무시 */
    }
    return DEFAULT_VISIBLE;
  });

  function toggle(key: string) {
    setVisible(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* 무시 */
      }
      return next;
    });
  }

  if (showDaily) return <DailyReport onBack={() => setShowDaily(false)} />;

  const visibleReports = reports.filter(r => visible[r.label]);
  const visibleAi = aiTools.filter(a => visible[a.label]);
  const showDataSection = visible["data-sell"] || visible["data-research"] || visible["research-calls"];

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-fg">대시보드</h2>
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-1.5 rounded-lg text-fg-subtle hover:text-fg hover:bg-surface-overlay transition-colors"
          aria-label="설정"
        >
          <Gear size={18} />
        </button>
      </div>

      {/* 리포트 */}
      {visibleReports.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-semibold text-fg-subtle uppercase tracking-wider">리포트</span>
          <div className="grid grid-cols-2 gap-2">
            {visibleReports.map(({ icon: Icon, label }) => (
              <button
                key={label}
                onClick={label === "일일리포트" ? () => setShowDaily(true) : undefined}
                className="flex items-center gap-2.5 rounded-xl bg-surface-raised border border-border px-4 py-3.5 text-sm font-medium text-fg hover:bg-surface-overlay transition-colors"
              >
                <Icon size={20} className="flex-shrink-0 text-fg-muted" />
                {label}
                {label !== "일일리포트" && <DummyTag />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI */}
      {visibleAi.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-semibold text-fg-subtle uppercase tracking-wider">AI</span>
          <div className="grid grid-cols-2 gap-2">
            {visibleAi.map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="flex items-center gap-2.5 rounded-xl bg-surface-raised border border-border px-4 py-3.5 text-sm font-medium text-fg hover:bg-surface-overlay transition-colors"
              >
                <Icon size={20} className="flex-shrink-0 text-orange-400" />
                {label}
                <DummyTag />
              </button>
            ))}
          </div>

          {/* 크레딧 안내 */}
          <div className="flex gap-2.5 rounded-xl bg-orange-500/5 border border-orange-500/20 px-4 py-3">
            <Info size={16} weight="fill" className="flex-shrink-0 mt-0.5 text-orange-400" />
            <p className="text-xs leading-relaxed text-fg-muted">
              AI 기능은 <span className="text-fg font-medium">크레딧</span>으로 결제하고 사용한 만큼 차감돼요.
              크레딧은 현금과 <span className="text-fg font-medium">1:1 동일 가격</span>이며,
              실제 API 사용 비용의 <span className="text-fg font-medium">약 1.1~1.2배</span>가 소모됩니다.
              소모 내역은 회원이 직접 확인할 수 있어요.
            </p>
          </div>
        </div>
      )}

      {/* 데이터 */}
      {showDataSection && (
        <div className="space-y-3">
          <span className="text-xs font-semibold text-fg-subtle uppercase tracking-wider">데이터</span>
          <div className="space-y-2">
            {visible["data-sell"] && (
              <button className="w-full flex items-center gap-2.5 rounded-xl bg-surface-raised border border-border px-4 py-3.5 text-sm font-medium text-fg hover:bg-surface-overlay transition-colors">
                <HandCoins size={20} className="flex-shrink-0 text-emerald-500" />
                내 데이터 골라서 판매하기
                <DummyTag />
              </button>
            )}
            {visible["data-research"] && (
              <button className="w-full flex items-center gap-2.5 rounded-xl bg-surface-raised border border-border px-4 py-3.5 text-sm font-medium text-fg hover:bg-surface-overlay transition-colors">
                <Flask size={20} className="flex-shrink-0 text-sky-500" />
                연구용 데이터 수집 계획 제출하기
                <DummyTag />
              </button>
            )}
          </div>

          {/* 연구용 데이터 수집 공고 */}
          {visible["research-calls"] && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-fg-subtle">연구용 데이터 수집 공고</span>
                <DummyTag />
              </div>
              {researchCalls.map(({ org, title, reward, deadline }) => (
                <button
                  key={title}
                  className="w-full text-left rounded-xl bg-surface-raised border border-border px-4 py-3 hover:bg-surface-overlay transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-fg truncate">{title}</p>
                    <span
                      className={`flex-shrink-0 text-[11px] font-medium px-1.5 py-0.5 rounded-md ${
                        deadline.startsWith("D-")
                          ? "bg-orange-500/15 text-orange-400"
                          : "bg-surface-overlay text-fg-subtle"
                      }`}
                    >
                      {deadline}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 mt-1">
                    <span className="text-xs text-fg-subtle truncate">{org}</span>
                    <span className="flex-shrink-0 text-xs font-semibold text-emerald-500">{reward}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 설정 모달 — 항목 추가/제거 */}
      {settingsOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm max-h-[80vh] overflow-y-auto rounded-2xl bg-surface-raised border border-border p-5 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-fg">대시보드 항목</p>
              <button
                onClick={() => setSettingsOpen(false)}
                className="p-1 rounded-lg text-fg-muted hover:text-fg hover:bg-surface-overlay transition-colors"
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>

            {SETTINGS_GROUPS.map(group => (
              <div key={group.title} className="space-y-1">
                <p className="text-xs font-semibold text-fg-subtle uppercase tracking-wider">{group.title}</p>
                {group.items.map(item => (
                  <div key={item.key} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-fg-muted pr-3">{item.label}</span>
                    <Toggle on={!!visible[item.key]} onChange={() => toggle(item.key)} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
