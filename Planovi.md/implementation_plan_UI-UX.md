# Premium UI/UX Redizajn (Mobile-First)

Aplikacija treba da dobije **premium, human-crafted izgled** koji radi savršeno i na telefonu i na desktopu, uz izbegavanje "generičkog AI" stila. Fokusiramo se na elegantnu paletu boja, moderne fontove, staklene (glassmorphism) elemente i fluidne animacije.

## User Review Required

> [!IMPORTANT]
> Pročitaj predložene promene ispod. Ako ti se sviđa smer, potvrdi da mogu da započnem izmene. Ako želiš neku specifičnu boju (npr. tamnu temu sa plavim naglaskom, ili potpuno crnu OLED temu sa neon akcentima), obavezno mi napomeni!

## Proposed Changes

### 1. Globalna Estetika (Design System)
- **Boje**: Menjamo bazični `Slate` (#1e293b) u mnogo dublju i sofisticiraniju tamnu paletu (npr. `#09090b` OLED crna do `#18181b` sa suptilnim `Zinc` tonovima). Akcentna boja (indigo) dobija vibrantniji neon-sjaj i prelive.
- **Font**: Uvodimo moderniji font, npr. `Plus Jakarta Sans` za naslove i UI komponente, dok zadržavamo `Inter` za čist tekst. Ovo daje taj premium tech izgled.
- **Efekti**: Dodajemo *Glassmorphism* (zamućene providne pozadine) za Mobile Nav, Header i dijaloge, uz suptilne `1px` ivice i difuzne senke umesto grubih "solid" linija.

### 2. Responzivnost i Mobile-First
- **MergedTable & HistoryTable**: Tabele su katastrofa na telefonu. Pravim **hibridni prikaz**:
  - *Na telefonu*: Svaki proizvod postaje prelepa **kartica (Card)** sa velikim, jasnim brojevima i lako tap-abilnim poljem za cenu.
  - *Na desktopu*: Zadržavamo prefinjenu tabelu, ali pročišćenu (bez ružnih linija, više prostora oko sadržaja).
- **Mobile Nav**: Trenutni donji meni pretvaramo u lebdeći "Dock" u stilu iOS-a (zaobljene ivice, lebdi malo iznad dna ekrana, zamućena pozadina) koji izgleda vrhunski.

### 3. Komponente i Detalji
- **Upload Zona (Dropzone)**: Dobiće fluidnu animaciju, isprekidane ivice koje svetle pri prevlačenju fajla, i bolji feedback.
- **Dugmići**: Blagi prelaz (gradient) na glavnim akcijama, uz mikro-animacije (klik efekat i bounce).
- **Skeleton Loaderi**: Umesto oštrih kutija, biće soft shimmer efekti koji prate dizajn dok se podaci učitavaju.

---

## Verification Plan

### Manual Verification
- Testiraćemo zajedno izgled sa smanjenim prozorom pretraživača (mobilni mod) i preko stvarnog telefona u mreži.
- Proverićemo da li su svi elementi (tastatura, unos cene) laki za dodir (minimum 44x44px touch target).
