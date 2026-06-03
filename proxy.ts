// ============================================================
// MergeKit — Proxy (Next.js 16, previously middleware)
// Auth zaštita ruta + next-intl locale routing
// ============================================================

import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/lib/i18n';

/** Rute koje zahtevaju autentikaciju */
const PROTECTED_PATHS = ['/dashboard', '/merge', '/history', '/settings'];

/** Rute dostupne samo neautentikovanim korisnicima */
const AUTH_ONLY_PATHS = ['/auth/login', '/auth/register'];

/** next-intl middleware za i18n routing */
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export async function proxy(request: NextRequest) {
  // Inicijalni response (može biti modifikovan)
  let response = NextResponse.next({
    request,
  });

  // Kreiranje Supabase klijenta koji radi u edge middleware-u
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Dohvatanje sesije
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Parsovanje URL-a
  const pathname = request.nextUrl.pathname;

  // Ukloni locale prefix za proveru zaštićenih putanja
  // npr. /sr/dashboard → /dashboard
  const pathnameWithoutLocale = pathname.replace(
    /^\/(sr|en)/,
    ''
  ) || '/';

  // Provjera zaštićenih ruta
  const isProtected = PROTECTED_PATHS.some((p) =>
    pathnameWithoutLocale.startsWith(p)
  );

  const isAuthOnly = AUTH_ONLY_PATHS.some((p) =>
    pathnameWithoutLocale.startsWith(p)
  );

  // Ulogovani korisnik pokušava da pristupi auth stranicama
  if (session && isAuthOnly) {
    const locale = pathname.split('/')[1] ?? defaultLocale;
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  // Neulogovani korisnik pokušava da pristupi zaštićenoj ruti
  if (!session && isProtected) {
    const locale = pathname.split('/')[1] ?? defaultLocale;
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/auth/login`;
    // Sačuvaj original URL za redirect posle logina
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // Primeni next-intl routing
  const intlResponse = intlMiddleware(request);
  if (intlResponse) {
    // Kopiraj auth cookies u intl response
    response.cookies.getAll().forEach((cookie) => {
      intlResponse.cookies.set(cookie.name, cookie.value);
    });
    return intlResponse;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match sve rute osim:
     * - _next/static (statički fajlovi)
     * - _next/image (optimizacija slika)
     * - favicon.ico
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
