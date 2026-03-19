# 📍 Memory Map - Personalized Travel Diary

Memory Map is an interactive web application designed to help travelers document their journeys across India. By pinning photos and stories to specific geographic locations, users create a digital scrapbook of their life's adventures.

## ✨ Features

* **Interactive Map**: Powered by Leaflet.js and OpenStreetMap.
* **Local Storage Integration**: All your memories are saved directly in your browser's local storage for instant access without complex database delays.
* **Local-First Search**: The search bar prioritizes locations within a 60km radius of your current view before searching worldwide.
* **India-Focused Explorer**: A dedicated sidebar featuring all Indian states and major cities. Clicking a city zooms you there instantly.
* **Dynamic Highlighting**: Visited cities and their parent states are automatically highlighted in green in the sidebar once a memory is added.
* **Live Geolocation**: A "My Location" button that smoothly flies the map to your current real-time coordinates.
* **Proximity Awareness**: View nearby memories automatically within a 5km radius of any selected point.

## 🛠️ Tech Stack

* **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules).
* **UI Framework**: Bootstrap 5 for responsive design and modals.
* **Mapping**: Leaflet.js.
* **Geocoding**: Nominatim (OpenStreetMap) API.
* **Icons**: Lucide-icons.
* **Authentication**: Firebase Auth (Optional for session management).

---
*Developed as a Semester III Full Stack Development-1 (FSD-1) project.*
