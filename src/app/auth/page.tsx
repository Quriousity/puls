"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

// 공식 구글 4색 "G" 로고
function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (loading) return;
    setError("");
    setNotice("");
    setLoading(true);

    const { data, error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // 회원가입인데 세션이 없으면 = 이메일 확인 필요 (대시보드에서 confirm 켜진 경우)
    if (mode === "signup" && !data.session) {
      setNotice("확인 메일을 보냈어요. 메일함에서 인증 후 로그인해주세요.");
      setMode("signin");
      return;
    }

    window.location.href = "/";
  }

  async function handleGoogle() {
    if (loading) return;
    setError("");
    setNotice("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    // 성공 시 브라우저가 구글로 리다이렉트되므로 이 아래는 실패할 때만 실행됨
    if (error) setError(error.message);
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
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 text-sm text-fg placeholder:text-fg-subtle outline-none focus:ring-1 focus:ring-border"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}
          {notice && <p className="text-sm text-emerald-400">{notice}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {loading ? "처리 중..." : mode === "signin" ? "로그인" : "회원가입"}
          </button>
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs text-fg-subtle">또는</span>
          <div className="flex-1 border-t border-border" />
        </div>

        {/* 구글 로그인 */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-raised border border-border text-fg hover:bg-surface-overlay transition-colors text-sm font-medium disabled:opacity-50"
        >
          <GoogleIcon size={18} />
          Google로 계속하기
        </button>

        {/* 모드 전환 */}
        <p className="text-center text-sm text-fg-muted">
          {mode === "signin" ? "계정이 없으신가요? " : "이미 계정이 있으신가요? "}
          <button
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setNotice(""); }}
            className="text-orange-400 hover:underline"
          >
            {mode === "signin" ? "회원가입" : "로그인"}
          </button>
        </p>

      </div>
    </div>
  );
}
