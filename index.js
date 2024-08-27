let map;
let userMarker;
let alertMarker = null;
let alertLocation = null;
let watchId = null;

let alertCircle; // Variable to hold the circle

function initMap() {
    // Initialize map
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20.5937, lng: 78.9629 }, // Default center (India)
        zoom: 18,  // High zoom for better 3D visualization
        mapTypeId: 'hybrid',  // Enable 3D rotation
        tilt: 45,  // Start with tilt enabled
    });
 
    // Initialize Hammer.js for gesture recognition on the map div
    const mapElement = document.getElementById('map');
    const hammer = new Hammer(mapElement);

    // Enable rotation detection
    hammer.get('rotate').set({ enable: true });

    // Handle the rotate event
    hammer.on('rotate', function (e) {
        // Adjust heading based on rotation angle
        currentHeading += e.rotation; // Increase or decrease based on rotation
        if (currentHeading >= 360 || currentHeading <= -360) {
            currentHeading = 0; // Reset heading to 0 after a full rotation
        }

        // Set the map heading based on current heading value
        map.setHeading(currentHeading);
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
        if (alertCircle) {
            alertCircle.setMap(null);
            alertCircle = null; // Ensure the circle variable is reset
        }

        // Set the new alert location marker
        alertLocation = event.latLng;
        alertMarker = new google.maps.Marker({
            position: alertLocation,
            map: map,
            title: "Alert Location",
            icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' // Custom marker icon
            },
            animation: google.maps.Animation.DROP
        });

        // Create an InfoWindow to show the "Your destination is set!" message
        const infoWindow = new google.maps.InfoWindow({
            content: '<div style="color: black; font-weight: bold;">Your destination is set!</div>'
        });

        // Open the InfoWindow right below the marker
        infoWindow.open(map, alertMarker);

        // Set a timeout to automatically close the InfoWindow after 3 seconds
        setTimeout(() => {
            infoWindow.close();
        }, 2000); // Display for 2 seconds

          // Draw the circle around the destination
           drawCircle();

        // Stop the click event to set only one location
        google.maps.event.clearListeners(map, 'click');
    });
});
}

function drawCircle() {
    // Get the radius value from the input field and convert to meters
    const radiusKm = parseFloat(document.getElementById('radius').value);
    const radiusMeters = radiusKm * 1000;


        // Debugging
        console.log("Alert Location:", alertLocation);
        console.log("Circle Radius (meters):", radiusMeters);

    // Create or update the circle around the alert location
    if (alertCircle) {
        alertCircle.setCenter(alertLocation); // Update the center if circle already exists
        alertCircle.setRadius(radiusMeters); // Update the radius
    } else {
        alertCircle = new google.maps.Circle({
            
            center: alertLocation,
            radius: radiusMeters,
            fillColor: '#FF0000',
            fillOpacity: 0.25,
            strokeColor: '#FF0000',
            strokeOpacity: 0.9,
            strokeWeight: 2,
            map: map
        });
        console.log("Drawing Circle for Destination");
    }
}

// Event listener for updating the circle when the radius input changes
document.getElementById('radius').addEventListener('input', () => {
    if (alertLocation) {
        drawCircle();
    }
});

function startTrackingLocation() {
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    
                };
                console.log(`Latitude: ${position.coords.latitude}`);
                console.log(`Longitude: ${position.coords.longitude}`);
                console.log(`Accuracy: ${position.coords.accuracy} meters`);

                // Update user marker's position
                if (userMarker) {
                    userMarker.setPosition(userLocation);
                }

               // Log distances for debugging
               if (alertLocation) {
                const distance = google.maps.geometry.spherical.computeDistanceBetween(
                    new google.maps.LatLng(userLocation.lat, userLocation.lng),
                    alertLocation
                );
                console.log(`Distance to alert location: ${distance} meters`);

                if (isUserNearLocation(userLocation, alertLocation)) {
                    triggerAlert();
                }
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
    const distanceThreshold = 50; // Approx ~50 meters radius
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(userLocation.lat, userLocation.lng),
        alertLocation
    );
    return distance < distanceThreshold;
}

function triggerAlert() {
    // Show custom notification
    const notification = document.getElementById('notification');
    notification.style.display = 'block';

    // Play sound
    const alertSound = document.getElementById('alertSound');
    alertSound.play().catch(error => {
        console.error("Error playing sound:", error);
    });

    // Hide notification after 5 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);

    // Stop watching location after alert
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
    }
}
document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();  // Prevent the default form submission behavior

    // Get the input values
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;

    // Reference to the saved contacts section
    const savedContactsDiv = document.getElementById('savedContacts');
    
    // Hide the 'No contacts saved yet.' message
    const noContactsMessage = document.getElementById('noContactsMessage');
    if (noContactsMessage) {
        noContactsMessage.remove();
    }

    // Create a new contact card
    const contactCard = document.createElement('div');
    contactCard.classList.add('contact-card');
    contactCard.innerHTML = `
        <p class="contact-name"><strong>Name:</strong> ${name}<br><strong>Phone:</strong> ${phone}<br><strong>Message:</strong> ${message};</p>
         <div class="delete-icon-container">
            <i class="fa-solid fa-trash delete-contact">
                <div class="cap"></div>
            </i>
        </div>
    `;

    // Append the contact card to the saved contacts section
    savedContactsDiv.appendChild(contactCard);

    // Clear the form fields
    document.getElementById('contactForm').reset();

    // Reinitialize delete event listeners
    addDeleteEventListeners();
});

function addDeleteEventListeners() {
    const savedContactsDiv = document.getElementById('savedContacts'); // Ensure it's accessible here

    document.querySelectorAll('.delete-contact').forEach(icon => {
        icon.addEventListener('click', function () {
            const contactCard = this.parentElement.parentElement; // Get the contact card
            const contactName = contactCard.querySelector('.contact-name'); // Get the contact name text
            const cap = this.querySelector('.cap'); // Get the cap element

            // Add the 'open' class to simulate the cap opening
            cap.classList.add('open');

            // Add the 'sucked' class to the contact text to start the sucking animation
            contactName.classList.add('sucked');

            // Wait for the animation to finish before removing the contact card
            setTimeout(() => {
                contactCard.remove();

                // Show 'No contacts saved yet.' message if all contacts are deleted
                if (savedContactsDiv.children.length === 0) {
                    const message = document.createElement('p');
                    message.id = 'noContactsMessage';
                    message.style.color = '#888';
                    message.style.fontFamily = "'Poppins', sans-serif";
                    message.textContent = 'No contacts saved yet.';
                    savedContactsDiv.appendChild(message);
                }
            }, 1000); // Adjust the timeout to match the duration of the animation
        });
    });
}

// Initial call to add event listeners to existing delete icons
addDeleteEventListeners();


function handleLocationError(browserHasGeolocation, pos) {
    // Set the error message content
    const errorMessage = browserHasGeolocation
    ? "Please turn on your location."
    : "Please check your browser's network settings.";
    
    // Get modal elements
    const modal = document.getElementById('locationErrorModal');
    const errorMessageElement = document.getElementById('locationErrorMessage');
    const closeModalBtn = document.getElementById('closeModalBtn');
    
    // Set the message text in the modal
    errorMessageElement.textContent = errorMessage;

    // Show the modal by changing display to 'block'
    modal.style.display = 'block';
    
    // Close the modal when the user clicks the 'Close' button
    closeModalBtn.addEventListener('click', function() {
        modal.style.display = 'none'; // Hide the modal
    });
}


// Trackpad rotation function using the wheel event
function enableTrackpadRotation() {
    window.addEventListener('wheel', function (e) {
        // Check for ctrlKey being pressed or prevent unintended behaviors
        if (e.ctrlKey || e.metaKey || e.altKey) {
            return;  // Avoid rotation when zooming with ctrl or other keys
        }

        // Detect significant trackpad gestures
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            // User is making a rotation-like gesture (more horizontal than vertical)
            rotateMap(e.deltaX * 0.1);  // Adjust sensitivity (smaller = less sensitive)
        }
    });
}

// Rotate the map by adjusting the heading
function rotateMap(angle) {
    const currentHeading = map.getHeading() || 0;
    map.setHeading(currentHeading + angle);
}




document.getElementById("settingsIcon").addEventListener("click", function() {
    const sidebar = document.getElementById("settingsSidebar");
    const icon = document.getElementById("settingsIcon");

    // Toggle the sidebar visibility
    if (sidebar.classList.contains("open")) {
        sidebar.classList.remove("open");
        icon.classList.remove("rotate");
        icon.classList.add("rotate-back");
    } else {
        sidebar.classList.add("open");
        icon.classList.remove("rotate-back");
        icon.classList.add("rotate");
    }
});