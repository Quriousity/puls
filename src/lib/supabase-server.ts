import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// 서버(라우트 핸들러)용 Supabase 클라이언트.
// OAuth 콜백에서 PKCE 코드를 세션으로 교환할 때 쿠키 읽기/쓰기가 필요해서 사용.
export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
}
