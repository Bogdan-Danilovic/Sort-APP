# MergeKit — Smart Inventory Merger App
## Implementacioni plan

Kompletan plan za izgradnju production-ready web aplikacije za spajanje inventara.
App se zove **MergeKit**, koristi Next.js 14 + Supabase + TypeScript strict.

---

## Potvrda razumevanja spec-a

Razumem sledeće ključne zahteve:
- **Parsing**: CSV/TXT/paste tekst sa srpskim karakterima (lat/ćir), pametno detekcija polja
- **Merging**: Isti proizvodi → sabiranje količina, prikaz svih cena, prosečna cena, ukupna vrednost
- **UI**: Dark mode, VSCode/Linear sidebar, dense tabele kao spreadsheet
- **Auth**: Supabase email+password + Google OAuth, zaštićene rute
- **Export**: CSV, Excel (xlsx sa bojama), PDF
- **i18n**: Srpski (default) + engleski, bez hardcode stringa
- **Jezik UI-a**: Srpski

---

## ✅ Kompletan spisak SVIH fajlova

### Konfiguracija (root)
| Fajl | Opis |
|------|------|
| `package.json` | Sve zavisnosti |
| `next.config.ts` | Next.js + next-intl konfiguracija |
| `tailwind.config.ts` | Custom paleta boja, JetBrains Mono font |
| `tsconfig.json` | Strict mode TypeScript |
| `components.json` | shadcn/ui konfiguracija |
| `.env.example` | Svi env ključevi sa objašnjenjima |
| `README.md` | Setup, Supabase migracije, env varijable |
| `middleware.ts` | Auth zaštita ruta + next-intl |

### App Router (`/app`)
| Fajl | Opis |
|------|------|
| `app/layout.tsx` | Root layout, font učitavanje, providers |
| `app/[locale]/layout.tsx` | Locale layout sa next-intl provider |
| `app/[locale]/page.tsx` | Redirect na /dashboard |
| `app/[locale]/dashboard/page.tsx` | Dashboard — statistike, brzi pristup |
| `app/[locale]/merge/page.tsx` | 3-step merge flow |
| `app/[locale]/history/page.tsx` | Lista sešija |
| `app/[locale]/settings/page.tsx` | Podešavanja |
| `app/[locale]/auth/login/page.tsx` | Login forma |
| `app/[locale]/auth/register/page.tsx` | Registracija forma |
| `app/[locale]/auth/callback/route.ts` | OAuth callback handler |

### Komponente — Layout (`/components/layout`)
| Fajl | Opis |
|------|------|
| `components/layout/Sidebar.tsx` | VSCode-style sidebar, collapsible |
| `components/layout/TopBar.tsx` | Gornji bar sa breadcrumbom i korisničkim info |
| `components/layout/AppShell.tsx` | Wrapper koji drži Sidebar + TopBar + sadržaj |
| `components/layout/MobileNav.tsx` | Bottom nav za mobilne |

### Komponente — Merge flow (`/components/merge`)
| Fajl | Opis |
|------|------|
| `components/merge/FileUploadZone.tsx` | Drag & drop zona, Vercel-style feedback |
| `components/merge/FileChip.tsx` | Prikaz uploadovanog fajla (ikona + ime + br redova + X) |
| `components/merge/PasteTextArea.tsx` | Collapsible textarea za paste tekst |
| `components/merge/ParsedPreview.tsx` | Step 2: sekcije po izvoru sa editabilnim tabelama |
| `components/merge/MergedTable.tsx` | Step 3: finalna spojena tabela |
| `components/merge/PriceEditor.tsx` | Inline price edit sa Tab/Enter navigacijom |
| `components/merge/ExportButton.tsx` | Dropdown: CSV / Excel / PDF |
| `components/merge/SaveSessionModal.tsx` | Modal za čuvanje sesije sa imenom |
| `components/merge/StepIndicator.tsx` | Vizuelni prikaz koraka 1→2→3 |
| `components/merge/GrandTotalsRow.tsx` | Sticky totals row na dnu tabele |
| `components/merge/MergeStats.tsx` | Mini stats bar: X proizvoda, X izvora, ukupna vrednost |

### Komponente — UI (`/components/ui`)
| Fajl | Opis |
|------|------|
| `components/ui/DataTable.tsx` | Sortabilna tabela sa sticky header |
| `components/ui/EmptyState.tsx` | Specifične poruke za prazna stanja |
| `components/ui/SkeletonTable.tsx` | Skeleton loading za tabele |
| `components/ui/StatusChip.tsx` | Mali pill badge za statuse |
| `components/ui/ConfirmDialog.tsx` | Dialog za potvrdu destruktivnih akcija |
| `components/ui/Toast.tsx` | Custom toast (bottom-right, 3s) |
| `components/ui/SearchInput.tsx` | Search input sa clear dugmetom |
| `components/ui/SortableHeader.tsx` | Header ćelija sa sort ikonama |
| `components/ui/button.tsx` | shadcn button (custom) |
| `components/ui/input.tsx` | shadcn input (custom) |
| `components/ui/dialog.tsx` | shadcn dialog (custom) |
| `components/ui/dropdown-menu.tsx` | shadcn dropdown (custom) |
| `components/ui/skeleton.tsx` | shadcn skeleton |
| `components/ui/tooltip.tsx` | shadcn tooltip |
| `components/ui/select.tsx` | shadcn select |
| `components/ui/label.tsx` | shadcn label |
| `components/ui/separator.tsx` | shadcn separator |
| `components/ui/avatar.tsx` | shadcn avatar |
| `components/ui/switch.tsx` | shadcn switch |

### Komponente — History (`/components/history`)
| Fajl | Opis |
|------|------|
| `components/history/SessionList.tsx` | Lista sešija sa checkboxima i sortiranjem |
| `components/history/SessionRow.tsx` | Jedan red sesije |
| `components/history/BulkActions.tsx` | Bulk delete toolbar |

### Komponente — Settings (`/components/settings`)
| Fajl | Opis |
|------|------|
| `components/settings/CompanySettings.tsx` | Naziv firme, valuta |
| `components/settings/PreferenceSettings.tsx` | Jezik, tema |
| `components/settings/DangerZone.tsx` | Delete account, clear history |

### Lib (`/lib`)
| Fajl | Opis |
|------|------|
| `lib/parser.ts` | Główni parser: CSV/TXT/paste → ParsedRow[] |
| `lib/merger.ts` | Spajanje ParsedRow[] → MergedProduct[] |
| `lib/normalizer.ts` | Accent + case normalizacija (šećer → secer) |
| `lib/exportUtils.ts` | CSV, Excel (.xlsx), PDF export logika |
| `lib/supabase.ts` | Supabase client (browser + server) |
| `lib/supabaseServer.ts` | Server-side Supabase client |
| `lib/i18n.ts` | next-intl konfiguracija |
| `lib/hooks/useUndoStack.ts` | Undo stack za cene (Ctrl+Z) |
| `lib/hooks/useMergeSession.ts` | State management za ceo merge flow |
| `lib/hooks/useAuth.ts` | Auth helper hook |

### Tipovi (`/types`)
| Fajl | Opis |
|------|------|
| `types/index.ts` | Sve TypeScript interface i type definicije |
| `types/supabase.ts` | Auto-generisani Supabase tipovi |

### i18n poruke (`/messages`)
| Fajl | Opis |
|------|------|
| `messages/sr.json` | Sve poruke na srpskom |
| `messages/en.json` | Sve poruke na engleskom |

### Supabase migracije (`/supabase`)
| Fajl | Opis |
|------|------|
| `supabase/migrations/001_initial.sql` | merge_sessions + uploaded_files tabele + RLS |
| `supabase/seed.sql` | Test podaci za development |

---

## Faze implementacije

---

### Faza 1 — Tipovi + Parser + Merger (core logika)

**Cilj**: Ceo parsing/merging motor mora raditi bez UI-a.

#### `types/index.ts`
```typescript
// Sve tipove definisati ovde:
// RawToken, ParsedRow, MergedProduct, MergeSession,
// FileSource, ExportFormat, SortConfig, FilterConfig,
// AppSettings, UserProfile
```

#### `lib/normalizer.ts`
- Mapa srpskih karaktera: `š→s, č→c, ć→c, ž→z, đ→dj, Š→S...`
- Ćirilica → latinica konverzija
- Funkcija: `normalize(text: string): string`
- Funkcija: `isSameName(a: string, b: string): boolean`

#### `lib/parser.ts`
- `parseCSV(content: string, filename: string): ParsedRow[]`
  - Papa Parse sa BOM handling
  - Auto-detect delimiter (comma vs semicolon)
  - Header row detekcija (naziv/kolicina/cena)
- `parseTXT(content: string, filename: string): ParsedRow[]`
  - Tokenizacija po razmaku, crtici, zarezi
  - Regex za količinu: `/^\d+(\.\d+)?(kg|kom|l|m|g)?$/i`
  - Regex za cenu: `/^\d+(\.\d+)?(din|rsd|din\.|€|\$|eur)?\.?$/i`
- `parsePaste(text: string): ParsedRow[]`
  - Detekcija WhatsApp formata (Zdravo, treba mi:)
  - Detekcija Instagram DM formata
  - Detekcija SMS formata
- `detectFormat(text: string): 'csv' | 'tsv' | 'txt' | 'paste'`

#### `lib/merger.ts`
- `mergeProducts(sources: ParsedRow[][]): MergedProduct[]`
  - Grupisanje po `normalize(name)`
  - Sabiranje količina sa izvorima
  - Prikaz svih cena odvojeno " | "
  - Prosečna cena = weightedAvg(prices, quantities)
  - Total value = totalQty × avgPrice
  - Unique description merge sa " / "
- `calculateGrandTotals(products: MergedProduct[]): GrandTotals`

**Test case**:
```
Input: brasno 50kg 120din + secer 20 85 + ulje-10-200rsd
       Brasno x2 + Ulje 5 komada 180din + Secer: 10kg
       Brašno,50,120 + Šećer,20,85
Output: brasno 82kg, secer 30, ulje 15
```

---

### Faza 2 — Supabase setup + Auth

**Cilj**: Auth flow radi end-to-end.

#### `supabase/migrations/001_initial.sql`
- `merge_sessions` tabela sa RLS
- `uploaded_files` tabela sa RLS
- RLS politike: `user_id = auth.uid()`

#### `lib/supabase.ts`
- Browser client: `createBrowserClient()`
- Server helpers: `createServerClient()` sa cookie handling

#### `lib/supabaseServer.ts`
- Route Handler client
- Server Component client

#### `app/[locale]/auth/login/page.tsx`
- Email + password forma
- Google OAuth dugme
- Link na register
- Error handling sa jasnim porukama

#### `app/[locale]/auth/register/page.tsx`
- Email + password + confirm password
- Validacija u realnom vremenu
- Success → redirect na /dashboard

#### `app/[locale]/auth/callback/route.ts`
- OAuth callback handler
- Cookie exchange

#### `middleware.ts`
- Zaštićene rute: `/dashboard`, `/merge`, `/history`, `/settings`
- Redirect unauthenticated → `/auth/login`
- next-intl locale routing

---

### Faza 3 — Layout + Sidebar

**Cilj**: Shell aplikacije spreman, navigacija funkcioniše.

#### `components/layout/Sidebar.tsx`
- 240px širina, collapsible na 64px
- Logo "MergeKit" u JetBrains Mono
- Nav items sa ikonama (Lucide): 
  - Ploča (LayoutDashboard)
  - Novo spajanje (GitMerge)
  - Istorija (History)
  - Podešavanja (Settings)
- Active state: `border-l-2 border-indigo-500 bg-slate-800/50`
- Bottom: Avatar + email + Odjavi se
- Mobile: hidden, zamenjuje MobileNav

#### `components/layout/MobileNav.tsx`
- Fixed bottom nav na `sm:` breakpointu
- 4 ikone bez labela (samo active ima label)

#### `app/[locale]/dashboard/page.tsx`
- Stats kartice: Ukupno sesija, Poslednje spajanje, Ukupno proizvoda
- Lista poslednjih 5 sesija
- Brzi link "Novo spajanje"
- Empty state ako nema sesija: "Niste još uvek spajali fajlove. Počnite ovde."

---

### Faza 4 — Merge flow (Koraci 1–3)

**Cilj**: Ceo 3-step flow funkcioniše end-to-end.

#### `app/[locale]/merge/page.tsx`
- State machine: `step: 1 | 2 | 3`
- `useMergeSession` hook drži ceo state

#### `components/merge/FileUploadZone.tsx`
- `onDragOver`: border solid indigo + `bg-indigo-950/20`
- `onDrop`: fajlovi se čitaju sa `FileReader`
- Accepts: `.csv`, `.txt`, `.xlsx`, `text/plain`
- Paste textarea collapsible ispod

#### `components/merge/FileChip.tsx`
- `[📄] filename.csv  47 redova  ×`
- Hover: `×` postaje crveno
- Click X → ukloni iz liste

#### `components/merge/ParsedPreview.tsx`
- Collapsible sekcija po fajlu
- Header: `filename | X redova parsovano | [uredi] [ukloni]`
- Tabela: editabilni `contenteditable` / `input` u ćelijama
- Amber highlight za sumnjive redove (parsing confidence < 0.7)

#### `components/merge/MergedTable.tsx`
- Sticky header + sticky totals row
- Kolone: Naziv | Količine | Uk. Qty | Cene | Avg Cena | Uk. Vrednost | Opis | Izvori
- Sortiranje po svakoj koloni
- Filter search iznad
- Hover: `border-l-2 border-indigo-500 bg-slate-800/30`
- Qty i cene desno-poravnate u `font-mono`

#### `components/merge/PriceEditor.tsx`
- `<input type="number">` inline
- `onKeyDown`: Tab → sledeće polje, Enter → blur/confirm
- Instant recalc na `onChange`
- "Popuni sve prazne" dugme

#### `lib/hooks/useUndoStack.ts`
- `push(state)`, `undo()`, `canUndo: boolean`
- Ctrl+Z binding
- Max 20 koraka

---

### Faza 5 — Istorija + Podešavanja

#### `app/[locale]/history/page.tsx`
- Lista sesija sortirana po datumu
- Kolone: Datum | Naziv | Br. proizvoda | Br. fajlova | Akcije
- Checkbox za bulk delete
- Search po imenu sesije
- Click row → učitaj sesiju u merge
- Bulk delete sa confirm dialogom

#### `app/[locale]/settings/page.tsx`
- Sekcija: Firma (naziv, valuta)
- Sekcija: Preference (jezik SR/EN, tema)
- Sekcija: Opasna zona (brisanje podataka)
- Sve čuvano u Supabase user metadata + localStorage

---

### Faza 6 — Export utilities

#### `lib/exportUtils.ts`
**CSV export**:
```typescript
export function exportToCSV(products: MergedProduct[]): void
// → merged_20260603_020000.csv
```

**Excel export** (xlsx library):
```typescript
export function exportToXLSX(products: MergedProduct[], settings: AppSettings): void
// Header row: indigo bg (#6366f1), white text, bold
// Alternating rows: #1e293b / #0f172a
// Totals row: bold, #1d4ed8
// Auto-width kolone
// Format: merged_[timestamp].xlsx
```

**PDF export** (jsPDF + autoTable):
```typescript
export function exportToPDF(products: MergedProduct[], companyName: string): void
// Header: naziv firme
// Čista tabela, bez boja
// Footer: datum generisanja
// Format: merged_[timestamp].pdf
```

#### `components/merge/ExportButton.tsx`
- Dropdown sa 3 opcije
- Loading state dok se generiše fajl
- Success toast po završetku

---

### Faza 7 — i18n + finalno poliranje

#### `messages/sr.json`
Sve UI string-ove na srpskom, organizovane po namespace-ima:
```json
{
  "nav": { "dashboard": "Kontrolna tabla", "merge": "Novo spajanje", ... },
  "merge": { "dropzone": "Prevucite fajlove ovde", ... },
  "history": { "empty": "Još uvek nema sačuvanih spajanja." },
  "errors": { "parse_failed": "Parsovanje nije uspelo." },
  ...
}
```

#### `messages/en.json`
Isti namespace-ovi na engleskom.

#### Finalno poliranje:
- Framer Motion animacije: sidebar slide, step transitions, table row entrance
- `useEffect` za Ctrl+Z binding
- Keyboard navigation (Tab flow kroz celu stranicu)
- Mobile responsive provera
- Meta tagovi (title, description)
- Favicon

---

## Pitanja otvorena za odluku

> [!IMPORTANT]
> **Supabase projekat**: Da li već imate Supabase projekat kreiran ili da dodam setup instrukcije za kreiranje od nule?

> [!IMPORTANT]  
> **Google OAuth**: Da li želite da OAuth bude funkcionalan (zahteva konfiguraciju u Supabase konzoli), ili da ga implementiram kao UI sa TODO komentarom za ključeve?

> [!NOTE]
> **PDF biblioteka**: Plan je koristiti `jsPDF` + `jspdf-autotable`. Alternativa je `@react-pdf/renderer` koji je teži ali fleksibilniji. Predlog: jsPDF za jednostavniji setup.

> [!NOTE]
> **XLSX biblioteka**: Koristim `xlsx` (SheetJS) za Excel export i `papaparse` za CSV parsing, kao što je spec naložio.

---

## Plan verifikacije

### Core logika (Faza 1)
- Unit testovi za `normalizer.ts`: `šećer === secer`, ćirilica→latinica
- Unit testovi za `parser.ts` sa sva 3 primera iz spec-a
- Unit testovi za `merger.ts`: provera svih 3 primera → brasno 82, secer 30, ulje 15

### Auth (Faza 2)
- Login → dashboard redirect
- Unauthenticated → login redirect  
- Logout → čišćenje sesije

### Merge flow (Faza 4)
- Upload CSV → FileChip se pojavljuje
- Parse → tabela se popunjava
- Merge → finalna tabela sa ispravnim totalima
- Price edit → instant recalc
- Ctrl+Z → undo cene

### Export (Faza 6)
- CSV download funkcioniše
- Excel otvara se sa bojama
- PDF ima naziv firme

---

## Redosled implementacije (po prioritetu)

```
1. types/index.ts
2. lib/normalizer.ts
3. lib/parser.ts
4. lib/merger.ts
5. lib/exportUtils.ts (CSV deo)
6. supabase/migrations/001_initial.sql
7. lib/supabase.ts + lib/supabaseServer.ts
8. middleware.ts
9. Konfiguracija (package.json, next.config.ts, tailwind.config.ts)
10. messages/sr.json + messages/en.json
11. app/layout.tsx + app/[locale]/layout.tsx
12. components/layout/* (Sidebar, TopBar, AppShell, MobileNav)
13. app/[locale]/auth/* (login, register, callback)
14. components/merge/* (ceo flow)
15. app/[locale]/merge/page.tsx
16. app/[locale]/dashboard/page.tsx
17. app/[locale]/history/page.tsx
18. app/[locale]/settings/page.tsx
19. lib/exportUtils.ts (Excel + PDF)
20. components/merge/ExportButton.tsx
21. Framer Motion animacije
22. README.md + .env.example
```

**Ukupno fajlova**: ~65 fajlova
