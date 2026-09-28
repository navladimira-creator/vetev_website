/*
 * NASTAVENÍ WEBU KAVÁRNY VĚTEV
 * ----------------------------
 * Tady se mění všechno, co se běžně upravuje: kontakty, otevírací doba,
 * nabídka pečiva a připojení k databázi. Zbytek kódu není potřeba otevírat.
 */
window.VETEV_CONFIG = {
  /* --- Databáze (Supabase) ---
   * Dokud jsou obě hodnoty prázdné, web běží v UKÁZKOVÉM REŽIMU:
   * rezervace se ukládají jen v prohlížeči, ve kterém byly odeslány.
   * Hodnoty najdete v Supabase: Project Settings → API. */
  supabaseUrl: "",
  supabaseAnonKey: "",

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
    eshop: "https://www.cafevetev.cz/"
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
    maxPeople: 12,            // víc osob = host musí zavolat
    slotMinutes: 30,          // krok časů ve formuláři
    lastTableBeforeClose: 60, // poslední rezervace stolu X minut před zavřením
    lastPickupBeforeClose: 30,// poslední vyzvednutí pečiva X minut před zavřením
    minLeadMinutes: 30,       // na dnešek nejdřív za X minut od teď
    daysAhead: 60             // jak daleko dopředu jde rezervovat
  },

  /* Nabídka pečiva k vyzvednutí.
   * !!! UKÁZKOVÁ NABÍDKA – nahraďte skutečným sortimentem a cenami. !!!
   * id = krátký kód bez mezer a diakritiky (neměnit u už použitých položek). */
  pastry: [
    { id: "croissant",  name: "Máslový croissant",   unit: "kus",        price: 45 },
    { id: "snek",       name: "Skořicový šnek",      unit: "kus",        price: 55 },
    { id: "kolac",      name: "Domácí koláč",        unit: "kus",        price: 35 },
    { id: "chleb",      name: "Kváskový chléb",      unit: "bochník",    price: 95 },
    { id: "bageta",     name: "Bageta",              unit: "kus",        price: 40 },
    { id: "banana",     name: "Banánový chlebíček",  unit: "celá forma", price: 290 }
  ]
};
