/*
 * Úložiště rezervací.
 * - Když je v config.js vyplněný Firebase → skutečná databáze (hosté zapisují,
 *   personál po přihlášení čte a upravuje, změny se zobrazují živě).
 * - Jinak ukázkový režim v prohlížeči (localStorage) s několika vzorovými záznamy.
 *
 * Záznam: { id, kind: "table"|"pastry", date: "RRRR-MM-DD", time: "HH:MM",
 *           name, phone, email, people, items: {id: počet}, note, done, created_at }
 */
(function () {
  const C = window.VETEV_CONFIG;
  const F = C.firebase || {};
  const configured = !!(F.apiKey && F.projectId);
  const live = configured && !!(window.firebase && firebase.firestore);
  const pad = n => String(n).padStart(2, "0");
  const dkey = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());

  /* ---------- Firebase (Firestore) ---------- */
  function firebaseStore() {
    firebase.initializeApp(F);
    const db = firebase.firestore();
    const auth = firebase.auth ? firebase.auth() : null;   // přihlášení jen na stránce pro personál
    const col = db.collection("reservations");
    const toRow = d => { const x = d.data(); return Object.assign({}, x, { id: d.id, created_at: x.created_at && x.created_at.toDate ? x.created_at.toDate().toISOString() : null }); };
    const authReady = auth ? new Promise(res => { const off = auth.onAuthStateChanged(u => { off(); res(u); }); }) : Promise.resolve(null);
    return {
      mode: "live",
      async add(rec) {
        await col.add(Object.assign({}, rec, { done: false, created_at: firebase.firestore.FieldValue.serverTimestamp() }));
      },
      async session() { await authReady; return auth && auth.currentUser; },
      async login(email, password) { await auth.signInWithEmailAndPassword(email, password); },
      async logout() { if (auth) await auth.signOut(); },
      async range(from, to) {
        const snap = await col.where("date", ">=", from).where("date", "<=", to).get();
        return snap.docs.map(toRow);
      },
      watch(onChange) {
        // hlídá rezervace od minulého měsíce dál – nová rezervace nebo změna z jiného zařízení se hned projeví
        const since = new Date(); since.setDate(since.getDate() - 31);
        let first = true;
        return col.where("date", ">=", dkey(since)).onSnapshot(
          snap => {
            if (first) { first = false; return; }
            // nové rezervace (ne ty, které právě uložilo tohle zařízení)
            const added = snap.docChanges().filter(c => c.type === "added" && !c.doc.metadata.hasPendingWrites).map(c => toRow(c.doc));
            onChange(added);
          },
          err => console.error("Živé spojení:", err));
      },
      async update(id, patch) { await col.doc(id).update(patch); },
      async remove(id) { await col.doc(id).delete(); }
    };
  }

  /* ---------- Ukázkový režim ---------- */
  function demoStore() {
    const KEY = "vetev-demo-v2";
    const listeners = new Set();
    function read() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) { /* prohlížeč neukládá – nevadí */ }
      const s = seed();
      try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
      return s;
    }
    function write(rows) {
      try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch (e) {}
      memory = rows;
      listeners.forEach(fn => fn([]));
    }
    function seed() {
      const t = new Date(), d1 = new Date(t.getTime() + 864e5), d2 = new Date(t.getTime() + 2 * 864e5);
      const mk = (o) => Object.assign({ id: "demo-" + Math.random().toString(36).slice(2, 9), done: false, demo: true, created_at: new Date().toISOString(), note: "" }, o);
      return [
        mk({ kind: "table", date: dkey(t),  time: "10:00", name: "Jana Dvořáková", phone: "+420 777 123 456", email: "jana@example.cz", people: 2, note: "Stůl u okna, pokud to půjde." }),
        mk({ kind: "table", date: dkey(t),  time: "14:30", name: "Petr Svoboda",   phone: "+420 603 555 210", email: "petr@example.cz", people: 5, note: "Oslava narozenin, přineseme vlastní dort." }),
        mk({ kind: "table", date: dkey(d1), time: "09:30", name: "Lucie Králová",  phone: "+420 728 900 111", email: "lucie@example.cz", people: 3, note: "Potřebujeme dětskou židličku." }),
        mk({ kind: "pastry", date: dkey(t), time: "08:30", name: "Martin Novák",   phone: "+420 602 444 333", email: "martin@example.cz", items: { loupak: 4, "coko-loupak": 2 } }),
        mk({ kind: "pastry", date: dkey(t), time: "11:00", name: "Eva Horáková",   phone: "+420 731 222 999", email: "eva@example.cz", items: { "chleb-vetev": 1, zemle: 6, "bageta-dm": 1 }, note: "Chléb prosím nakrájet." }),
        mk({ kind: "pastry", date: dkey(d2), time: "09:00", name: "Tomáš Beneš",   phone: "+420 604 111 222", email: "tomas@example.cz", items: { kolacky: 12 }, note: "Na poradu do práce." })
      ];
    }
    let memory = read();
    window.addEventListener("storage", e => { if (e.key === KEY) {
      const known = new Set(memory.map(r => r.id)); memory = read();
      const added = memory.filter(r => !known.has(r.id));
      listeners.forEach(fn => fn(added)); } });
    return {
      mode: "demo",
      async add(rec) { write(memory.concat([Object.assign({ id: "r-" + Date.now().toString(36), done: false, created_at: new Date().toISOString() }, rec)])); },
      async session() { return { demo: true }; },
      async login() {},
      async logout() {},
      async range(from, to) { return memory.filter(r => r.date >= from && r.date <= to); },
      watch(fn) { listeners.add(fn); return () => listeners.delete(fn); },
      async update(id, patch) { write(memory.map(r => r.id === id ? Object.assign({}, r, patch) : r)); },
      async remove(id) { write(memory.filter(r => r.id !== id)); }
    };
  }

  /* Databáze je nastavená, ale knihovna se nenačetla (výpadek sítě) → neukládat potichu do prohlížeče */
  function brokenStore() {
    const fail = async () => { throw new Error("Databázi se nepodařilo načíst. Zkontrolujte připojení k internetu."); };
    return { mode: "offline", add: fail, session: async () => null, login: fail, logout: async () => {}, range: fail, watch: () => () => {}, update: fail, remove: fail };
  }

  window.VetevStore = live ? firebaseStore() : configured ? brokenStore() : demoStore();
})();
