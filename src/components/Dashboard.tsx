"use client";

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
} from "@phosphor-icons/react";

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

export default function Dashboard() {
  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-fg">대시보드</h2>
        <button
          className="p-1.5 rounded-lg text-fg-subtle hover:text-fg hover:bg-surface-overlay transition-colors"
          aria-label="설정"
        >
          <Gear size={18} />
        </button>
      </div>

      {/* 리포트 */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-fg-subtle uppercase tracking-wider">리포트</span>
        <div className="grid grid-cols-2 gap-2">
          {reports.map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex items-center gap-2.5 rounded-xl bg-surface-raised border border-border px-4 py-3.5 text-sm font-medium text-fg hover:bg-surface-overlay transition-colors"
            >
              <Icon size={20} className="flex-shrink-0 text-fg-muted" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* AI */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-fg-subtle uppercase tracking-wider">AI</span>
        <div className="grid grid-cols-2 gap-2">
          {aiTools.map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex items-center gap-2.5 rounded-xl bg-surface-raised border border-border px-4 py-3.5 text-sm font-medium text-fg hover:bg-surface-overlay transition-colors"
            >
              <Icon size={20} className="flex-shrink-0 text-orange-400" />
              {label}
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

      {/* 데이터 */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-fg-subtle uppercase tracking-wider">데이터</span>
        <div className="space-y-2">
          <button className="w-full flex items-center gap-2.5 rounded-xl bg-surface-raised border border-border px-4 py-3.5 text-sm font-medium text-fg hover:bg-surface-overlay transition-colors">
            <HandCoins size={20} className="flex-shrink-0 text-emerald-500" />
            내 데이터 골라서 판매하기
          </button>
          <button className="w-full flex items-center gap-2.5 rounded-xl bg-surface-raised border border-border px-4 py-3.5 text-sm font-medium text-fg hover:bg-surface-overlay transition-colors">
            <Flask size={20} className="flex-shrink-0 text-sky-500" />
            연구용 데이터 수집 계획 제출하기
          </button>
        </div>

        {/* 연구용 데이터 수집 공고 */}
        <div className="space-y-2 pt-1">
          <span className="text-xs text-fg-subtle">연구용 데이터 수집 공고</span>
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
      </div>
    </div>
  );
}
