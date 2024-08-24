let map;
let userMarker;
let alertMarker = null;
let alertLocation = null;
let watchId = null;

function initMap() {
    // Initialize map
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20.5937, lng: 78.9629 }, // Default center (India)
        zoom: 5
    });

    // Set user marker when their location is available
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                map.setCenter(userLocation);
                map.setZoom(14);

                userMarker = new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: "Your Location",
                });

                startTrackingLocation();
            },
            () => handleLocationError(true, map.getCenter())
        );
    } else {
        handleLocationError(false, map.getCenter());
    }

    // Event listener for setting the location
    document.getElementById('setLocationBtn').addEventListener('click', () => {
        google.maps.event.addListener(map, 'click', (event) => {
            // Remove existing alert marker if present
            if (alertMarker) {
                alertMarker.setMap(null);
            }

            // Set new alert location marker
            alertLocation = event.latLng;
            alertMarker = new google.maps.Marker({
                position: alertLocation,
                map: map,
                title: "Alert Location",
                icon: {
                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' // Custom marker icon
                }
            });

            // Stop the click event to set only one location
            google.maps.event.clearListeners(map, 'click');
        });
    });
}

function startTrackingLocation() {
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                // Update user marker's position
                if (userMarker) {
                    userMarker.setPosition(userLocation);
                }

                // Check if user is close to the alert location
                if (alertLocation && isUserNearLocation(userLocation, alertLocation)) {
                    triggerAlert();
                }
            },
            (error) => {
                console.error(error);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 10000,
            }
        );
    }
}

function isUserNearLocation(userLocation, alertLocation) {
    const distanceThreshold = 0.05; // Approx ~50 meters radius
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(userLocation.lat, userLocation.lng),
        alertLocation
    );
    return distance < distanceThreshold;
}

function triggerAlert() {
    // Show alert message
    alert('You have reached your set location!');

    // Play sound
    const alertSound = document.getElementById('alertSound');
    alertSound.play();

    // Stop watching location after alert
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
    }
}

function handleLocationError(browserHasGeolocation, pos) {
    const infoWindow = new google.maps.InfoWindow({
        position: pos,
        content: browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation.",
    });
    infoWindow.open(map);
}
