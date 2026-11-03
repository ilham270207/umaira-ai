const CACHE = "umaira-shell-v1";
const SKIP = /^\/(api|admin|gallery)(\/|$)/;
const OFFLINE =
  '<!doctype html><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1">' +
  "<title>Offline</title>" +
  '<body style="font-family:system-ui;background:#0f0a1e;color:#eee;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center">' +
  "<div><h2>Kamu sedang offline</h2><p>Sambungkan internet lalu muat ulang.</p></div>";

self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })
        );
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || req.headers.has("range")) return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin || SKIP.test(url.pathname)) return;

  e.respondWith(
    fetch(req)
      .then(function (res) {
        if (res.ok && res.type === "basic" && !res.redirected) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      })
      .catch(function () {
        return caches.match(req).then(function (hit) {
          if (hit) return hit;
          if (req.mode === "navigate") {
            return new Response(OFFLINE, { headers: { "Content-Type": "text/html; charset=utf-8" } });
          }
          return Response.error();
        });
      })
  );
});
