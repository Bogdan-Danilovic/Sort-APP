# MergeKit — Pametno spajanje inventara

MergeKit je web aplikacija za spajanje više CSV/TXT fajlova i tekstualnih unosa u jedan ujedinjen inventar. Namenjena je vlasnicima malih preduzeća u Srbiji koji upravljaju fizičkim zalihama.

## Funkcionalnosti

- **Parsovanje** CSV, TXT, XLSX i zalepljenog teksta (WhatsApp, SMS format)
- **Pametno spajanje** — isti proizvodi se automatski prepoznaju (šećer = secer = шећер)
- **Inline editovanje cena** sa Tab/Enter navigacijom i Ctrl+Z undo
- **Export** u CSV, Excel (sa bojama) i PDF
- **Istorija** sačuvanih sesija
- **Auth** putem emaila/lozinke
- **Srpski i engleski** jezik

---

## Tehnički stack

- **Next.js 14** (App Router)
- **Supabase** (auth + baza podataka)
- **TypeScript** (strict mode)
- **Tailwind CSS** (custom paleta)
- **Framer Motion** (animacije)
- **next-intl** (i18n)
- **Papa Parse** (CSV parsovanje)
- **xlsx** (Excel čitanje/pisanje)
- **jsPDF + jspdf-autotable** (PDF export)

---

## Pokretanje lokalno

### 1. Klonirajte projekat

```bash
git clone <repo-url>
cd mergekit
```

### 2. Instalirajte zavisnosti

```bash
npm install
```

### 3. Podesite environment varijable

```bash
cp .env.example .env.local
```

Otvorite `.env.local` i popunite vrednosti (vidite sekciju **Supabase setup** ispod).

### 4. Pokrenite development server

```bash
npm run dev
```

Aplikacija je dostupna na [http://localhost:3000](http://localhost:3000).

---

## Supabase setup (od nule)

### Korak 1 — Kreiranje projekta

1. Idite na [supabase.com](https://supabase.com) i kliknite **Start your project**
2. Prijavite se (GitHub ili email)
3. Kliknite **New project**
4. Popunite:
   - **Name**: `mergekit` (ili po vašem izboru)
   - **Database Password**: Sačuvajte ovu lozinku!
   - **Region**: `Central EU (Frankfurt)` (preporučeno za Srbiju)
5. Kliknite **Create new project** i sačekajte ~2 minuta

### Korak 2 — Dohvatanje API ključeva

1. U Supabase Dashboard-u idite na **Settings → API**
2. Kopirajte:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** ključ → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Korak 3 — Kreiranje tabela

1. U Supabase Dashboard-u idite na **SQL Editor**
2. Kliknite **New query**
3. Kopirajte sadržaj fajla `supabase/migrations/001_initial.sql`
4. Kliknite **Run**

Trebalo bi da vidite poruku `Success. No rows returned`.

### Korak 4 — Konfiguracija autentikacije

1. Idite na **Authentication → URL Configuration**
2. Dodajte u **Redirect URLs**:
   - `http://localhost:3000/**` (za development)
   - `https://vaša-domena.com/**` (za produkciju)

### Korak 5 — Google OAuth (opciono)

1. Idite na [Google Cloud Console](https://console.cloud.google.com)
2. Kreirajte novi projekat ili izaberite postojeći
3. Idite na **APIs & Services → Credentials**
4. Kliknite **Create Credentials → OAuth 2.0 Client IDs**
5. Application type: **Web application**
6. Dodajte Authorized redirect URI: `https://vaš-projekat-id.supabase.co/auth/v1/callback`
7. Kopirajte Client ID i Client Secret
8. U Supabase Dashboard → **Authentication → Providers → Google**:
   - Unesite Client ID i Client Secret
   - Aktivirajte Google provider

---

## Struktura projekta

```
mergekit/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Lokalizovane rute
│   │   ├── dashboard/            # Kontrolna tabla
│   │   ├── merge/                # Merge flow (3 koraka)
│   │   ├── history/              # Istorija sesija
│   │   ├── settings/             # Podešavanja
│   │   └── auth/                 # Login/register
│   └── layout.tsx
├── components/
│   ├── layout/                   # Sidebar, TopBar, AppShell
│   ├── merge/                    # FileUploadZone, MergedTable...
│   ├── history/                  # SessionList, SessionRow...
│   ├── settings/                 # CompanySettings, DangerZone...
│   └── ui/                       # shadcn + custom komponente
├── lib/
│   ├── parser.ts                 # CSV/TXT/paste parser
│   ├── merger.ts                 # Merge logika
│   ├── normalizer.ts             # Accent/case normalizacija
│   ├── exportUtils.ts            # CSV/Excel/PDF export
│   ├── supabase.ts               # Browser Supabase client
│   ├── supabaseServer.ts         # Server Supabase client
│   ├── i18n.ts                   # next-intl konfiguracija
│   └── hooks/                    # Custom React hooks
├── messages/
│   ├── sr.json                   # Srpski prevodi
│   └── en.json                   # Engleski prevodi
├── supabase/
│   └── migrations/
│       └── 001_initial.sql       # SQL migracija
├── types/
│   ├── index.ts                  # TypeScript tipovi
│   └── supabase.ts               # Supabase DB tipovi
├── middleware.ts                 # Auth + i18n middleware
├── .env.example                  # Primer env varijabli
└── README.md
```

---

## Parsovanje — primeri

### TXT format
```
brasno 50kg 120din
secer 20 85
ulje-10-200rsd nerafinski
```

### WhatsApp/paste format
```
Zdravo, treba mi:
Brasno x2 (ima 30 u magacinu)
Ulje 5 komada 180din
Secer: 10kg
```

### CSV format
```csv
naziv,kolicina,cena
Brašno,50,120
Šećer,20,85
```

### Rezultat spajanja (sva 3 izvora)
| Naziv | Uk. kol. | Cene | Uk. vrednost |
|-------|----------|------|--------------|
| brasno | 82 | 120din | 9.840din |
| secer  | 30 | 85din  | 2.550din |
| ulje   | 15 | 200din \| 180din | 2.850din |

---

## Build i produkcija

```bash
npm run build
npm run start
```

---

## Licenca

MIT
