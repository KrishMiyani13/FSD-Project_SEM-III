import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// === Firebase Configuration (Kept for Authentication) ===
const firebaseConfig = {
    apiKey: "AIzaSyAJatpJcWgnCSdyY1cVf0XhfOSOq_pJiWs",
    authDomain: "framemytrip.firebaseapp.com",
    projectId: "framemytrip",
    storageBucket: "framemytrip.firebasestorage.app",
    messagingSenderId: "357820059298",
    appId: "1:357820059298:web:6d5fefc0dc8c5c7f10d1fb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// === State Management ===
let map;
let locations = [];
let currentUser = null;
let selectedPosition = null;
let activeCircle = null;
let currentMarkers = [];

// Initialize Modals
const memoryModal = new bootstrap.Modal(document.getElementById('memoryModal'));
const addMemoryModal = new bootstrap.Modal(document.getElementById('addMemoryModal'));

// === Accordion Data ===
const stateData = [
    { state: "Andhra Pradesh", cities: ["Visakhapatnam", "Vijayawada"] },
    { state: "Arunachal Pradesh", cities: ["Itanagar", "Tawang"] },
    { state: "Assam", cities: ["Guwahati", "Dibrugarh"] },
    { state: "Bihar", cities: ["Patna", "Gaya"] },
    { state: "Chhattisgarh", cities: ["Raipur", "Bhilai"] },
    { state: "Goa", cities: ["Panaji", "Margao"] },
    { state: "Gujarat", cities: ["Ahmedabad", "Surat"] },
    { state: "Haryana", cities: ["Gurugram", "Faridabad"] },
    { state: "Himachal Pradesh", cities: ["Shimla", "Manali"] },
    { state: "Jharkhand", cities: ["Ranchi", "Jamshedpur"] },
    { state: "Karnataka", cities: ["Bengaluru", "Mysuru"] },
    { state: "Kerala", cities: ["Kochi", "Thiruvananthapuram"] },
    { state: "Madhya Pradesh", cities: ["Indore", "Bhopal"] },
    { state: "Maharashtra", cities: ["Mumbai", "Pune"] },
    { state: "Manipur", cities: ["Imphal", "Bishnupur"] },
    { state: "Meghalaya", cities: ["Shillong", "Cherrapunji"] },
    { state: "Mizoram", cities: ["Aizawl", "Lunglei"] },
    { state: "Nagaland", cities: ["Kohima", "Dimapur"] },
    { state: "Odisha", cities: ["Bhubaneswar", "Puri"] },
    { state: "Punjab", cities: ["Amritsar", "Ludhiana"] },
    { state: "Rajasthan", cities: ["Jaipur", "Udaipur"] },
    { state: "Sikkim", cities: ["Gangtok", "Namchi"] },
    { state: "Tamil Nadu", cities: ["Chennai", "Coimbatore"] },
    { state: "Telangana", cities: ["Hyderabad", "Warangal"] },
    { state: "Tripura", cities: ["Agartala", "Udaipur"] },
    { state: "Uttar Pradesh", cities: ["Lucknow", "Varanasi"] },
    { state: "Uttarakhand", cities: ["Dehradun", "Rishikesh"] },
    { state: "West Bengal", cities: ["Kolkata", "Darjeeling"] }
];

// === Map Initialization ===
function initMap() {
    navigator.geolocation.getCurrentPosition(
        (pos) => setupMap(pos.coords.latitude, pos.coords.longitude),
        () => setupMap(20.5937, 78.9629) // Default: Center of India
    );
}

function setupMap(lat, lng) {
    if (map) return;
    map = L.map('map').setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Capture coordinates on map click
    map.on('click', (e) => handleInteraction(e.latlng.lat, e.latlng.lng));
    renderAccordion();
    lucide.createIcons();
    
    // Search Bar Implementation
    L.Control.geocoder({
        defaultMarkGeocode: false,
        position: 'topleft',
        placeholder: 'Search cities or addresses...'
    })
    .on('markgeocode', function(e) {
        var center = e.geocode.center;
        map.fitBounds(e.geocode.bbox);
        handleInteraction(center.lat, center.lng);
    })
    .addTo(map);

    loadUserMemories(); // Initial load from Local Storage
}

// === Distance Calculation ===
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// === Interaction Logic ===
function handleInteraction(lat, lng) {
    selectedPosition = { lat, lng };
    
    if (activeCircle) activeCircle.remove();
    activeCircle = L.circle([lat, lng], {
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.1,
        radius: 5000,
        dashArray: '5, 10'
    }).addTo(map);

    const coordString = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    document.getElementById('locationCoords').innerText = coordString;
    document.getElementById('displayCoords').innerText = coordString;
    document.getElementById('latInput').value = lat.toFixed(6);
    document.getElementById('lngInput').value = lng.toFixed(6);

    const nearbyMemories = locations.filter(loc => getDistance(lat, lng, loc.lat, loc.lng) <= 5);
    document.getElementById('memoryCountBadge').innerText = nearbyMemories.length;
    
    resetModalView();
    memoryModal.show();
}

function renderPins() {
    currentMarkers.forEach(m => m.remove());
    currentMarkers = [];

    locations.forEach(loc => {
        const marker = L.marker([loc.lat, loc.lng]).addTo(map);
        marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            handleInteraction(loc.lat, loc.lng);
        });
        currentMarkers.push(marker);
    });
}

// === Authentication & Data Loading ===
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loadUserMemories();
    } else {
        window.location.href = "../Login/login.html";
    }
});

async function loadUserMemories() {
    // Load data from Local Storage instead of Firestore
    const savedData = localStorage.getItem('user_memories');
    locations = savedData ? JSON.parse(savedData) : [];
    
    // Filter to only show memories for the logged-in user if needed
    if (currentUser) {
        locations = locations.filter(loc => loc.userId === currentUser.uid);
    }
    
    renderPins();
    highlightVisitedLocations();
}

// === Submission Logic ===
document.getElementById('addMemoryForm').onsubmit = async (e) => {
    e.preventDefault();
    await saveMemory(
        document.getElementById('title').value,
        document.getElementById('description').value,
        selectedPosition.lat,
        selectedPosition.lng,
        document.getElementById('photoInput').files[0],
        memoryModal
    );
    e.target.reset();
};

document.getElementById('newMemoryForm').onsubmit = async (e) => {
    e.preventDefault();
    const lat = parseFloat(document.getElementById('latInput').value);
    const lng = parseFloat(document.getElementById('lngInput').value);

    await saveMemory(
        document.getElementById('newTitle').value,
        document.getElementById('newDescription').value,
        lat,
        lng,
        document.getElementById('newPhotoInput').files[0],
        addMemoryModal
    );
    e.target.reset();
};

// === LOCAL STORAGE SAVE FUNCTION ===
async function saveMemory(title, description, lat, lng, file, modalToHide) {
    try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const geoData = await geoRes.json();
        
        const memory = {
            id: Date.now(), // Unique ID for management
            userId: currentUser.uid,
            title: title,
            description: description,
            lat: lat,
            lng: lng,
            state: geoData.address?.state || "",
            city: geoData.address?.city || geoData.address?.town || "",
            createdAt: new Date().toISOString(),
            photoUrl: await fileToBase64(file)
        };

        // Get existing array from local storage, add new, and save back
        const allMemories = JSON.parse(localStorage.getItem('user_memories')) || [];
        allMemories.push(memory);
        localStorage.setItem('user_memories', JSON.stringify(allMemories));

        alert("Memory Saved to Local Storage! 📸");
        
        loadUserMemories(); 
        map.flyTo([lat, lng], 14); 
        modalToHide.hide();
    } catch (error) {
        console.error("Local save error:", error);
        alert("Error saving memory locally.");
    }
}

// === UI Utilities ===
function fileToBase64(file) {
    if (!file) return Promise.resolve(null);
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}

function resetModalView() {
    document.getElementById('optionsView').classList.remove('d-none');
    document.getElementById('addMemoryForm').classList.add('d-none');
    document.getElementById('memoriesListView').classList.add('d-none');
    document.getElementById('backBtn').classList.add('d-none');
    document.getElementById('modalTitle').innerText = "Location Details";
}

function renderAccordion() {
    const accordionContainer = document.getElementById('stateAccordion');
    accordionContainer.innerHTML = '';
    
    stateData.forEach((item, index) => {
        const stateId = `state-${item.state.replace(/\s+/g, '')}`;
        const html = `
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed state-click" type="button" 
                            id="header-${stateId}" 
                            data-bs-toggle="collapse" 
                            data-bs-target="#collapse${index}"
                            data-state-name="${item.state}">
                        ${item.state}
                    </button>
                </h2>
                <div id="collapse${index}" class="accordion-collapse collapse" data-bs-parent="#stateAccordion">
                    <div class="accordion-body">
                        <ul>
                            ${item.cities.map(city => `
                                <li class="city-click" data-city="${city}" data-state="${item.state}">${city}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>`;
        accordionContainer.innerHTML += html;
    });

    document.querySelectorAll('.state-click').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!btn.classList.contains('collapsed')) {
                zoomToLocation(btn.getAttribute('data-state-name'));
            }
        });
    });

    document.querySelectorAll('.city-click').forEach(li => {
        li.addEventListener('click', () => {
            zoomToLocation(`${li.getAttribute('data-city')}, ${li.getAttribute('data-state')}`);
            const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('stateOffcanvas'));
            if (offcanvas) offcanvas.hide();
        });
    });
}

async function zoomToLocation(locationName) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName + ", India")}`);
        const data = await response.json();
        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            map.flyTo([lat, lng], 12);
            handleInteraction(lat, lng);
        }
    } catch (error) {
        console.error("Geocoding error:", error);
    }
}

function highlightVisitedLocations() {
    // 1. Clear all existing highlights for cities and states
    document.querySelectorAll('.city-click').forEach(el => el.classList.remove('visited-item'));
    document.querySelectorAll('.state-click').forEach(el => el.classList.remove('visited-header'));

    // 2. Loop through your local memories
    locations.forEach(loc => {
        if (loc.city) {
            // Find and highlight the specific city
            const cityElement = document.querySelector(`li[data-city="${loc.city}"]`);
            if (cityElement) {
                cityElement.classList.add('visited-item');
                
                // 3. Highlight the parent State Header
                // We find the nearest accordion-item and then the button inside the header
                const accordionItem = cityElement.closest('.accordion-item');
                if (accordionItem) {
                    const stateHeader = accordionItem.querySelector('.state-click');
                    if (stateHeader) {
                        stateHeader.classList.add('visited-header');
                    }
                }
            }
        }
        
        // Alternative: If the city name doesn't match perfectly, highlight by State name directly
        if (loc.state) {
            const stateHeaderByAttr = document.querySelector(`.state-click[data-state-name="${loc.state}"]`);
            if (stateHeaderByAttr) {
                stateHeaderByAttr.classList.add('visited-header');
            }
        }
    });
}

// Event Listeners
document.getElementById('navAddMemoryBtn').onclick = () => addMemoryModal.show();
document.getElementById('showAddForm').onclick = () => {
    document.getElementById('optionsView').classList.add('d-none');
    document.getElementById('addMemoryForm').classList.remove('d-none');
    document.getElementById('backBtn').classList.remove('d-none');
    document.getElementById('modalTitle').innerText = "Add New Memory";
};
document.getElementById('backBtn').onclick = resetModalView;
// Global Event Listener for "My Location" button
document.getElementById('centerBtn').onclick = () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }

    // Show a small loader or console log to let the user know it's working
    console.log("Locating...");

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            // Use flyTo for a smooth animated transition to your live location
            map.flyTo([lat, lng], 15); 
            
            // Optional: Automatically trigger the interaction circle at your location
            handleInteraction(lat, lng);
        },
        (err) => {
            // Detailed error handling
            switch(err.code) {
                case err.PERMISSION_DENIED:
                    alert("User denied the request for Geolocation. Please enable it in your browser settings.");
                    break;
                case err.POSITION_UNAVAILABLE:
                    alert("Location information is unavailable.");
                    break;
                case err.TIMEOUT:
                    alert("The request to get user location timed out.");
                    break;
                default:
                    alert("An unknown error occurred while fetching location.");
                    break;
            }
        },
        {
            enableHighAccuracy: true, // Request more precise location
            timeout: 5000,            // Wait up to 5 seconds
            maximumAge: 0             // Do not use a cached position
        }
    );
};
// --- NAVBAR SEARCH LOGIC ---
// --- LOCAL-FIRST SEARCH LOGIC ---
document.getElementById('navSearchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = document.getElementById('navSearchInput').value;
    if (!query) return;

    // 1. Get current map center or live location for the 60km bias
    const currentCenter = map.getCenter();
    const lat = currentCenter.lat;
    const lng = currentCenter.lng;

    // 2. Define a bounding box roughly 60km around the center
    // (Roughly 0.54 degrees of lat/lng is ~60km)
    const offset = 0.54; 
    const viewbox = `${lng - offset},${lat + offset},${lng + offset},${lat - offset}`;

    try {
        // Attempt 1: Search restricted to the local viewbox
        let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&viewbox=${viewbox}&bounded=1`);
        let data = await response.json();

        // Attempt 2: If no local results, search worldwide
        if (!data || data.length === 0) {
            console.log("No local results found, searching worldwide...");
            response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            data = await response.json();
        }

        if (data && data.length > 0) {
            const targetLat = parseFloat(data[0].lat);
            const targetLng = parseFloat(data[0].lon);

            // Move the map and trigger the interaction logic
            map.flyTo([targetLat, targetLng], 12);
            handleInteraction(targetLat, targetLng);
            
            document.getElementById('navSearchInput').value = "";
        } else {
            alert("Location not found anywhere.");
        }
    } catch (error) {
        console.error("Search error:", error);
    }
});

initMap();
