import { createBrowserClient } from "@supabase/ssr";

// 브라우저용 Supabase 클라이언트 (싱글턴)
// 이 앱은 전부 "use client" 컴포넌트라 브라우저 클라이언트 하나면 충분.
// 키는 .env.local 의 NEXT_PUBLIC_* 값(빌드 시 브라우저 번들에 인라인됨).
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);
