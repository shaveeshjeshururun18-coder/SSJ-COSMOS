# SSJ COSMOS - 3D Open World Simulator

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Three.js](https://img.shields.io/badge/Engine-Three.js%20r128-black)](https://threejs.org/)
[![WebGL](https://img.shields.io/badge/Graphics-WebGL-red)](https://get.webgl.org/)

**SSJ COSMOS** is an expansive 3D Open World Simulator built with **Three.js** and **WebGL**, featuring interactive environments, dynamic multi-tier vehicle systems, exploration landmarks, and rich procedural architecture.

---

## 🌟 Key Features

* **Coastal Luxury Mansion**: Multi-room fully furnished interior, interactive bedroom wake-up sequences, foyer gates, and scenic beach views.
* **Coastal Lighthouse**: Climbable observation deck with functioning 360° rotating beacon and interactive binoculars.
* **SSJ Tropical Sky Explorer**: Full 6-DoF aerial vehicle system to soar over islands and oceans.
* **Tropical Archipelago & Paradise Island**: Ancient stone sea arches, coastal piers, and exotic tropical survival boats.
* **Kenney 3D Mega District**: Featuring 3D city buildings, racing circuits, emergency vehicles, cars, and industrial landmarks loaded via GLTF/GLB models.
* **Dynamic Lighting & Ocean Waves**: Procedural heaving water, day-night cycles, and atmospheric lighting.
* **Walkable Interiors**: Realistic multi-story collision system supporting stairs, basements, and elevated decks.

---

## 🚀 How to Run Locally

### Option 1: One-Click Launch (Windows)
Double-click `PLAY_SSJ_COSMOS.bat`. It will automatically start the lightweight local server and open the game in your default browser.

### Option 2: Using Node.js
```bash
node server.js
```
Then navigate to: [http://localhost:6767](http://localhost:6767)

### Option 3: Any Static Server
```bash
npx serve .
# or
python -m http.server 8000
```

> **Note:** A local HTTP server is required because browsers enforce CORS policies preventing `file:///` URLs from loading 3D GLTF/GLB asset models.

---

## 🎮 Controls

| Action | Key / Control |
| :--- | :--- |
| **Move** | `W`, `A`, `S`, `D` / Arrow Keys |
| **Sprint** | `Shift` (Hold) |
| **Jump / Climb** | `Space` |
| **Look / Aim** | Mouse (Pointer Lock) |
| **Interact / Enter Vehicle** | `E` |
| **Lighthouse Binoculars** | `B` or `E` |
| **Wake Up in Mansion** | UI button / Auto on start |

---

## 📂 Project Structure

```
SSJ-COSMOS/
├── index.html                  # Main entry point (SSJ COSMOS simulator)
├── SSJ_COSMOS.html             # Direct game simulator file
├── ssj_archipelago_system.js   # Archipelago, islands & procedural terrain system
├── ssj_sky_explorer_system.js  # Aerial flight physics & Sky Explorer system
├── kenney_assets_system.js     # 3D GLTF asset loader & city/racing placement
├── server.js                   # Lightweight zero-dependency HTTP server
├── PLAY_SSJ_COSMOS.bat         # 1-click Windows launcher
└── assets/                     # 3D models (GLB) and loaders
    ├── GLTFLoader.js           # Three.js GLTF Loader
    └── kenney/                 # 3D models (cars, buildings, roads, watercraft)
```

---

## 👤 Author & Credits

* **Developer:** Shaveesh Jeshurun ([@shaveeshjeshururun18-coder](https://github.com/shaveeshjeshururun18-coder))
* **3D Assets:** Kenney (CC0)
* **Graphics Engine:** Three.js
