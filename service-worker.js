self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/login.html',
        '/register.html',
        '/student-dashboard.html',
        '/teacher-dashboard.html',
        '/js/auth.js',
        '/js/student.js',
        '/js/teacher.js',
        'https://cdn.tailwindcss.com'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});