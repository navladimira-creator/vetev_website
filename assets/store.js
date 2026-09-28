/*
 * Úložiště rezervací.
 * - Když je v config.js vyplněná Supabase → skutečná databáze (hosté zapisují,
 *   personál po přihlášení čte a upravuje, změny se zobrazují živě).
 * - Jinak ukázkový režim v prohlížeči (localStorage) s několika vzorovými záznamy.
 *
 * Záznam: { id, kind: "table"|"pastry", date: "RRRR-MM-DD", time: "HH:MM",
 *           name, phone, email, people, items: {id: počet}, note, done, created_at }
 */
(function () {
  const C = window.VETEV_CONFIG;
  const live = !!(C.supabaseUrl && C.supabaseAnonKey && window.supabase);
  const pad = n => String(n).padStart(2, "0");
  const dkey = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());

  /* ---------- Supabase ---------- */
  function supabaseStore() {
    const sb = window.supabase.createClient(C.supabaseUrl, C.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
    const T = "reservations";
    return {
      mode: "live",
      async add(rec) {
        const { error } = await sb.from(T).insert(rec);
        if (error) throw error;
      },
      async session() {
        const { data } = await sb.auth.getSession();
        return data.session;
      },
      async login(email, password) {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      async logout() { await sb.auth.signOut(); },
      async range(from, to) {
        const { data, error } = await sb.from(T).select("*")
          .gte("date", from).lte("date", to).order("date").order("time").limit(5000);
        if (error) throw error;
        return data;
      },
      watch(onChange) {
        const ch = sb.channel("reservations-live")
          .on("postgres_changes", { event: "*", schema: "public", table: T }, () => onChange())
          .subscribe();
        return () => sb.removeChannel(ch);
      },
      async update(id, patch) {
        const { error } = await sb.from(T).update(patch).eq("id", id);
        if (error) throw error;
      },
      async remove(id) {
        const { error } = await sb.from(T).delete().eq("id", id);
        if (error) throw error;
      }
    };
  }

  /* ---------- Ukázkový režim ---------- */
  function demoStore() {
    const KEY = "vetev-demo-v1";
    const listeners = new Set();
    function read() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) { /* prohlížeč neukládá – nevadí */ }
      return seed();
    }
    function write(rows) {
      try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch (e) {}
      memory = rows;
      listeners.forEach(fn => fn());
    }
    function seed() {
      const t = new Date(), d1 = new Date(t.getTime() + 864e5), d2 = new Date(t.getTime() + 2 * 864e5);
      const mk = (o) => Object.assign({ id: "demo-" + Math.random().toString(36).slice(2, 9), done: false, demo: true, created_at: new Date().toISOString(), note: "" }, o);
      return [
        mk({ kind: "table", date: dkey(t),  time: "10:00", name: "Jana Dvořáková", phone: "+420 777 123 456", email: "jana@example.cz", people: 2, note: "Stůl u okna, pokud to půjde." }),
        mk({ kind: "table", date: dkey(t),  time: "14:30", name: "Petr Svoboda",   phone: "+420 603 555 210", email: "petr@example.cz", people: 6, note: "Oslava narozenin, přineseme vlastní dort." }),
        mk({ kind: "table", date: dkey(d1), time: "09:30", name: "Lucie Králová",  phone: "+420 728 900 111", email: "lucie@example.cz", people: 3, note: "Potřebujeme dětskou židličku." }),
        mk({ kind: "pastry", date: dkey(t), time: "08:30", name: "Martin Novák",   phone: "+420 602 444 333", email: "martin@example.cz", items: { croissant: 4, snek: 2 } }),
        mk({ kind: "pastry", date: dkey(t), time: "11:00", name: "Eva Horáková",   phone: "+420 731 222 999", email: "eva@example.cz", items: { chleb: 1, croissant: 2, bageta: 2 }, note: "Chléb prosím nakrájet." }),
        mk({ kind: "pastry", date: dkey(d2), time: "09:00", name: "Tomáš Beneš",   phone: "+420 604 111 222", email: "tomas@example.cz", items: { kolac: 12 }, note: "Na poradu do práce." })
      ];
    }
    let memory = read();
    window.addEventListener("storage", e => { if (e.key === KEY) { memory = read(); listeners.forEach(fn => fn()); } });
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

  const configured = !!(C.supabaseUrl && C.supabaseAnonKey);
  window.VetevStore = live ? supabaseStore() : configured ? brokenStore() : demoStore();
})();
