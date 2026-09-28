# Kontext projektu: Web kavárny Větev s rezervačním systémem

*Stav k 28. 9. 2026. Soubor slouží jako podklad pro Clauda v novém projektu nebo chatu.*

## Kdo a proč
- **Majitel:** Vladimír, podnikatel a konzultant v gastronomii (značka **Vladimír PRO**). S AI a kódem začíná, neprogramuje sám.
- **Jak s ním pracovat:** komunikace **česky**, prakticky a konkrétně, bez žargonu. Návody krok za krokem s přesnými názvy tlačítek. Hesla nikdy nechtít ani neukládat.
- **Cíl:** web kavárny Větev s online rezervací stolů a pečiva a s přehledem pro personál na iPadu. Později z toho udělat **šablonu pro klienty Vladimír PRO**.

## Kavárna
- **Kavárna Větev**, kavárna, pražírna, pekárna a prodejna
- Náměstí Mikoláše Alše 68, 398 01 Mirotice · tel. +420 737 927 337 · budnavetvi@gmail.com · IČO 02980118
- Otevřeno: Po–Pá 8:00–17:30, So–Ne 9:00–16:30
- Motto: „Všude dobře, na Větvi nejlíp!“
- Facebook: facebook.com/vetevkavarna · Instagram: @vetev_kavarna
- E-shop s kávou: https://www.produkty-vladimir.cz/kava/
- Původní web (Shoptet): https://www.cafevetev.cz

## Kde co běží
| Co | Kde |
|---|---|
| Kód webu | GitHub, veřejný repozitář **`navladimira-creator/vetev_website`**, větev `main` |
| Web pro hosty | https://navladimira-creator.github.io/vetev_website/ |
| Přehled pro personál | https://navladimira-creator.github.io/vetev_website/dashboard.html |
| Hosting | GitHub Pages, zdarma. Každý push do `main` se nasadí do 1–2 minut |
| Databáze + přihlášení | **Firebase** (Google), projekt **`vetev-rezervace`**, Firestore v Evropě, bezplatný tarif Spark |
| Účet personálu | Firebase Authentication, e-mail + heslo, `budnavetvi@gmail.com` (heslo zná jen Vladimír) |

## Jak systém funguje
Host na webu vyplní formulář. Rezervace se uloží do Firestore (kolekce `reservations`). iPad v kavárně ji načte živě, bez obnovování stránky.

- **Stránka pro hosty (`index.html`):** úvod s tím, zda je právě otevřeno, sekce kavárna / pražírna / pekárna, rezervace se dvěma záložkami, otevírací doba, kontakt a mapa.
  - **Stůl:** datum, čas (jen v otevírací době, nejpozději 60 min před zavřením), počet osob **1–6**, jméno a příjmení, telefon, e-mail, speciální požadavek.
  - **Pečivo k vyzvednutí:** výběr kusů, den a čas vyzvednutí, kontakt, poznámka. Ceny se zatím nezobrazují.
- **Přehled pro personál (`dashboard.html`):** přihlášení, nahoře lišta 12 měsíců (s počtem rezervací), pod ní dny v měsíci. Mezi dny se přechází tažením prstu. Vlevo stoly, vpravo pečivo se souhrnem „Připravit na tento den“. Tlačítka Dorazili / Vydáno a Zrušit (s potvrzením). Na iPadu se ukládá přes Safari → Sdílet → Přidat na plochu.

## Soubory v repozitáři
- `index.html`: web pro hosty
- `dashboard.html`: přehled pro personál
- `assets/config.js`: **veškeré nastavení** (Firebase údaje, kontakty, otevírací doba, zavřené dny, pravidla rezervací, nabídka pečiva)
- `assets/store.js`: práce s databází (Firebase, bez nastavení běží ukázkový režim v prohlížeči)
- `assets/site.js`, `assets/dashboard.js`, `assets/common.js`, `assets/styles.css`
- `firebase/firestore.rules`: bezpečnostní pravidla (ručně vložená ve Firebase → Firestore → Rules)
- `manifest.webmanifest`, `assets/icon-*.png`: ikona na plochu iPadu
- `README.md`: návod k nastavení a úpravám

## Nabídka pečiva (v `assets/config.js`)
Chléb Větev (pšenice, žito, kmín) · Chléb Šestizrno (pšenice, zápara ze 6 zrn) · Chléb malý kulatý (žito, pšenice, kmín) · Dýňovo-mrkvová bageta · Jogurtovo-máslová žemle · Loupák · Čoko loupák · Koláčky, různé druhy (náplně podle nálady pekaře, nelze přesně objednat)

## Důležitá rozhodnutí a proč
- **Firebase místo Supabase:** bezplatný Supabase se po 7 dnech nečinnosti uspí. Rezervace budou ze začátku málo využívané, Firebase se neuspává.
- **Veřejný repozitář:** GitHub Pages zdarma vyžaduje veřejný repozitář. V kódu nejsou žádná tajná data. Firebase údaje v `config.js` jsou veřejné z principu, data chrání pravidla.
- **Bezpečnost:** host smí rezervaci jen vytvořit, nikdy nic nečte. Číst, měnit a mazat smí jen přihlášený e-mail uvedený ve `firestore.rules` (funkce `isStaff`). Pravidla hlídají i formát dat a max. 6 osob.
- **Web hostům vyká.** Vladimír u jednoho textu psal tykání, ale kvůli jednotnosti zůstalo vykání. Kdyby chtěl tykat, je potřeba přepsat celý web.
- **Verze u souborů (`?v=…`):** po každé úpravě JS/CSS je potřeba zvýšit číslo verze v `index.html` a `dashboard.html`, jinak prohlížeče drží starou kopii.

## Postup při úpravách (pro Clauda)
1. Připojit repozitář `navladimira-creator/vetev_website` a naklonovat ho.
2. Upravit soubory. Běžné změny se dělají v `assets/config.js`.
3. Při změně JS/CSS zvýšit `?v=` v obou HTML souborech.
4. Při změně pravidel (např. počet osob) upravit i `firebase/firestore.rules` a poslat Vladimírovi text k vložení do Firebase → Firestore → Rules → Publish.
5. Commit a push do `main`. Web se aktualizuje do 1–2 minut. Uživateli připomenout tvrdé obnovení (Ctrl/Cmd + Shift + R).
6. Pracovní prostor Clauda se nedostane na servery Firebase ani Googlu, takže živé testy dělá Vladimír. Lokálně jde testovat v ukázkovém režimu, když se v `config.js` dočasně vyprázdní `apiKey`.

## Poznámky z nastavování
- Ve Firebase konzoli se menu změnilo, sekce „Build“ už neexistuje. Firestore a Authentication je nejlepší hledat přes vyhledávací pole nahoře.
- Google Analytics musel být při zakládání projektu zapnutý. Nevadí to.
- Doména `navladimira-creator.github.io` je přidaná v Authentication → Settings → Authorized domains. Při vlastní doméně je potřeba přidat i ji.

## Směr do budoucna: jednotná provozní aplikace „Větev provoz“
Vladimír chce postupně přidávat další systémy (jako další **rozpis směn**) a mít je všechny **v jedné aplikaci**, podobně jako v CRM. Dohodnutá pravidla:

1. **Jedna aplikace, jedna ikona.** Po přihlášení je menu se sekcemi **Rezervace · Směny · …** a každý systém je jeden modul. Veřejný web pro hosty (`index.html`) zůstává samostatně.
2. **Jeden Firebase projekt pro vše:** `vetev-rezervace`. Pro nové moduly se nezakládají nové projekty. Každý modul má vlastní kolekci ve Firestore (např. `reservations`, `shifts`, `employees`).
3. **Vlastní účty a role.** Při stavbě směn se přejde ze společného účtu na účet pro každého zaměstnance:
   - **majitel:** vidí a spravuje vše,
   - **vedoucí:** plánuje směny a spravuje rezervace,
   - **obsluha:** vidí rezervace a svoje směny.
   Role se uloží ve Firestore (kolekce `staff`/`employees`) a hlídají je pravidla v `firestore.rules`, která nahradí dnešní seznam e-mailů ve funkci `isStaff()`.
4. **Postup při stavbě směn:** z `dashboard.html` udělat společnou aplikaci s menu (rezervace = první modul) a směny přidat jako druhý modul. Nestavět je jako samostatnou věc, která by se později spojovala.
5. **Jednotný vzhled.** Nové moduly používají stejné `styles.css`, barvy, písma a ovládací prvky jako rezervace.
6. **Šablona pro klienty Vladimír PRO:** každá kavárna dostane **vlastní kopii aplikace a vlastní Firebase projekt**, ne jednu sdílenou aplikaci pro všechny. Je to jednodušší a data kaváren se nemůžou promíchat. Proto je vhodné držet všechno specifické pro kavárnu v `config.js`.
7. **Údržba:** s každým modulem roste. Stavět jednoduše a nepřidávat funkce „do zásoby“.

## Další kroky (nápady)
1. **Upozornění personálu na novou rezervaci**: e-mail nebo zpráva do telefonu (Telegram je nejjednodušší, WhatsApp vyžaduje ověření firmy u Mety).
2. **Fotky** kavárny a pečiva na úvodní stránku (Vladimír je pošle).
3. **Ceny pečiva**: pole `price` v `config.js`. Pak se zobrazí i „Celkem orientačně“.
4. **Vlastní doména**, např. rezervace.cafevetev.cz.
5. **Rozpis směn**: druhý modul v jednotné aplikaci (viz výše). Začít vlastními účty a rolemi.
6. **Šablona pro Vladimír PRO**: stejný systém pro jiné kavárny (jiný název, barvy, nabídka, vlastní Firebase projekt).
