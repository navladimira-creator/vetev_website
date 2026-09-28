/* Společné pomocné funkce pro web i dashboard */
(function () {
  const C = window.VETEV_CONFIG;
  const pad = n => String(n).padStart(2, "0");
  const key = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const fromKey = k => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const fmtLong = d => cap(d.toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" }));
  const toMin = t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const fromMin = m => pad(Math.floor(m / 60)) + ":" + pad(m % 60);
  const hoursFor = d => (C.closedDates || []).includes(key(d)) ? null : (C.hours[d.getDay()] || null);
  const DAYS = ["Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota"];
  const DAYS_SHORT = ["ne", "po", "út", "st", "čt", "pá", "so"];
  /* Pečivo: peče se v daný den? (bez "days" = každý den) */
  const bakedOn = (item, d) => !item || !Array.isArray(item.days) || !item.days.length || item.days.includes(d.getDay());
  const bakeDaysText = item => [1, 2, 3, 4, 5, 6, 0].filter(x => item.days.includes(x)).map(x => DAYS_SHORT[x]).join(", ");

  /* Vlastní značka: větvička s lístky */
  const LOGO = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="var(--green)"/>' +
    '<path d="M11 29 C17 23 22 18 29 11" stroke="var(--green-ink)" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
    '<path d="M17 23 C13 21 12 17 13 14 C17 15 19 19 17 23Z M22 18 C24 14 28 13 30 14 C29 18 25 20 22 18Z M24 16 C22 12 23 9 25 7 C27 10 27 13 24 16Z" fill="var(--green-ink)"/></svg>';

  window.VetevUtil = { C, pad, key, fromKey, today, esc, fmtLong, toMin, fromMin, hoursFor, DAYS, DAYS_SHORT, bakedOn, bakeDaysText, LOGO,
    pastryById: Object.fromEntries(C.pastry.map(p => [p.id, p])) };

  document.querySelectorAll("[data-logo]").forEach(el => { el.innerHTML = LOGO; });
})();
