import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-jakarta',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
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
    <html lang="sr" className={`${jakarta.variable} ${jetbrains.variable}`} suppressHydrationWarning>
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
