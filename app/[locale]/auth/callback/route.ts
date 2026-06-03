// ============================================================
// MergeKit — OAuth callback handler
// Razmenjuje auth code za sesiju
// ============================================================

import { type NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabaseServer';
import { defaultLocale } from '@/lib/i18n';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? `/${defaultLocale}/dashboard`;

  if (code) {
    const supabase = await createRouteHandlerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Greška — idi na login
  return NextResponse.redirect(
    `${origin}/${defaultLocale}/auth/login?error=auth_callback_failed`
  );
}
