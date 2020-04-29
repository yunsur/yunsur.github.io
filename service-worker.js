var version = 'latest'
var env = 'prod' // dev

importScripts(`https://cdn.jsdelivr.net/npm/workbox-sw@${version}`)

if (env === 'prod') {
  // 设置为线上生产模式
  workbox.setConfig({debug: false});
} else {
  // 设置为开发模式
  workbox.setConfig({debug: true});
}

workbox.routing.registerRoute(
  /\.html$/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'html-cache',
  }),
);

workbox.routing.registerRoute(
  /\.(css|js)$/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'asset-cache',
  }),
);

workbox.routing.registerRoute(
  /\.(jpg|jpeg|svg|png|gif|ttf|mp3)$/,
  // Use the cache if it's available.
  new workbox.strategies.CacheFirst({
    // Use a custom cache name.
    cacheName: 'static-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        // Cache for a maximum of a week.
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      })
    ]
  })
);

workbox.precaching.precacheAndRoute([
  { url: '/index.html', revision: '20200426' },
  { url: '/assets/css/style.css', revision: '20200426' },
]);

workbox.routing.setDefaultHandler(new workbox.strategies.NetworkFirst());