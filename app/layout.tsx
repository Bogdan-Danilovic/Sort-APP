import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="sr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
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
