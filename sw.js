// Viajá Seguro TDF – funciona sin conexión.
// Al actualizar las páginas, cambiá el número de versión para refrescar todo.
const VERSION = 'viaja-seguro-v26';
const CORE = ['./', 'index.html', 'verano.html', 'invierno.html', 'gps.html', 'en-index.html', 'en-verano.html', 'en-invierno.html', 'en-gps.html', 'pt-index.html', 'pt-verano.html', 'pt-invierno.html', 'pt-gps.html', 'img-bomberos.png', 'img-calzada.png', 'img-card_inv.webp', 'img-card_ver.webp', 'img-ciclista.svg', 'img-clima.png', 'img-conect.png', 'img-curvas.png', 'img-dc.png', 'img-distancia.png', 'img-equipo.png', 'img-f_arboles.png', 'img-f_basura.png', 'img-f_celu.png', 'img-f_estufa.png', 'img-fauna.svg', 'img-g_estufa.png', 'img-grupo.png', 'img-hero.webp', 'img-hero_inv.webp', 'img-hiker.png', 'img-horarios.png', 'img-informa.png', 'img-logo.webp', 'img-luces.png', 'img-maniobras.png', 'img-med.png', 'img-neumatico.png', 'img-noche.png', 'img-parabrisas.png', 'img-planifica.png', 'img-radio.png', 'img-ropa.png', 'img-senal.png', 'img-tel.png', 'img-velocidad.png', 'img-w_abrigo.png', 'img-w_accidente_radio.png', 'img-w_acercarse.png', 'img-w_cadenas.png', 'img-w_checklist.png', 'img-w_clima_w.png', 'img-w_combustible.png', 'img-w_crucero.png', 'img-w_desperfectos.png', 'img-w_nieve_rueda.png', 'img-w_no_detenerse.png', 'img-w_noche_reloj.png', 'img-w_personal.png', 'img-w_volante.png', 'icon-192.png', 'manifest.webmanifest', 'en-icon-192.png', 'en-manifest.webmanifest', 'pt-icon-192.png', 'pt-manifest.webmanifest', 'tdf.json', 'graph.json', 'leaflet.js', 'leaflet.css'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!sameOrigin && !fonts) return;

  // Páginas: primero la red (para tener lo último), si no hay señal, la copia guardada.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then(r => r || caches.match('index.html')))
    );
    return;
  }
  // Resto (íconos, tipografías): primero la copia guardada, y se actualiza en segundo plano.
  e.respondWith(
    caches.match(req).then(cached => {
      const net = fetch(req).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; }).catch(() => cached);
      return cached || net;
    })
  );
});
