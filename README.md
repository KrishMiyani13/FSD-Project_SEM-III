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

## 🚀 Getting Started

1.  **Clone the repository**:
    ```bash
    git clone [https://github.com/your-username/Memory-Map.git](https://github.com/your-username/Memory-Map.git)
    ```
2.  **Open the project**: Open `Login/login.html` or `Map/index.html` in any modern web browser.
3.  **Search or Click**: Use the search bar to find a city or simply click on the map to start adding memories.

## 📁 Project Structure

* `/Login`: Contains the authentication logic and user entry forms.
* `/Map`: The core application files including the interactive map (`script.js`) and the main dashboard (`index.html`).
* `/Assets`: Images and icons used throughout the application.

## 📝 Important Notes

* **Storage Limits**: Since this project uses `localStorage`, saving many high-resolution images may reach the browser's 5MB limit. It is recommended to use optimized or smaller image files.
* **HTTPS**: To use the "My Location" live tracking feature, the project must be hosted on a secure `https://` server (like GitHub Pages) due to browser security policies.

---
*Developed as a Semester III Full Stack Development (FSD) project.*
