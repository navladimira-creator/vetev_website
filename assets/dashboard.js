/* Přehled rezervací pro personál (iPad) */
(function () {
  const U = window.VetevUtil, store = window.VetevStore;
  const $ = id => document.getElementById(id);
  const MONTHS = ["Led", "Úno", "Bře", "Dub", "Kvě", "Čvn", "Čvc", "Srp", "Zář", "Říj", "Lis", "Pro"];

  let rows = [], loadedYear = null, sel = U.today(), unwatch = null;

  function toast(msg) { const t = $("toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, 2600); }
  if (store.mode === "demo") $("demoBar").hidden = false;

  /* ---------- Přihlášení ---------- */
  async function start() {
    const s = await store.session().catch(() => null);
    if (!s) { $("loginView").hidden = false; $("dashView").hidden = true; $("lEmail").focus(); return; }
    $("loginView").hidden = true; $("dashView").hidden = false;
    $("logout").hidden = store.mode === "demo";
    if (!unwatch) unwatch = store.watch(added => { load(true); if (added && added.length) Alert.push(added); });
    await load(true);
  }
  $("loginForm").addEventListener("submit", async e => {
    e.preventDefault(); const err = $("lErr"); err.textContent = "";
    const btn = $("lSubmit"); btn.disabled = true;
    try { await store.login($("lEmail").value.trim(), $("lPass").value); $("lPass").value = ""; await start(); }
    catch (x) { err.textContent = "Přihlášení se nepovedlo. Zkontrolujte e-mail a heslo."; }
    finally { btn.disabled = false; }
  });
  $("logout").onclick = async () => { await store.logout(); if (unwatch) { unwatch(); unwatch = null; } rows = []; loadedYear = null; start(); };

  /* ---------- Data ---------- */
  async function load(force) {
    const y = sel.getFullYear();
    if (!force && y === loadedYear) { render(); return; }
    try {
      rows = await store.range(y + "-01-01", y + "-12-31");
      loadedYear = y;
      $("liveState").textContent = store.mode === "demo" ? "Ukázková data" : "Aktualizováno " + new Date().toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" }) + " · změny naskakují samy";
    } catch (e) {
      console.error(e);
      $("liveState").textContent = "Data se nepodařilo načíst. Zkontrolujte internet, zkusím to znovu za chvíli.";
    }
    render();
  }
  setInterval(() => load(true), 120000);          // pojistka, kdyby vypadlo živé spojení
  document.addEventListener("visibilitychange", () => { if (!document.hidden && !$("dashView").hidden) load(true); });

  /* ---------- Vykreslení ---------- */
  const byDate = kind => rows.reduce((m, r) => { if (r.kind === kind) (m[r.date] = m[r.date] || []).push(r); return m; }, {});

  function renderMonths() {
    const y = sel.getFullYear(); $("yLbl").textContent = y;
    const counts = Array(12).fill(0);
    rows.forEach(r => { if (r.date.startsWith(y + "-")) counts[Number(r.date.slice(5, 7)) - 1]++; });
    $("months").innerHTML = MONTHS.map((m, i) => '<button type="button" data-m="' + i + '" aria-current="' + (i === sel.getMonth()) + '">' + m +
      '<span class="c num">' + (counts[i] ? counts[i] + "×" : "&nbsp;") + '</span></button>').join("");
  }
  function renderDays() {
    const y = sel.getFullYear(), mo = sel.getMonth(), n = new Date(y, mo + 1, 0).getDate(), tk = U.key(U.today());
    const T = byDate("table"), P = byDate("pastry");
    let h = "";
    for (let d = 1; d <= n; d++) {
      const dt = new Date(y, mo, d), k = U.key(dt), wd = dt.getDay();
      const w = dt.toLocaleDateString("cs-CZ", { weekday: "short" }).replace(".", "");
      h += '<button type="button" class="day' + (k === tk ? " today" : "") + (wd === 0 || wd === 6 ? " wkend" : "") + '" data-k="' + k + '" aria-current="' + (k === U.key(sel)) + '" aria-label="' + U.esc(U.fmtLong(dt)) + '">' +
        '<span class="w">' + U.esc(w) + '</span><span class="d num">' + d + '</span><span class="dots">' + (T[k] ? '<i class="dot t"></i>' : '') + (P[k] ? '<i class="dot p"></i>' : '') + '</span></button>';
    }
    $("days").innerHTML = h;
    const cur = $("days").querySelector('[aria-current="true"]');
    if (cur) { const w = $("daysWrap"); w.scrollLeft = cur.offsetLeft - w.clientWidth / 2 + cur.clientWidth / 2; }
  }
  function actions(r) {
    return '<div class="actions">' +
      '<button type="button" class="act ok" data-act="done" data-id="' + U.esc(r.id) + '">' + (r.done ? "Vrátit" : (r.kind === "table" ? "Dorazili" : "Vydáno")) + '</button>' +
      '<button type="button" class="act" data-act="del" data-id="' + U.esc(r.id) + '">Zrušit</button></div>';
  }
  function head(r) {
    return '<div class="time num">' + U.esc(r.time) + '</div><div><div class="who">' + U.esc(r.name) + (r.demo ? '<span class="demo-tag">ukázka</span>' : '') + '</div>' +
      '<div class="meta"><span class="num">' + U.esc(r.phone) + '</span><span>' + U.esc(r.email) + '</span></div>';
  }
  function renderLists() {
    const k = U.key(sel), isToday = k === U.key(U.today());
    const h = U.hoursFor(sel);
    $("dayTitle").textContent = U.fmtLong(sel) + (isToday ? " · dnes" : "") + (h ? "" : " · zavřeno");
    const tl = rows.filter(r => r.kind === "table" && r.date === k).sort((a, b) => a.time.localeCompare(b.time));
    const pl = rows.filter(r => r.kind === "pastry" && r.date === k).sort((a, b) => a.time.localeCompare(b.time));

    const waiting = tl.filter(r => !r.done).reduce((s, r) => s + (Number(r.people) || 0), 0);
    const all = tl.reduce((s, r) => s + (Number(r.people) || 0), 0);
    $("tSum").textContent = tl.length ? tl.length + " rez. · " + all + " osob" + (waiting !== all ? " · " + waiting + " čeká" : "") : "";
    $("tList").innerHTML = tl.length ? tl.map(r => '<li class="item' + (r.done ? " is-done" : "") + '">' + head(r) +
      (r.note ? '<div class="note">' + U.esc(r.note) + '</div>' : '') +
      '<div style="margin-top:8px"><span class="pax num">' + U.esc(r.people) + ' os.</span></div></div>' + actions(r) + '</li>').join("")
      : '<li class="empty">Na tento den nejsou žádné rezervace stolů.</li>';

    const totals = {};
    pl.filter(r => !r.done).forEach(r => { for (const i in (r.items || {})) totals[i] = (totals[i] || 0) + Number(r.items[i]); });
    const keys = Object.keys(totals).filter(i => totals[i] > 0);
    $("prep").hidden = !keys.length;
    $("prepList").innerHTML = keys.map(i => '<li><b class="num">' + totals[i] + '×</b>' + U.esc(U.pastryById[i] ? U.pastryById[i].name : i) + '</li>').join("");
    $("pSum").textContent = pl.length ? pl.length + " objednávek" : "";
    $("pList").innerHTML = pl.length ? pl.map(r => '<li class="item' + (r.done ? " is-done" : "") + '">' + head(r) +
      '<div class="goods">' + Object.entries(r.items || {}).map(([i, n]) => { const off = !U.bakedOn(U.pastryById[i], U.fromKey(r.date)); return '<span class="chip num' + (off ? ' warn' : '') + '"' + (off ? ' title="V tento den se obvykle nepeče"' : '') + '>' + (off ? '⚠ ' : '') + U.esc(n) + '× ' + U.esc(U.pastryById[i] ? U.pastryById[i].name : i) + '</span>'; }).join("") + '</div>' +
      (r.note ? '<div class="note">' + U.esc(r.note) + '</div>' : '') + '</div>' + actions(r) + '</li>').join("")
      : '<li class="empty">Na tento den není objednané žádné pečivo.</li>';
  }
  function render() { if ($("dashView").hidden) return; renderMonths(); renderDays(); renderLists(); }
  function setSel(d) { const yChanged = d.getFullYear() !== sel.getFullYear(); sel = d; if (yChanged) load(false); else render(); }

  /* ---------- Ovládání ---------- */
  $("months").addEventListener("click", e => { const b = e.target.closest("[data-m]"); if (!b) return;
    const m = Number(b.dataset.m), y = sel.getFullYear(), last = new Date(y, m + 1, 0).getDate();
    setSel(new Date(y, m, Math.min(sel.getDate(), last))); });
  $("days").addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (b) setSel(U.fromKey(b.dataset.k)); });
  $("yPrev").onclick = () => setSel(new Date(sel.getFullYear() - 1, sel.getMonth(), 1));
  $("yNext").onclick = () => setSel(new Date(sel.getFullYear() + 1, sel.getMonth(), 1));
  const shift = n => setSel(new Date(sel.getFullYear(), sel.getMonth(), sel.getDate() + n));
  $("dPrev").onclick = () => shift(-1); $("dNext").onclick = () => shift(1); $("goToday").onclick = () => setSel(U.today());
  document.addEventListener("keydown", e => { if ($("dashView").hidden || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === "ArrowLeft") shift(-1); if (e.key === "ArrowRight") shift(1); });
  let sx = null, sy = null;
  $("swipeArea").addEventListener("touchstart", e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  $("swipeArea").addEventListener("touchend", e => { if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) shift(dx < 0 ? 1 : -1); sx = null; }, { passive: true });

  const armed = new Set();
  document.addEventListener("click", async e => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const r = rows.find(x => String(x.id) === b.dataset.id); if (!r) return;
    if (b.dataset.act === "del" && !armed.has(r.id)) {
      armed.add(r.id); b.textContent = "Opravdu zrušit?"; b.classList.add("warn");
      setTimeout(() => { if (armed.delete(r.id)) { b.textContent = "Zrušit"; b.classList.remove("warn"); } }, 4000);
      return;
    }
    b.disabled = true;
    try {
      if (b.dataset.act === "done") await store.update(r.id, { done: !r.done });
      else { armed.delete(r.id); await store.remove(r.id); toast("Rezervace zrušena"); }
      await load(true);
    } catch (x) { console.error(x); toast("Změnu se nepodařilo uložit. Zkuste to znovu."); b.disabled = false; }
  });

  /* ---------- Upozornění na novou rezervaci: zvuk + banner ---------- */
  const Alert = (function () {
    let ctx = null, queue = [], ringTimer = null, ringStop = 0, wake = null;
    const baseTitle = document.title;
    let soundOn = true;
    try { soundOn = localStorage.getItem("vetev-sound") !== "off"; } catch (e) {}

    // Safari zvuk pustí až po prvním klepnutí na obrazovku – odemkneme ho při jakémkoli dotyku
    function unlock() {
      try {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === "suspended") ctx.resume();
        const o = ctx.createOscillator(), g = ctx.createGain(); g.gain.value = 0; o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.01);
      } catch (e) {}
      keepAwake();
      paintBtn();
    }
    ["pointerdown", "touchstart", "keydown"].forEach(ev => document.addEventListener(ev, unlock, { passive: true }));

    // Obrazovka iPadu nezhasne, dokud je přehled otevřený (když to zařízení umí)
    async function keepAwake() {
      if (wake || !("wakeLock" in navigator) || document.hidden) return;
      try { wake = await navigator.wakeLock.request("screen"); wake.addEventListener("release", () => { wake = null; }); } catch (e) {}
    }
    document.addEventListener("visibilitychange", () => { if (!document.hidden) keepAwake(); });

    function chime() {
      if (!soundOn || !ctx || ctx.state !== "running") return;
      const t0 = ctx.currentTime;
      [[880, 0], [1175, 0.18], [1568, 0.36]].forEach(([f, d]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0 + d); g.gain.exponentialRampToValueAtTime(0.5, t0 + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.9);
        o.connect(g).connect(ctx.destination); o.start(t0 + d); o.stop(t0 + d + 1);
      });
    }
    function describe(r) {
      const when = U.fmtLong(U.fromKey(r.date)) + ", " + r.time;
      if (r.kind === "table") return { k: "Nová rezervace stolu", t: r.name + " · " + r.people + " os.", w: when };
      const n = Object.values(r.items || {}).reduce((a, b) => a + Number(b), 0);
      return { k: "Nová objednávka pečiva", t: r.name + " · " + n + " ks", w: "Vyzvednutí " + when.charAt(0).toLowerCase() + when.slice(1) };
    }
    function paint() {
      const box = $("alertBox");
      if (!queue.length) { box.hidden = true; document.title = baseTitle; return; }
      const r = queue[0], d = describe(r);
      $("alertKind").textContent = d.k + (queue.length > 1 ? " (+" + (queue.length - 1) + " další)" : "");
      $("alertWho").textContent = d.t; $("alertWhen").textContent = d.w;
      box.classList.toggle("p", r.kind === "pastry");
      box.hidden = false;
      document.title = "(" + queue.length + ") " + baseTitle;
    }
    function push(list) {
      list.forEach(r => { if (!queue.some(q => q.id === r.id)) queue.push(r); });
      paint(); chime();
      // dokud to nikdo nepotvrdí, připomene se zvukem každých 20 s (nejdéle 10 minut)
      ringStop = Date.now() + 10 * 60 * 1000;
      clearInterval(ringTimer);
      ringTimer = setInterval(() => { if (!queue.length || Date.now() > ringStop) { clearInterval(ringTimer); return; } chime(); }, 20000);
    }
    function ack(show) {
      const r = queue.shift();
      if (show && r) setSel(U.fromKey(r.date));
      if (!queue.length) clearInterval(ringTimer);
      paint();
    }
    $("alertShow").onclick = () => ack(true);
    $("alertOk").onclick = () => ack(false);

    function paintBtn() {
      const b = $("soundBtn"), ready = ctx && ctx.state === "running";
      b.textContent = !soundOn ? "🔕 Zvuk vypnutý" : ready ? "🔔 Zvuk zapnutý" : "🔔 Klepněte pro zvuk";
      b.classList.toggle("off", !soundOn || !ready);
    }
    $("soundBtn").onclick = () => {
      soundOn = !soundOn;
      try { localStorage.setItem("vetev-sound", soundOn ? "on" : "off"); } catch (e) {}
      paintBtn(); if (soundOn) chime();
    };
    paintBtn();
    return { push, test: () => push([{ id: "test-" + Date.now(), kind: "table", date: U.key(U.today()), time: "10:00", name: "Zkušební upozornění", people: 2 }]) };
  })();

  /* O půlnoci posunout „dnes“ */
  let lastDay = U.key(U.today());
  setInterval(() => { const k = U.key(U.today()); if (k !== lastDay) { if (U.key(sel) === lastDay) sel = U.today(); lastDay = k; load(true); } }, 60000);

  start();
})();
