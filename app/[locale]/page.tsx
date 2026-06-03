import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerComponentClient } from '@/lib/supabaseServer';
import MergeKitLogo from '@/components/ui/MergeKitLogo';
import { GitMerge, FileText, Layers, ArrowRight, Zap } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MergeKit — Pametno spajanje inventara',
};

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const supabase = await createServerComponentClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: '#0a0a0a', color: '#fafafa' }}
    >
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid #111111' }}
      >
        <MergeKitLogo locale={locale} href={`/${locale}`} />

        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/auth/login`}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-all"
            style={{ color: '#a1a1a1' }}
          >
            Prijava
          </Link>
          <Link
            href={`/${locale}/auth/register`}
            className="text-sm font-semibold px-4 py-2 rounded-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, #2563ef, #3a81f6)',
              color: '#ffffff',
            }}
          >
            Počni besplatno
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center flex-1 px-6 py-20 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8"
          style={{
            background: 'rgba(58,129,246,0.1)',
            border: '1px solid rgba(58,129,246,0.2)',
            color: '#91c5ff',
          }}
        >
          <Zap size={11} strokeWidth={2.5} />
          CSV · TXT · Excel — sve u jednom
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight"
          style={{
            fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans"), system-ui',
            letterSpacing: '-0.03em',
            maxWidth: 720,
          }}
        >
          Spajanje inventara{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #3a81f6, #91c5ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            za sekunde
          </span>
        </h1>

        <p
          className="text-base sm:text-lg mb-10 max-w-md leading-relaxed"
          style={{ color: '#a1a1a1' }}
        >
          Učitajte više fajlova, MergeKit ih automatski prepozna i spoji —
          bez Excel formule, bez ručnog kopiranja.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href={`/${locale}/auth/register`}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, #2563ef, #3a81f6)',
              color: '#ffffff',
              boxShadow: '0 8px 32px rgba(58,129,246,0.4)',
              minWidth: 180,
              justifyContent: 'center',
            }}
          >
            Počni besplatno
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
          <Link
            href={`/${locale}/auth/login`}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: '#111111',
              border: '1px solid #1f1f1f',
              color: '#d4d4d4',
              minWidth: 160,
              justifyContent: 'center',
            }}
          >
            Prijavi se
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-20 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: FileText,
              title: 'Više formata',
              desc: 'CSV, TXT i Excel fajlovi — učitaj sve odjednom.',
              color: '#91c5ff',
            },
            {
              icon: GitMerge,
              title: 'Pametno spajanje',
              desc: 'Automatsko prepoznavanje i normalizacija naziva proizvoda.',
              color: '#34d399',
            },
            {
              icon: Layers,
              title: 'Izvoz',
              desc: 'Rezultat izvezi kao CSV, Excel ili PDF u par klikova.',
              color: '#fcd34d',
            },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="p-6 rounded-xl"
                style={{ background: '#111111', border: '1px solid #1f1f1f' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <Icon size={18} style={{ color: f.color }} />
                </div>
                <h3 className="text-sm font-semibold mb-1.5" style={{ color: '#fafafa' }}>
                  {f.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: '#525252' }}>
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 py-5 flex items-center justify-between text-xs"
        style={{ borderTop: '1px solid #111111', color: '#333333' }}
      >
        <span className="font-mono">MergeKit</span>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </main>
  );
}
