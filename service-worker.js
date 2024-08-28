self.addEventListener('push', function(event) {
    let data;
    
    // Check if there is any data attached to the push notification
    if (event.data) {
        data = event.data.json();
    } else {
        // Fallback in case no data is provided
        data = {
            title: 'Default Title',
            body: 'Default body message.',
            icon: '/alertICON.jpg',
            badge: '/notificationIMG.png',
            sound: '/alertMess.mp3' // Sound file
        };
    }

    const options = {
        body: data.body,
        icon: data.icon || '/path-to-icon.png',
        badge: data.badge || '/path-to-badge.png',
        data: data, // Attach data for later use
        sound: data.sound || '/alertMess.mp3' // Optional: If you want to play a sound
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close(); // Close the notification when clicked

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(function(clientList) {
            // Check if there is already a window/tab open with the URL
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // If no window is found, open a new one
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
