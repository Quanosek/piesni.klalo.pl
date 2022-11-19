const version = 6;
const cacheName = `piesni-${version}`;

const assets = [
  // główny plik HTML
  "/",
  "/index.html",

  // style
  "/styles/app.css",
  "/styles/colors.css",
  "/styles/main.css",
  "/styles/menu.css",
  "/styles/reset.css",

  // skrypty
  "/scripts/favoriteMenu.js",
  "/scripts/hymn.js",
  "/scripts/main.js",
  "/scripts/menu.js",
  "/scripts/themeMenu.js",

  // bazy danych json
  "/json/brzask.json",
  "/json/cegielki.json",
  "/json/nowe.json",
  "/json/epifania.json",
  "/json/inne.json",

  // czcionki
  "/files/fonts/Brutal Type Medium.ttf",
  "/files/fonts/Gill Sans MT.ttf",

  // ikonki
  "/files/icons/arrow.svg",
  "/files/icons/close.svg",
  "/files/icons/dice.svg",
  // "/files/icons/file.svg",
  // "/files/icons/link.svg",
  "/files/icons/monitor.svg",
  // "/files/icons/music.svg",
  // "/files/icons/printer.svg",
  "/files/icons/settings.svg",
  "/files/icons/star_empty.svg",
  "/files/icons/star_filled.svg",
  "/files/icons/text.svg",
];

// wszystkie teksty pieśni z plików JSON (raw github)
let hymnsArray = [];
async function cacheHymnBook(hymnBooks) {
  for (let i = 0; i < hymnBooks.length; i++) {
    await fetch(`/json/${hymnBooks[i]}.json`)
      .then((response) => response.json())
      .then((hymnsBook) => {
        for (let j = 0; j < hymnsBook.length; j++)
          hymnsArray.push(hymnsBook[j].link);
      });
  }
}

// instalacja nowego sw
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    (async () => {
      await cacheHymnBook(["brzask", "cegielki", "nowe", "epifania", "inne"]);

      const contentToCache = assets.concat(hymnsArray);

      const cache = await caches.open(cacheName);
      await cache.addAll(contentToCache);
    })()
  );
});

// zapisanie i odczyt plików
self.addEventListener("fetch", (e) => {
  url = e.request.url;
  if (
    url.startsWith("chrome-extension") ||
    url.includes("extension") ||
    !(url.indexOf("http") === 0)
  )
    return;

  e.respondWith(
    (async () => {
      const r = await caches.match(e.request);
      if (r) return r;

      const response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      cache.put(e.request, response.clone());
      return response;
    })()
  );
});

// aktywacja nowego sw
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key === cacheName) return;
          return caches.delete(key);
        })
      );
    })
  );
});
