import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

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
  const rawNext = searchParams.get("next");

  const safeDestination = sanitizeRedirectPath(rawNext, origin);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(safeDestination, origin).toString());
    }
  }

  // Return user to login if verification failed
  return NextResponse.redirect(new URL("/login?error=auth_failed", origin).toString());
}

