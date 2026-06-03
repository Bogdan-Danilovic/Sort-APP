import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import flavorAliases from '@/lib/flavorAliases.json';
import { initFlavorMap } from '@/lib/normalizer';

initFlavorMap(flavorAliases);

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-jakarta',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s — MergeKit',
    default: 'MergeKit — Pametno spajanje inventara',
  },
  description:
    'Spojite više CSV, TXT i Excel fajlova u jedan inventar. Automatsko prepoznavanje proizvoda na srpskom i engleskom.',
  keywords: ['inventar', 'magacin', 'spajanje', 'CSV', 'Excel', 'MergeKit'],
  authors: [{ name: 'MergeKit' }],
  robots: 'noindex, nofollow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr" className={`dark ${jakarta.variable} ${dmSans.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
