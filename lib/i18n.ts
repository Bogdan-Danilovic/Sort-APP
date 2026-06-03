// ============================================================
// MergeKit — next-intl konfiguracija
// Podržani jezici: srpski (default) i engleski
// ============================================================

import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

/** Podržani jezici */
export const locales = ['sr', 'en'] as const;
export type Locale = (typeof locales)[number];

/** Default jezik */
export const defaultLocale: Locale = 'sr';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  // Validacija locale-a
  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
