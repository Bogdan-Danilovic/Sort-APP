import Link from 'next/link';
import MergeKitLogo from '@/components/ui/MergeKitLogo';
import { GitMerge, FileText, Layers, ArrowRight, Zap, CheckCircle2, Upload, Wand2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MergeKit — Pametno spajanje inventara',
};

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: '#0a0a0a', color: '#fafafa' }}
    >
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5"
        style={{ borderBottom: '1px solid #111111' }}
      >
        <MergeKitLogo locale={locale} href={`/${locale}`} />

        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/auth/login`}
            className="text-sm font-medium px-5 py-2.5 rounded-lg transition-all"
            style={{ color: '#a1a1a1' }}
          >
            Prijava
          </Link>
          <Link
            href={`/${locale}/auth/register`}
            className="text-sm font-semibold px-5 py-2.5 rounded-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, #2563ef, #3a81f6)',
              color: '#ffffff',
              boxShadow: '0 2px 12px rgba(58,129,246,0.3)',
            }}
          >
            Počni besplatno
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-5 sm:px-6 pt-14 sm:pt-28 pb-12 sm:pb-24 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-10"
          style={{
            background: 'rgba(58,129,246,0.08)',
            border: '1px solid rgba(58,129,246,0.18)',
            color: '#91c5ff',
          }}
        >
          <Zap size={11} strokeWidth={2.5} />
          CSV · TXT · Excel — sve u jednom
        </div>

        {/* Headline */}
        <h1
          className="font-bold mb-7 leading-tight"
          style={{
            fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans"), system-ui',
            letterSpacing: '-0.03em',
            maxWidth: 780,
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          }}
        >
          Spajanje inventara{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #3a81f6 0%, #91c5ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            za sekunde
          </span>
        </h1>

        <p
          className="text-lg mb-12 max-w-lg leading-relaxed"
          style={{ color: '#525252' }}
        >
          Učitajte više fajlova, MergeKit ih automatski prepozna, normalizuje i spoji —
          bez Excel formule, bez ručnog kopiranja.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link
            href={`/${locale}/auth/register`}
            className="flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, #2563ef, #3a81f6)',
              color: '#ffffff',
              boxShadow: '0 8px 40px rgba(58,129,246,0.4)',
              minWidth: 200,
              justifyContent: 'center',
            }}
          >
            Počni besplatno
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
          <Link
            href={`/${locale}/auth/login`}
            className="flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-medium transition-all"
            style={{
              background: '#111111',
              border: '1px solid #1f1f1f',
              color: '#a1a1a1',
              minWidth: 160,
              justifyContent: 'center',
            }}
          >
            Već imam nalog
          </Link>
        </div>

        {/* Social proof row */}
        <div className="flex items-center gap-6 flex-wrap justify-center">
          {['Bez kreditne kartice', 'Bez instalacije', 'Besplatno za početnike'].map((item) => (
            <div key={item} className="flex items-center gap-1.5">
              <CheckCircle2 size={13} style={{ color: '#34d399' }} strokeWidth={2.5} />
              <span className="text-xs" style={{ color: '#525252' }}>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        className="px-5 sm:px-8 py-12 sm:py-20"
        style={{ borderTop: '1px solid #111111', borderBottom: '1px solid #111111' }}
      >
        <div className="max-w-4xl mx-auto">
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: '#525252' }}
          >
            Kako radi
          </p>
          <h2
            className="text-2xl sm:text-3xl font-bold text-center mb-16"
            style={{ color: '#fafafa', letterSpacing: '-0.02em' }}
          >
            Tri koraka do rezultata
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Upload,
                title: 'Učitajte fajlove',
                desc: 'Prevucite CSV, TXT ili Excel fajlove. Možete dodati koliko god fajlova želite odjednom.',
                color: '#91c5ff',
              },
              {
                step: '02',
                icon: Wand2,
                title: 'Automatsko spajanje',
                desc: 'MergeKit prepoznaje nazive proizvoda, normalizuje ih i spaja duplikate u jedan red.',
                color: '#c4b5fd',
              },
              {
                step: '03',
                icon: Layers,
                title: 'Izvoz rezultata',
                desc: 'Preuzmite konačni inventar kao CSV, Excel ili PDF — spreman za dalje korišćenje.',
                color: '#34d399',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="flex flex-col">
                  <div className="flex items-start gap-4 mb-5">
                    <span
                      className="font-mono font-bold text-xs pt-0.5"
                      style={{ color: '#1f1f1f', minWidth: 24 }}
                    >
                      {item.step}
                    </span>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: '#111111', border: '1px solid #1f1f1f' }}
                    >
                      <Icon size={17} style={{ color: item.color }} />
                    </div>
                  </div>
                  <h3
                    className="text-base font-semibold mb-2"
                    style={{ color: '#fafafa', paddingLeft: 28 }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: '#525252', paddingLeft: 28 }}
                  >
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-5 sm:px-8 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: '#525252' }}
          >
            Mogućnosti
          </p>
          <h2
            className="text-2xl sm:text-3xl font-bold text-center mb-16"
            style={{ color: '#fafafa', letterSpacing: '-0.02em' }}
          >
            Sve što vam treba
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon: FileText,
                title: 'Više formata',
                desc: 'CSV, TXT i Excel fajlovi — učitajte sve odjednom bez konverzije.',
                color: '#91c5ff',
                bg: 'rgba(145,197,255,0.06)',
              },
              {
                icon: GitMerge,
                title: 'Pametno spajanje',
                desc: 'Automatsko prepoznavanje i normalizacija naziva, čak i kad se razlikuju po pisanju.',
                color: '#34d399',
                bg: 'rgba(52,211,153,0.06)',
              },
              {
                icon: Layers,
                title: 'Fleksibilan izvoz',
                desc: 'Rezultat izvezite u formatu koji vam odgovara — CSV, Excel ili PDF.',
                color: '#fcd34d',
                bg: 'rgba(252,211,77,0.06)',
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="p-7 rounded-2xl"
                  style={{
                    background: '#0e0e0e',
                    border: '1px solid #1a1a1a',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: f.bg, border: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <Icon size={19} style={{ color: f.color }} />
                  </div>
                  <h3 className="text-base font-semibold mb-2.5" style={{ color: '#fafafa' }}>
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#525252' }}>
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-5 sm:px-8 pb-12 sm:pb-20">
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-2xl p-8 sm:p-10 text-center"
            style={{
              background: 'linear-gradient(135deg, #0d1a3a 0%, #0a1428 100%)',
              border: '1px solid rgba(58,129,246,0.2)',
            }}
          >
            <h2
              className="text-2xl sm:text-3xl font-bold mb-4"
              style={{ color: '#fafafa', letterSpacing: '-0.02em' }}
            >
              Spremni za prvo spajanje?
            </h2>
            <p className="text-sm mb-8" style={{ color: '#6b9fd4' }}>
              Registracija je besplatna i traje manje od minute.
            </p>
            <Link
              href={`/${locale}/auth/register`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold"
              style={{
                background: 'linear-gradient(135deg, #2563ef, #3a81f6)',
                color: '#ffffff',
                boxShadow: '0 8px 40px rgba(58,129,246,0.4)',
              }}
            >
              Počni besplatno
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-8 py-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
        style={{ borderTop: '1px solid #111111', color: '#2a2a2a' }}
      >
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold" style={{ color: '#333333' }}>MergeKit</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href={`/${locale}/auth/login`} style={{ color: '#2a2a2a' }}>Prijava</Link>
          <Link href={`/${locale}/auth/register`} style={{ color: '#2a2a2a' }}>Registracija</Link>
        </div>
      </footer>
    </main>
  );
}
