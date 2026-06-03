import Link from 'next/link';
import MergeKitLogo from '@/components/ui/MergeKitLogo';
import { ArrowRight, CheckCircle2, Zap, FileText, GitMerge, Layers, Upload, Wand2 } from 'lucide-react';
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
    <div style={{ background: '#060609', color: '#e8e8f0', minHeight: '100dvh' }}>

      {/* ── Nav ──────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 60,
        background: 'rgba(6,6,9,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid #0f0f16',
      }}>
        <MergeKitLogo locale={locale} href={`/${locale}`} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link
            href={`/${locale}/auth/login`}
            style={{ color: '#444', fontSize: 14, fontWeight: 500, padding: '8px 12px', textDecoration: 'none' }}
          >
            Prijava
          </Link>
          <Link
            href={`/${locale}/auth/register`}
            style={{
              background: '#3a81f6', color: '#fff', fontSize: 14, fontWeight: 600,
              padding: '8px 18px', borderRadius: 10, textDecoration: 'none',
              boxShadow: '0 2px 16px rgba(58,129,246,0.35)',
            }}
          >
            Počni
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────── */}
      <section style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center',
        padding: '64px 20px 56px',
        minHeight: 'calc(100dvh - 60px)',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 14px', borderRadius: 9999,
          background: 'rgba(58,129,246,0.08)',
          border: '1px solid rgba(58,129,246,0.18)',
          color: '#91c5ff', fontSize: 12, fontWeight: 600,
          marginBottom: 32, letterSpacing: '0.02em',
        }}>
          <Zap size={11} strokeWidth={2.5} />
          CSV · TXT · Excel — sve u jednom
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(2.4rem, 9vw, 4.5rem)',
          fontWeight: 800, letterSpacing: '-0.035em',
          lineHeight: 1.08, marginBottom: 20, maxWidth: 640,
          fontFamily: 'var(--font-jakarta,"Plus Jakarta Sans"),system-ui',
          color: '#f0f0f8',
        }}>
          Spajanje inventara
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #3a81f6 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            za sekunde
          </span>
        </h1>

        {/* Sub */}
        <p style={{
          color: '#4a4a60', fontSize: 16, lineHeight: 1.65,
          maxWidth: 360, marginBottom: 40,
        }}>
          Učitajte više fajlova — MergeKit ih automatski prepozna,
          normalizuje i spoji bez Excel formula.
        </p>

        {/* CTAs — full-width on mobile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 340 }}>
          <Link
            href={`/${locale}/auth/register`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'linear-gradient(135deg, #2563ef, #3a81f6)',
              color: '#fff', padding: '17px 24px', borderRadius: 14,
              fontWeight: 700, fontSize: 16, textDecoration: 'none',
              boxShadow: '0 8px 36px rgba(58,129,246,0.42)',
            }}
          >
            Počni besplatno
            <ArrowRight size={18} strokeWidth={2.5} />
          </Link>
          <Link
            href={`/${locale}/auth/login`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#0c0c12', border: '1px solid #181820',
              color: '#666', padding: '15px 24px', borderRadius: 14,
              fontWeight: 500, fontSize: 15, textDecoration: 'none',
            }}
          >
            Imam nalog
          </Link>
        </div>

        {/* Trust signals */}
        <div style={{
          display: 'flex', gap: 18, marginTop: 32,
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {['Besplatno', 'Bez instalacije', 'Radi u pregledaču'].map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle2 size={13} style={{ color: '#34d399' }} strokeWidth={2.5} />
              <span style={{ color: '#333344', fontSize: 12, fontWeight: 500 }}>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features (list style) ─────────────────────── */}
      <section style={{ borderTop: '1px solid #0c0c14', padding: '52px 20px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <p style={{
            color: '#252530', fontSize: 11, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            textAlign: 'center', marginBottom: 40,
          }}>
            Zašto MergeKit
          </p>
          <div>
            {([
              {
                icon: FileText,
                title: 'Više formata odjednom',
                desc: 'CSV, TXT i Excel — sve u jednoj sesiji. Nema ručne konverzije, nema čekanja.',
                color: '#91c5ff',
              },
              {
                icon: GitMerge,
                title: 'Pametno prepoznavanje',
                desc: 'Normalizacija naziva i automatsko spajanje duplikata — čak i kad se razlikuju po pisanju.',
                color: '#a78bfa',
              },
              {
                icon: Layers,
                title: 'Instant izvoz',
                desc: 'Preuzmite konačni inventar kao CSV, Excel ili PDF — spreman za dalje korišćenje.',
                color: '#34d399',
              },
            ] as const).map((f, i, arr) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 18,
                    padding: '24px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid #0c0c14' : 'none',
                  }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#0c0c14', border: '1px solid #141420',
                  }}>
                    <Icon size={18} style={{ color: f.color }} />
                  </div>
                  <div>
                    <p style={{ color: '#d8d8e8', fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
                      {f.title}
                    </p>
                    <p style={{ color: '#404055', fontSize: 14, lineHeight: 1.6 }}>
                      {f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────── */}
      <section style={{
        background: '#070710',
        borderTop: '1px solid #0c0c14', borderBottom: '1px solid #0c0c14',
        padding: '52px 20px',
      }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <p style={{
            color: '#252530', fontSize: 11, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            textAlign: 'center', marginBottom: 40,
          }}>
            Kako radi
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {([
              { n: '01', icon: Upload, title: 'Učitajte fajlove', desc: 'Prevucite ili kliknite da dodate CSV, TXT ili Excel fajlove — koliko god želite.' },
              { n: '02', icon: Wand2, title: 'Automatsko spajanje', desc: 'MergeKit prepoznaje nazive, normalizuje ih i spaja duplikate u jedan red.' },
              { n: '03', icon: Layers, title: 'Preuzmite rezultat', desc: 'Izvezite konačni inventar u formatu koji vam odgovara.' },
            ] as const).map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.n} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(58,129,246,0.08)',
                      border: '1px solid rgba(58,129,246,0.18)',
                    }}>
                      <Icon size={16} style={{ color: '#3a81f6' }} />
                    </div>
                    {i < 2 && (
                      <div style={{
                        width: 1, background: '#0f0f1a',
                        flexGrow: 1, marginTop: 8, minHeight: 32,
                      }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: 36 }}>
                    <span style={{
                      fontFamily: 'var(--font-jetbrains,monospace)',
                      color: '#1e1e30', fontSize: 11, fontWeight: 700,
                      letterSpacing: '0.06em', display: 'block', marginBottom: 6,
                    }}>
                      {step.n}
                    </span>
                    <p style={{ color: '#d0d0e0', fontWeight: 600, fontSize: 15, marginBottom: 5 }}>
                      {step.title}
                    </p>
                    <p style={{ color: '#404055', fontSize: 14, lineHeight: 1.6 }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────── */}
      <section style={{ padding: '56px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 340, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 5vw, 2rem)',
            fontWeight: 800, marginBottom: 10, letterSpacing: '-0.025em',
            color: '#e8e8f0',
            fontFamily: 'var(--font-jakarta,"Plus Jakarta Sans"),system-ui',
          }}>
            Spremi za start?
          </h2>
          <p style={{ color: '#333344', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
            Registracija je besplatna i traje manje od minute.
          </p>
          <Link
            href={`/${locale}/auth/register`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'linear-gradient(135deg, #2563ef, #3a81f6)',
              color: '#fff', padding: '17px', borderRadius: 14,
              fontWeight: 700, fontSize: 16, textDecoration: 'none',
              boxShadow: '0 8px 36px rgba(58,129,246,0.42)',
            }}
          >
            Počni besplatno
            <ArrowRight size={18} strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid #0c0c14', padding: '20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{
          fontFamily: 'var(--font-jetbrains,monospace)',
          fontWeight: 700, color: '#1a1a24', fontSize: 12,
        }}>
          MergeKit
        </span>
        <span style={{ color: '#1a1a24', fontSize: 12 }}>
          © {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  );
}
