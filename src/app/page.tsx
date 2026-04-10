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
import { createClient } from "@/lib/supabase";

import Dashboard from "@/components/Dashboard";
import Weight from "@/components/Weight";
import Running from "@/components/Running";
import History from "@/components/History";
import Settings from "@/components/Settings";

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
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
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
        className={`flex-shrink-0 flex flex-col bg-surface-raised transition-all duration-200 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center ${collapsed ? "justify-center" : "px-3 justify-between"}`}>
          {!collapsed && (
            <span className="text-base font-bold tracking-widest text-fg dark:text-zinc-100 truncate">
              PULS
            </span>
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
                onClick={() => setActiveIndex(i)}
                title={collapsed ? label : undefined}
                className={`${btnBase} ${i === activeIndex ? btnActive : btnIdle}`}
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
              onClick={() => setActiveIndex(4)}
              title={collapsed ? "설정" : undefined}
              className={`${btnBase} ${activeIndex === 4 ? btnActive : btnIdle}`}
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
        {/* Content */}
        <main className="flex-1 overflow-auto">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
}
