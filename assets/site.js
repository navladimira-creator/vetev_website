/* Web kavárny: otevírací doba, kontakty a rezervační formuláře */
(function () {
  const U = window.VetevUtil, C = U.C, R = C.reservations, store = window.VetevStore;
  const $ = id => document.getElementById(id);

  if (store.mode === "demo") $("demoBar").hidden = false;
  $("year").textContent = new Date().getFullYear();

  /* ---------- Kontakty z nastavení ---------- */
  document.querySelectorAll("[data-bind]").forEach(el => { const v = C.cafe[el.dataset.bind]; if (v) el.textContent = v; });
  document.querySelectorAll("[data-href]").forEach(el => { const v = C.cafe[el.dataset.href]; if (v) el.href = v; });
  $("mapFrame").src = C.cafe.mapsEmbed;

  /* ---------- Otevírací doba ---------- */
  const order = [1, 2, 3, 4, 5, 6, 0], now = new Date(), todayIdx = now.getDay();
  const fmtH = h => h ? h[0].replace(/^0/, "") + "–" + h[1].replace(/^0/, "") : "Zavřeno";
  $("hoursTable").innerHTML = order.map(d =>
    '<tr' + (d === todayIdx ? ' class="today"' : '') + '><td>' + U.DAYS[d] + (d === todayIdx ? " (dnes)" : "") + '</td><td>' + fmtH(C.hours[d]) + '</td></tr>').join("");
  const th = U.hoursFor(now), mins = now.getHours() * 60 + now.getMinutes();
  const isOpen = th && mins >= U.toMin(th[0]) && mins < U.toMin(th[1]);
  $("openState").classList.toggle("open", !!isOpen);
  $("openState").lastElementChild.textContent = isOpen ? "Právě máme otevřeno" : "Teď máme zavřeno";
  $("todayHours").textContent = th ? "Dnes " + fmtH(th) : "Dnes zavřeno";

  /* ---------- Časy ve formuláři ---------- */
  function fillSlots(dateId, selId, noteId, beforeClose, fallback) {
    const sel = $(selId), note = $(noteId), val = $(dateId).value;
    const prev = sel.value; sel.innerHTML = "";
    if (!val) return;
    const d = U.fromKey(val), h = U.hoursFor(d);
    let list = [];
    if (h) {
      const start = U.toMin(h[0]), end = U.toMin(h[1]) - beforeClose;
      let min = start;
      if (val === U.key(U.today())) {
        const n = new Date(), nowM = n.getHours() * 60 + n.getMinutes() + R.minLeadMinutes;
        min = Math.max(start, Math.ceil(nowM / R.slotMinutes) * R.slotMinutes);
      }
      for (let m = min; m <= end; m += R.slotMinutes) list.push(U.fromMin(m));
    }
    list.forEach(v => { const o = document.createElement("option"); o.value = v; o.textContent = v; sel.appendChild(o); });
    sel.disabled = !list.length;
    note.hidden = !!list.length;
    if (!list.length) note.textContent = h ? "Na dnešek už volné časy nejsou. Vyberte prosím jiný den." : "V tento den máme zavřeno. Vyberte prosím jiný den.";
    if (list.includes(prev)) sel.value = prev; else if (list.includes(fallback)) sel.value = fallback;
  }
  const minD = U.key(U.today()), maxD = U.key(new Date(Date.now() + R.daysAhead * 864e5));
  function firstOpenDay(beforeClose) {
    for (let i = 0; i <= R.daysAhead; i++) {
      const d = new Date(U.today().getTime() + i * 864e5), h = U.hoursFor(d);
      if (!h) continue;
      if (i === 0) { const n = new Date(); if (n.getHours() * 60 + n.getMinutes() + R.minLeadMinutes > U.toMin(h[1]) - beforeClose) continue; }
      return U.key(d);
    }
    return minD;
  }
  function setupDate(p, beforeClose, fallback) {
    const di = $(p + "Date"); di.min = minD; di.max = maxD; di.value = firstOpenDay(beforeClose);
    const run = () => fillSlots(p + "Date", p + "Time", p + "Closed", beforeClose, fallback);
    di.addEventListener("change", run); run();
    return run;
  }
  const refreshT = setupDate("t", R.lastTableBeforeClose, "10:00");
  const refreshP = setupDate("p", R.lastPickupBeforeClose, "09:00");

  /* ---------- Počet osob ---------- */
  let pax = 2;
  function setPax(n) { pax = Math.max(1, Math.min(R.maxPeople, n)); $("tPax").textContent = pax; $("tMinus").disabled = pax <= 1; $("tPlus").disabled = pax >= R.maxPeople; }
  $("tMinus").onclick = () => setPax(pax - 1); $("tPlus").onclick = () => setPax(pax + 1); setPax(2);

  /* ---------- Nabídka pečiva ---------- */
  const qty = {};
  const kc = n => n.toLocaleString("cs-CZ") + " Kč";
  function total() { let s = 0; for (const k in qty) s += qty[k] * (U.pastryById[k].price || 0); $("pTotal").textContent = kc(s); }
  C.pastry.forEach(m => {
    qty[m.id] = 0;
    const row = document.createElement("div"); row.className = "menu-item";
    row.innerHTML = '<div><div class="n">' + U.esc(m.name) + '</div><div class="d num">' + U.esc(m.unit) + (m.price ? " · " + kc(m.price) : "") + '</div></div>' +
      '<div class="stepper"><button type="button" aria-label="Ubrat: ' + U.esc(m.name) + '">−</button><output class="num" aria-live="polite">0</output><button type="button" aria-label="Přidat: ' + U.esc(m.name) + '">+</button></div>';
    const [minus, plus] = row.querySelectorAll("button"), out = row.querySelector("output");
    const upd = () => { out.textContent = qty[m.id]; minus.disabled = qty[m.id] <= 0; total(); };
    minus.onclick = () => { qty[m.id] = Math.max(0, qty[m.id] - 1); upd(); };
    plus.onclick = () => { qty[m.id] = Math.min(99, qty[m.id] + 1); upd(); };
    m._reset = () => { qty[m.id] = 0; upd(); };
    upd(); $("menu").appendChild(row);
  });

  /* ---------- Přepínání ---------- */
  let lastTab = "t";
  function tab(w) {
    $("tabT").setAttribute("aria-selected", w === "t"); $("tabP").setAttribute("aria-selected", w === "p");
    $("formT").hidden = w !== "t"; $("formP").hidden = w !== "p"; $("done").hidden = true;
    lastTab = w;
  }
  $("tabT").onclick = () => tab("t"); $("tabP").onclick = () => tab("p");
  document.querySelectorAll("[data-open]").forEach(a => a.addEventListener("click", () => tab(a.dataset.open)));
  $("doneAgain").onclick = () => tab(lastTab);

  /* ---------- Kontrola a odeslání ---------- */
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const phoneOk = v => v.replace(/\D/g, "").length >= 9 && v.length <= 30;
  function contact(p, err) {
    const name = $(p + "Name").value.trim().replace(/\s+/g, " "), phone = $(p + "Phone").value.trim(), email = $(p + "Email").value.trim();
    const date = $(p + "Date").value, time = $(p + "Time").value;
    if (!date || date < minD || date > maxD) { err.textContent = "Vyberte prosím datum mezi dneškem a " + U.fmtLong(U.fromKey(maxD)).toLowerCase() + "."; return null; }
    if (!time) { err.textContent = "Na vybraný den není volný čas. Zvolte prosím jiný den."; return null; }
    if (name.split(" ").length < 2 || name.length < 3) { err.textContent = "Vyplňte prosím jméno i příjmení."; $(p + "Name").focus(); return null; }
    if (!phoneOk(phone)) { err.textContent = "Zkontrolujte prosím telefonní číslo."; $(p + "Phone").focus(); return null; }
    if (!emailOk(email)) { err.textContent = "Zkontrolujte prosím e-mail."; $(p + "Email").focus(); return null; }
    return { name, phone, email, date, time };
  }
  function showDone(label, title, rows) {
    $("formT").hidden = true; $("formP").hidden = true;
    $("doneLabel").textContent = label; $("doneTitle").textContent = title;
    $("doneList").innerHTML = rows.map(([a, b]) => "<dt>" + U.esc(a) + "</dt><dd>" + U.esc(b) + "</dd>").join("");
    $("done").hidden = false; $("done").focus();
  }
  async function send(rec, err, btn) {
    btn.disabled = true; const label = btn.textContent; btn.textContent = "Odesílám…";
    try { await store.add(rec); return true; }
    catch (e) { console.error(e); err.textContent = "Odeslání se nepovedlo. Zkuste to prosím znovu, případně nám zavolejte na " + C.cafe.phone + "."; return false; }
    finally { btn.disabled = false; btn.textContent = label; }
  }

  $("formT").addEventListener("submit", async e => {
    e.preventDefault(); const err = $("tErr"); err.textContent = "";
    const c = contact("t", err); if (!c) return;
    const rec = Object.assign({ kind: "table", people: pax, items: null, note: $("tNote").value.trim() }, c);
    if (await send(rec, err, $("tSubmit"))) {
      showDone("Rezervace stolu", "Děkujeme, stůl máte rezervovaný",
        [["Kdy", U.fmtLong(U.fromKey(rec.date)) + ", " + rec.time], ["Počet osob", String(rec.people)], ["Na jméno", rec.name]]);
      $("formT").reset(); setPax(2); $("tDate").value = firstOpenDay(R.lastTableBeforeClose); refreshT();
    }
  });

  $("formP").addEventListener("submit", async e => {
    e.preventDefault(); const err = $("pErr"); err.textContent = "";
    const items = {}; let n = 0;
    for (const k in qty) if (qty[k] > 0) { items[k] = qty[k]; n += qty[k]; }
    if (!n) { err.textContent = "Vyberte prosím alespoň jeden druh pečiva."; return; }
    const c = contact("p", err); if (!c) return;
    const rec = Object.assign({ kind: "pastry", people: null, items, note: $("pNote").value.trim() }, c);
    if (await send(rec, err, $("pSubmit"))) {
      const list = Object.entries(items).map(([k, q]) => q + "× " + U.pastryById[k].name).join(", ");
      showDone("Pečivo k vyzvednutí", "Děkujeme, pečivo vám připravíme",
        [["Vyzvednutí", U.fmtLong(U.fromKey(rec.date)) + ", " + rec.time], ["Objednávka", list], ["Celkem orientačně", $("pTotal").textContent], ["Na jméno", rec.name]]);
      $("formP").reset(); C.pastry.forEach(m => m._reset()); $("pDate").value = firstOpenDay(R.lastPickupBeforeClose); refreshP();
    }
  });
})();
