"use client";

import { useState } from "react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin() {
    window.location.href = "/";
  }

  return (
    <div className="min-h-full flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 bg-surface border border-border rounded-2xl p-8">

        <div className="flex flex-col items-center gap-3">
          <svg width="52" height="52" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <polyline
              points="2,17 8,17 10,14 12,17 13,20 16,4 18,22 20,17 22,13 25,17 30,17"
              fill="none"
              stroke="#f97316"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h1 className="text-2xl font-bold text-fg text-center tracking-widest">PULS</h1>
        </div>

        {/* 이메일/패스워드 */}
        <div className="space-y-3">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 text-sm text-fg placeholder:text-fg-subtle outline-none focus:ring-1 focus:ring-border"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 text-sm text-fg placeholder:text-fg-subtle outline-none focus:ring-1 focus:ring-border"
          />

          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 transition-colors text-sm font-medium"
          >
            로그인
          </button>
        </div>

      </div>
    </div>
  );
}
