"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleEmailAuth() {
    setError(null);
    setMessage(null);
    setLoading(true);

    const { error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else if (mode === "signup") {
      setMessage("확인 이메일을 보냈습니다. 메일함을 확인해주세요.");
    } else {
      window.location.href = "/";
    }
  }

  async function handleOAuth(provider: "google" | "kakao") {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="min-h-full flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 bg-surface border border-border rounded-2xl p-8">

        <h1 className="text-2xl font-bold text-fg text-center tracking-widest">PULS</h1>



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
            onKeyDown={e => e.key === "Enter" && handleEmailAuth()}
            className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 text-sm text-fg placeholder:text-fg-subtle outline-none focus:ring-1 focus:ring-border"
          />

          {error && <p className="text-xs text-red-400">{error}</p>}
          {message && <p className="text-xs text-emerald-500">{message}</p>}

          <button
            onClick={handleEmailAuth}
            disabled={loading || !email || !password}
            className="w-full py-3 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "..." : mode === "signin" ? "로그인" : "회원가입"}
          </button>
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs text-fg-subtle">또는</span>
          <div className="flex-1 border-t border-border" />
        </div>



        {/* 모드 전환 */}
        <p className="text-center text-xs text-fg-subtle">
          {mode === "signin" ? "계정이 없으신가요?" : "이미 계정이 있으신가요?"}
          {" "}
          <button
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setMessage(null); }}
            className="text-fg underline underline-offset-2"
          >
            {mode === "signin" ? "회원가입" : "로그인"}
          </button>
        </p>
        {/* OAuth */}
        <div className="space-y-2">
          <button
            onClick={() => handleOAuth("google")}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-[#3c4043] text-sm font-medium transition-colors flex items-center justify-center gap-3"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Google로 계속하기
          </button>
          {/* <button
            onClick={() => handleOAuth("kakao")}
            className="w-full py-3 px-4 rounded-xl bg-[#FEE500] hover:bg-[#F5DC00] text-[#191919] text-sm font-medium transition-colors flex items-center justify-center gap-3"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#191919">
              <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.548 1.532 4.793 3.875 6.168L4.5 21l4.688-2.438A11.318 11.318 0 0 0 12 18.75c5.523 0 10-3.813 10-8.25S17.523 3 12 3z"/>
            </svg>
            카카오로 계속하기
          </button> */}
        </div>

      </div>


    </div>
  );
}
