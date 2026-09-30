/* Service worker přehledu rezervací.
 * Nic neukládá do mezipaměti (vždy se načte nejnovější verze webu).
 * Jen když iPad/telefon nemá internet, ukáže místo chybové stránky srozumitelnou hlášku. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  if (e.request.mode !== "navigate") return;
  e.respondWith(fetch(e.request).catch(() => new Response(
    '<!doctype html><html lang="cs"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Bez internetu</title><body style="font-family:system-ui,sans-serif;padding:40px;background:#F5F6F0;color:#1B2620">' +
    '<h1 style="font-size:28px">Není připojení k internetu</h1><p>Zkontrolujte Wi-Fi. Přehled rezervací se načte znovu, jakmile bude internet.</p>' +
    '<p><button onclick="location.reload()" style="font:inherit;font-weight:700;padding:12px 20px;border-radius:12px;border:0;background:#2E5A3C;color:#fff">Zkusit znovu</button></p>',
    { headers: { "Content-Type": "text/html; charset=utf-8" } })));
});
