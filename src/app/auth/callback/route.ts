import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

// 구글 등 OAuth 로그인 후 돌아오는 곳.
// Supabase 가 ?code= 를 붙여 보내면, 그걸 세션으로 교환하고 앱(/)으로 보냄.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/`);
    }
  }

  // 코드가 없거나 교환 실패 → 로그인 화면으로
  return NextResponse.redirect(`${origin}/auth?error=oauth`);
}
