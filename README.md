# Web kavárny Větev s rezervacemi

Web kavárny Větev (Mirotice) s online rezervací **stolů** a **pečiva k vyzvednutí**. Pro personál je k němu přehled rezervací na iPad.

| Soubor | Co to je |
|---|---|
| `index.html` | Web pro hosty: úvod, o kavárně, rezervace, otevírací doba, kontakt, mapa |
| `dashboard.html` | Přehled pro personál. Na iPadu se ukládá jako ikona na plochu |
| `assets/config.js` | **Nastavení.** Kontakty, otevírací doba, nabídka pečiva, připojení k databázi |
| `firebase/firestore.rules` | Bezpečnostní pravidla databáze (vkládají se jednou do Firebase) |

Dokud není připojená databáze, web běží v **ukázkovém režimu**: rezervace se ukládají jen v prohlížeči, ze kterého byly odeslány.

---

## 1. Zveřejnění webu (GitHub Pages, zdarma)

1. Na GitHubu otevřete repozitář `vetev_website` → **Settings** → **Pages**.
2. Nastavte **Source: Deploy from a branch**, **Branch: `main`**, složka **`/ (root)`** a klikněte na **Save**.
3. Za 1–2 minuty bude web na adrese `https://navladimira-creator.github.io/vetev_website/`.

Vlastní doménu (např. `cafevetev.cz`) jde připojit později ve stejném místě pod **Custom domain**.

## 2. Databáze (Firebase od Googlu, zdarma, nikdy se neuspí)

1. Otevřete [console.firebase.google.com](https://console.firebase.google.com) a přihlaste se Google účtem kavárny. Klikněte na **Create a project** a zadejte název `vetev-rezervace`. Google Analytics můžete vypnout.
2. **Databáze:** v levém menu zvolte **Build → Firestore Database → Create database**. Jako umístění vyberte **eur3 (Europe)** nebo **europe-west3 (Frankfurt)**, dále **Start in production mode → Create**.
3. **Pravidla:** ve Firestore otevřete záložku **Rules**, smažte vše, co tam je, vložte celý obsah souboru `firebase/firestore.rules` a klikněte na **Publish**.
   - V pravidlech je e-mail personálu `budnavetvi@gmail.com`. Pokud se bude přihlašovat jiný, změňte ho.
4. **Přihlášení personálu:** zvolte **Build → Authentication → Get started → Email/Password → Enable → Save**. Potom na záložce **Users → Add user** zadejte e-mail personálu (stejný jako v pravidlech) a heslo.
5. **Připojení webu:** klikněte na ozubené kolo **⚙ → Project settings**, dole v části **Your apps** klikněte na ikonu **</>** (Web), zadejte název `web` a klikněte na **Register app**. Zobrazí se `firebaseConfig`. Hodnoty `apiKey`, `authDomain`, `projectId` a `appId` zkopírujte do `assets/config.js`:
   ```js
   firebase: {
     apiKey: "AIza…",
     authDomain: "vetev-rezervace.firebaseapp.com",
     projectId: "vetev-rezervace",
     appId: "1:…:web:…"
   },
   ```
   Tyto údaje jsou veřejné a smí být ve webu. Data chrání pravidla z kroku 3.
6. **Authentication → Settings → Authorized domains → Add domain**: přidejte `navladimira-creator.github.io`, případně později i vlastní doménu.

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
- **Nabídka pečiva** (`pastry`): názvy, složení a případně ceny.
- **Pravidla rezervací** (`reservations`): max. počet osob (při změně upravte i limit v `firebase/firestore.rules`), jak dlouho dopředu, poslední čas před zavřením.

## Bezpečnost

- Host z webu může rezervaci jen **vložit**. Cizí rezervace nikdy nevidí.
- Číst, označovat a rušit rezervace může jen přihlášený účet, jehož e-mail je uvedený v pravidlech (`firebase/firestore.rules`).
- Repozitář je veřejný, takže je v něm vidět kód. Hesla ani tajné klíče v něm nejsou a být nesmí.

## Stav projektu (28. 9. 2026)

**Hotovo:** web kavárny s rezervací stolů (max. 6 osob) a pečiva, přehled pro personál na iPad, databáze Firebase (projekt `vetev-rezervace`, Frankfurt), přihlášení personálu `budnavetvi@gmail.com`. Web běží na GitHub Pages.

**Nápady na další kroky:**
- upozornění personálu na novou rezervaci (e-mail / zpráva do telefonu),
- fotky kavárny a pečiva na úvodní stránku,
- ceny pečiva (`price` v `assets/config.js`),
- vlastní doména (např. rezervace.cafevetev.cz),
- šablona systému pro klienty Vladimír PRO.

**Tip pro práci s Claudem:** v novém chatu stačí napsat „pokračujeme na webu kavárny Větev, repozitář `navladimira-creator/vetev_website`“. Všechno podstatné je v tomto repozitáři.
