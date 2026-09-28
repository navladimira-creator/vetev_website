/*
 * NASTAVENÍ WEBU KAVÁRNY VĚTEV
 * ----------------------------
 * Tady se mění všechno, co se běžně upravuje: kontakty, otevírací doba,
 * nabídka pečiva a připojení k databázi. Zbytek kódu není potřeba otevírat.
 */
window.VETEV_CONFIG = {
  /* --- Databáze (Firebase) ---
   * Dokud je apiKey prázdný, web běží v UKÁZKOVÉM REŽIMU:
   * rezervace se ukládají jen v prohlížeči, ve kterém byly odeslány.
   * Hodnoty najdete ve Firebase: Project settings → Your apps → Web app → SDK setup and configuration → Config.
   * Tyto údaje jsou veřejné a smí být ve webu – data chrání pravidla v firebase/firestore.rules. */
  firebase: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    appId: ""
  },

  cafe: {
    name: "Větev",
    fullName: "Kavárna Větev",
    tagline: "Všude dobře, na Větvi nejlíp!",
    street: "Náměstí Mikoláše Alše 68",
    city: "398 01 Mirotice",
    phone: "+420 737 927 337",
    email: "budnavetvi@gmail.com",
    ico: "02980118",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=N%C3%A1m%C4%9Bst%C3%AD+Mikol%C3%A1%C5%A1e+Al%C5%A1e+68%2C+Mirotice",
    mapsEmbed: "https://www.google.com/maps?q=N%C3%A1m%C4%9Bst%C3%AD%20Mikol%C3%A1%C5%A1e%20Al%C5%A1e%2068%2C%20398%2001%20Mirotice&output=embed",
    facebook: "https://www.facebook.com/vetevkavarna/",
    instagram: "https://www.instagram.com/vetev_kavarna/",
    eshop: "https://www.produkty-vladimir.cz/kava/"
  },

  /* Otevírací doba. Den 0 = neděle, 1 = pondělí … 6 = sobota.
   * null = zavřeno. */
  hours: {
    1: ["08:00", "17:30"],
    2: ["08:00", "17:30"],
    3: ["08:00", "17:30"],
    4: ["08:00", "17:30"],
    5: ["08:00", "17:30"],
    6: ["09:00", "16:30"],
    0: ["09:00", "16:30"]
  },

  /* Zavřeno ve vybrané dny (svátky, dovolená) – formát "RRRR-MM-DD". */
  closedDates: [],

  reservations: {
    maxPeople: 6,             // víc osob = host musí zavolat
    slotMinutes: 30,          // krok časů ve formuláři
    lastTableBeforeClose: 60, // poslední rezervace stolu X minut před zavřením
    lastPickupBeforeClose: 30,// poslední vyzvednutí pečiva X minut před zavřením
    minLeadMinutes: 30,       // na dnešek nejdřív za X minut od teď
    daysAhead: 60             // jak daleko dopředu jde rezervovat
  },

  /* Nabídka pečiva k vyzvednutí.
   * id = krátký kód bez mezer a diakritiky (u už použitých položek neměnit).
   * desc = popis pod názvem, price = cena v Kč (null = cena se nezobrazuje). */
  pastry: [
    { id: "chleb-vetev",     name: "Chléb Větev",               desc: "pšenice, žito, kmín",          price: null },
    { id: "chleb-sestizrno", name: "Chléb Šestizrno",           desc: "pšenice, zápara ze 6 zrn",     price: null },
    { id: "chleb-maly",      name: "Chléb malý kulatý",         desc: "žito, pšenice, kmín",          price: null },
    { id: "bageta-dm",       name: "Dýňovo-mrkvová bageta",     desc: "",                             price: null },
    { id: "zemle",           name: "Jogurtovo-máslová žemle",   desc: "",                             price: null },
    { id: "loupak",          name: "Loupák",                    desc: "",                             price: null },
    { id: "coko-loupak",     name: "Čoko loupák",               desc: "",                             price: null },
    { id: "kolacky",         name: "Koláčky, různé druhy",      desc: "Náplně se liší podle nálady pekaře, přesný druh nejde objednat :-)", price: null }
  ]
};
