import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";

function sanitizeRedirectPath(rawNext: string | null, expectedOrigin: string): string {
  if (!rawNext || typeof rawNext !== "string") {
    return "/dashboard";
  }

  // Reject ASCII control characters, whitespace, backslashes, userinfo '@', or protocol-relative '//'
  if (
    /[\x00-\x1F\x7F\s]/.test(rawNext) ||
    !rawNext.startsWith("/") ||
    rawNext.startsWith("//") ||
    rawNext.includes("\\") ||
    rawNext.includes("@")
  ) {
    return "/dashboard";
  }

  try {
    const targetUrl = new URL(rawNext, expectedOrigin);
    // Ensure origin matches exactly and pathname remains a single-slash relative path
    if (
      targetUrl.origin === expectedOrigin &&
      targetUrl.pathname.startsWith("/") &&
      !targetUrl.pathname.startsWith("//")
    ) {
      return targetUrl.pathname + targetUrl.search + targetUrl.hash;
    }
  } catch {
    // Malformed URL components
  }

  return "/dashboard";
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const rawNext = searchParams.get("next");

  const safeDestination = sanitizeRedirectPath(rawNext, origin);

  const supabase = await createClient();

  // 1. Handle PKCE code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(safeDestination, origin).toString());
    }
  }

  // 2. Handle token_hash verification (OTP / Email magic link)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      return NextResponse.redirect(new URL(safeDestination, origin).toString());
    }
  }

  // Determine user-friendly destination if verification failed
  const isRecoveryFlow =
    rawNext?.includes("reset-password") ||
    type === "recovery";

  const failureDestination = isRecoveryFlow
    ? "/reset-password?error=expired"
    : "/login?error=auth_failed";

  return NextResponse.redirect(new URL(failureDestination, origin).toString());
}

