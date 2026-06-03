"use client";

import { useEffect, useState } from "react";
import {
  Barbell,
  Sneaker,
  ChartLine,
  Calendar,
  Gear,
  User,
  Sun,
  Moon,
  SidebarSimple,
  SignOut,
} from "@phosphor-icons/react";

import Dashboard from "@/components/Dashboard";
import Weight from "@/components/Weight";
import Running from "@/components/Running";
import History from "@/components/History";
import Settings from "@/components/Settings";
import Game2048 from "@/components/Game2048";

const mainNavItems = [
  { icon: ChartLine, label: "대시보드", component: Dashboard },
  { icon: Barbell,   label: "웨이트",   component: Weight },
  { icon: Sneaker,   label: "러닝",     component: Running },
  { icon: Calendar,  label: "기록",     component: History },
];

const settingsItem = { icon: Gear, label: "설정", component: Settings };

const navItems = [...mainNavItems, settingsItem];

const btnActive = "bg-surface-overlay text-fg dark:text-zinc-100";
const btnIdle   = "text-fg-muted dark:text-zinc-400 hover:text-fg-muted hover:bg-surface-overlay/60";

// 파비콘의 펄스 라인 (배경 원 없이, 텍스트 색을 따라감)
function PulseMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className="flex-shrink-0" aria-hidden>
      <polyline
        points="2,17 8,17 10,14 12,17 13,20 16,4 18,22 20,17 22,13 25,17 30,17"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Divider({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="my-2 flex justify-center">
      <div className={`border-t border-border ${collapsed ? "w-6" : "w-full mx-3"}`} />
    </div>
  );
}

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showGame, setShowGame] = useState(false);

  function openGame() {
    setShowGame(true);
    setMenuOpen(false);
  }

  function selectNav(i: number) {
    setActiveIndex(i);
    setShowGame(false);
  }

  function signOut() {
    window.location.href = "/auth";
  }

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    function handleResize() {
      setCollapsed(window.innerWidth < 1100);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  const ActiveComponent = navItems[activeIndex].component;

  const btnBase = `w-full flex items-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
    collapsed ? "justify-center px-0" : "gap-3 px-2.5"
  }`;

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside
        className={`hidden md:flex flex-shrink-0 flex-col bg-surface-raised transition-all duration-200 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center ${collapsed ? "justify-center" : "px-3 justify-between"}`}>
          {!collapsed && (
            <button
              onClick={openGame}
              title="2048 게임"
              className="flex items-center gap-2 text-base font-bold tracking-widest text-fg dark:text-zinc-100 truncate hover:text-orange-400 transition-colors"
            >
              <PulseMark size={20} />
              PULS
            </button>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex-shrink-0 p-1.5 rounded-md text-fg-muted dark:text-zinc-400 hover:text-fg hover:bg-surface-overlay transition-colors"
            aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
          >
            <SidebarSimple size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col py-4 px-2">

          {/* 메인 메뉴 */}
          <div className="space-y-1">
            {mainNavItems.map(({ icon: Icon, label }, i) => (
              <button
                key={label}
                onClick={() => selectNav(i)}
                title={collapsed ? label : undefined}
                className={`${btnBase} ${!showGame && i === activeIndex ? btnActive : btnIdle}`}
              >
                <Icon size={20} weight={i === activeIndex ? "fill" : "regular"} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </button>
            ))}
          </div>

          {/* 하단 메뉴 */}
          <div className="mt-auto space-y-1">
            <Divider collapsed={collapsed} />

            {/* 테마 전환 */}
            <button
              onClick={toggleTheme}
              title={collapsed ? (isDark ? "라이트 모드" : "다크 모드") : undefined}
              className={`${btnBase} ${btnIdle}`}
            >
              {isDark
                ? <Sun size={20} className="flex-shrink-0" />
                : <Moon size={20} className="flex-shrink-0" />}
              {!collapsed && (
                <span className="truncate">{isDark ? "라이트 모드" : "다크 모드"}</span>
              )}
            </button>

            {/* 프로필 */}
            {/* <button
              title={collapsed ? "프로필" : undefined}
              className={`${btnBase} ${btnIdle}`}
            >
              <User size={20} weight="fill" className="flex-shrink-0" />
              {!collapsed && <span className="truncate">프로필</span>}
            </button> */}

            {/* 설정 */}
            <button
              onClick={() => selectNav(4)}
              title={collapsed ? "설정" : undefined}
              className={`${btnBase} ${!showGame && activeIndex === 4 ? btnActive : btnIdle}`}
            >
              <Gear size={20} weight={activeIndex === 4 ? "fill" : "regular"} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">설정</span>}
            </button>

            {/* 로그아웃 */}
            <button
              onClick={signOut}
              title={collapsed ? "로그아웃" : undefined}
              className={`${btnBase} ${btnIdle}`}
            >
              <SignOut size={20} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">로그아웃</span>}
            </button>
          </div>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden relative flex-shrink-0 h-14 flex items-center justify-between px-4 border-b border-border bg-surface-raised">
          <button
            onClick={openGame}
            className="flex items-center gap-2 text-base font-bold tracking-widest text-fg dark:text-zinc-100 hover:text-orange-400 transition-colors"
          >
            <PulseMark size={20} />
            PULS
          </button>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="p-1.5 rounded-md text-fg-muted dark:text-zinc-400 hover:text-fg hover:bg-surface-overlay transition-colors"
            aria-label="메뉴"
          >
            <User size={22} weight="fill" />
          </button>

          {/* User Menu */}
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-3 top-full mt-1 w-44 bg-surface-overlay border border-border rounded-xl shadow-lg z-50 py-1">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-fg-muted hover:text-fg hover:bg-surface-raised transition-colors"
                >
                  <User size={18} weight="fill" className="flex-shrink-0" />
                  프로필
                </button>
                <button
                  onClick={() => { toggleTheme(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-fg-muted hover:text-fg hover:bg-surface-raised transition-colors"
                >
                  {isDark
                    ? <Sun size={18} className="flex-shrink-0" />
                    : <Moon size={18} className="flex-shrink-0" />}
                  {isDark ? "라이트 모드" : "다크 모드"}
                </button>
                <button
                  onClick={() => { selectNav(4); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-fg-muted hover:text-fg hover:bg-surface-raised transition-colors"
                >
                  <Gear size={18} className="flex-shrink-0" />
                  설정
                </button>
                <button
                  onClick={() => { setMenuOpen(false); signOut(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-fg-muted hover:text-fg hover:bg-surface-raised transition-colors"
                >
                  <SignOut size={18} className="flex-shrink-0" />
                  로그아웃
                </button>
              </div>
            </>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {showGame ? <Game2048 onExit={() => setShowGame(false)} /> : <ActiveComponent />}
        </main>

        {/* Mobile Bottom Tab Bar */}
        <nav className="md:hidden flex-shrink-0 flex border-t border-border bg-surface-raised">
          {mainNavItems.map(({ icon: Icon, label }, i) => (
            <button
              key={label}
              onClick={() => selectNav(i)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
                !showGame && i === activeIndex ? "text-fg dark:text-zinc-100" : "text-fg-muted dark:text-zinc-400"
              }`}
            >
              <Icon size={22} weight={i === activeIndex ? "fill" : "regular"} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
