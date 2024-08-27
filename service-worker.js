self.addEventListener('push', function(event) {
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/path-to-icon.png',
        badge: '/path-to-badge.png',
        sound: '/path-to-alert-sound.mp3' // Optional: If you want to play a sound
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/') // Open your app or a specific URL
    );
});
