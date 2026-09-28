# Web kavárny Větev s rezervacemi

Web kavárny Větev (Mirotice) s online rezervací **stolů** a **pečiva k vyzvednutí**. Pro personál je k němu přehled rezervací na iPad.

| Soubor | Co to je |
|---|---|
| `index.html` | Web pro hosty: úvod, o kavárně, rezervace, otevírací doba, kontakt, mapa |
| `dashboard.html` | Přehled pro personál. Na iPadu se ukládá jako ikona na plochu |
| `assets/config.js` | **Nastavení.** Kontakty, otevírací doba, nabídka pečiva, připojení k databázi |
| `supabase/schema.sql` | Databáze a bezpečnostní pravidla (spouští se jednou v Supabase) |

Dokud není připojená databáze, web běží v **ukázkovém režimu**: rezervace se ukládají jen v prohlížeči, ze kterého byly odeslány.

---

## 1. Zveřejnění webu (GitHub Pages, zdarma)

1. Na GitHubu otevřete repozitář `vetev_website` → **Settings** → **Pages**.
2. Nastavte **Source: Deploy from a branch**, **Branch: `main`**, složka **`/ (root)`** a klikněte na **Save**.
3. Za 1–2 minuty bude web na adrese `https://navladimira-creator.github.io/vetev_website/`.

Vlastní doménu (např. `cafevetev.cz`) jde připojit později ve stejném místě pod **Custom domain**.

## 2. Databáze (Supabase, zdarma)

1. Založte účet na [supabase.com](https://supabase.com) (přihlášení přes GitHub) → **New project**. Region zvolte **Frankfurt (eu-central-1)**.
2. V projektu otevřete **SQL Editor** → **New query**, vložte celý obsah `supabase/schema.sql` a klikněte na **Run**.
   - V souboru je e-mail personálu `budnavetvi@gmail.com`. Pokud se bude přihlašovat jiný e-mail, změňte ho před spuštěním.
3. **Authentication → Users → Add user → Create new user.** Zadejte stejný e-mail a heslo pro personál a zaškrtněte *Auto Confirm User*.
4. **Authentication → Sign In / Providers → vypněte „Allow new users to sign up“**, aby si nikdo cizí nemohl založit účet.
5. **Project Settings → API (Data API)**: zkopírujte **Project URL** a klíč **anon public** do `assets/config.js`:
   ```js
   supabaseUrl: "https://xxxx.supabase.co",
   supabaseAnonKey: "eyJhbGciOi…",
   ```
   Klíč *anon* je veřejný a smí být ve webu. Klíč **service_role** do webu **nikdy nedávejte**.

Po uložení se ukázkový režim sám vypne.

## 3. Ikona na iPadu

1. Na iPadu otevřete v **Safari** `…/vetev_website/dashboard.html`.
2. Přihlaste se e-mailem a heslem personálu.
3. Klepněte na **Sdílet → Přidat na plochu**.

Přehled se pak otevírá jako samostatná aplikace a přihlášení si pamatuje.

**Ovládání přehledu:** nahoře jsou měsíce, pod nimi dny. Mezi dny se přechází tažením prstu doleva a doprava. Vlevo jsou stoly, vpravo pečivo. Souhrn „Připravit na tento den“ sečte, kolik kterého pečiva je potřeba.

## Úpravy

Všechno běžné se mění v `assets/config.js`:
- **Otevírací doba a zavřené dny** (`hours`, `closedDates`). Formulář podle nich nabízí jen časy, kdy je otevřeno.
- **Nabídka pečiva** (`pastry`). ⚠️ Zatím je tam ukázková nabídka, je potřeba ji nahradit skutečnou.
- **Pravidla rezervací** (`reservations`): max. počet osob, jak dlouho dopředu, poslední čas před zavřením.

## Bezpečnost

- Host z webu může rezervaci jen **vložit**. Cizí rezervace nikdy nevidí.
- Číst, označovat a rušit rezervace může jen přihlášený účet, jehož e-mail je v tabulce `staff`.
- Repozitář je veřejný, takže je v něm vidět kód. Hesla ani tajné klíče v něm nejsou a být nesmí.
