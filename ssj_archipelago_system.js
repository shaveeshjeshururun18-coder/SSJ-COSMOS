/**
 * ==============================================================================
 * SSJ OPEN WORLD ARCHIPELAGO & MULTI-GAME DIMENSIONAL PORTALS SYSTEM
 * ==============================================================================
 * Modeled directly after: C:\Users\HP\Downloads\3d_tropical_boats_island_explorer (2).html
 * 
 * Features:
 * - 6 3D Dimensional Portal Gates in the open ocean (no fake island clutter):
 *   1. Tesseract Sanctuary Portal      -> SSJ_ The Fifth Dimension.html
 *   2. Midnight Frontier Portal        -> the-midnight-frontier-2nd-version (1).html
 *   3. Estello Horizon Portal          -> SSJ_Lost_Horizon_Game.html
 *   4. Acoustic Abyss Portal           -> The Water Hears.html
 *   5. Ferrari Speedway Portal         -> 888_km_ferrari_odyssey.html
 *   6. Isla Prehistoria Portal         -> SSJ_Dinosaur_Island_AK47_Endless_Edition.html
 * - 3D Portals feature:
 *   - Monolith Torus Arch
 *   - 3 Counter-Rotating Runic Torus & Octahedron Rings
 *   - Swirling Vortex Core Disc with Canvas Radial Gradient Texture
 *   - 140m Towering Celestial Sky Energy Beam
 *   - Dynamic Point Light & Floating Ocean Navigation Buoys
 * - Intense #warp-flash hyperspace teleport transition
 * - Teleports player directly into the EXACT standalone game file!
 * - Hides all main game controls / HUD / overlays while inside the game!
 * - Clean, unobtrusive floating [EXIT TO MAIN WORLD] button (and [ESC] key)!
 * ==============================================================================
 */

window.SSJArchipelago = (function() {
    'use strict';

    // -------------------------------------------------------------------------
    // 1. GAME PORTALS REGISTRY
    // -------------------------------------------------------------------------
    const GAME_REGISTRY = [
        {
            id: 'dimension5',
            islandName: 'TESSERACT SANCTUARY PORTAL',
            attachedGameTitle: 'SSJ: THE FIFTH DIMENSION',
            gameFile: 'SSJ_ The Fifth Dimension.html',
            theme: 'Interstellar / 5D Quantum Tesseract Hyperstructure',
            coords: { x: 880, y: 0.5, z: 260 },
            colors: {
                primary: 0x38bdf8,   // Cyan
                secondary: 0xc026d3, // Magenta
                tertiary: 0x4f46e5,  // Deep Indigo
                beam: 0x38bdf8
            },
            discovered: false
        },
        {
            id: 'midnight_frontier',
            islandName: 'MIDNIGHT FRONTIER PORTAL',
            attachedGameTitle: 'The Midnight Frontier',
            gameFile: 'the-midnight-frontier-2nd-version (1).html',
            theme: 'Nocturnal American Frontier Survival Horror',
            coords: { x: -860, y: 0.5, z: 310 },
            colors: {
                primary: 0xf59e0b,   // Amber Lantern
                secondary: 0x94a3b8, // Moonlit Silver
                tertiary: 0x0f172a,  // Midnight Slate
                beam: 0xfef08a
            },
            discovered: false
        },
        {
            id: 'lost_horizon',
            islandName: 'ESTELLO HORIZON PORTAL',
            attachedGameTitle: 'SSJ – LOST HORIZON',
            gameFile: 'SSJ_Lost_Horizon_Game.html',
            theme: 'Tropical Expedition & Mountain Railway Adventure',
            coords: { x: -620, y: 0.5, z: 740 },
            colors: {
                primary: 0x06b6d4,   // Tropical Turquoise
                secondary: 0xfacc15, // Golden Sunlight
                tertiary: 0x0284c7,  // Azure
                beam: 0x22d3ee
            },
            discovered: false
        },
        {
            id: 'water_hears',
            islandName: 'ACOUSTIC ABYSS PORTAL',
            attachedGameTitle: 'THE WATER HEARS',
            gameFile: 'The Water Hears.html',
            theme: 'Psychological Acoustic Deep-Water Horror',
            coords: { x: 380, y: 0.5, z: 880 },
            colors: {
                primary: 0x0f766e,   // Deep Teal
                secondary: 0xef4444, // Emergency Red
                tertiary: 0x042f2e,  // Abyssal Green
                beam: 0x14b8a6
            },
            discovered: false
        },
        {
            id: 'ferrari_odyssey',
            islandName: 'FERRARI SPEEDWAY PORTAL',
            attachedGameTitle: '888 KM Red Ferrari Odyssey',
            gameFile: '888_km_ferrari_odyssey.html',
            theme: 'High-Speed Coastal Grand Tour & Murugan Dhaba',
            coords: { x: -140, y: 0.5, z: 980 },
            colors: {
                primary: 0xdc2626,   // Rosso Corsa Red
                secondary: 0xfbbf24, // Racing Gold
                tertiary: 0x1e293b,  // Asphalt Slate
                beam: 0xf87171
            },
            discovered: false
        },
        {
            id: 'dinosaur_island',
            islandName: 'ISLA PREHISTORIA PORTAL',
            attachedGameTitle: 'SSJ Dinosaur Island — AK-47 Edition',
            gameFile: 'SSJ_Dinosaur_Island_AK47_Endless_Edition.html',
            theme: 'Prehistoric Jurassic Park Survival & AK-47 Combat',
            coords: { x: 920, y: 0.5, z: 940 },
            colors: {
                primary: 0x10b981,   // Prehistoric Emerald
                secondary: 0xd97706, // Amber Hazard
                tertiary: 0x18181b,  // Volcanic Basalt
                beam: 0x34d399
            },
            discovered: false
        },
        {
            id: 'grand_world_explorer',
            islandName: 'GRAND WORLD EXPLORER ISLAND',
            attachedGameTitle: 'Grand World Explorer',
            gameFile: 'grand_world_explorer.html',
            theme: 'Tropical Fleet & Multi-Floor Showroom Hub',
            coords: { x: 620, y: 0.5, z: 620 },
            colors: {
                primary: 0x10b981,   // Emerald Green
                secondary: 0xf59e0b, // Amber Gold
                tertiary: 0x0284c7,  // Marine Azure
                beam: 0x34d399       // Mint Energy Beam
            },
            discovered: false
        }
    ];

    // -------------------------------------------------------------------------
    // 2. STATE & 3D REFS
    // -------------------------------------------------------------------------
    let sceneRef = null;
    let cameraRef = null;
    let playerRef = null;
    let SoundEngineRef = null;
    let registerWalkableRef = null;

    const portalEntities = [];
    let shockwaveRings = [];
    let isSubgameActive = false;
    let activeNearPortal = null;
    let portalCooldown = 0;

    // SSJ Flagship Boats tracking
    let ssjBoats = [];
    let ssjFlagMeshes = [];
    let wakeParticles = [];

    // -------------------------------------------------------------------------
    // 3. 3D PORTAL VORTEX TEXTURE GENERATOR
    // (Extracted directly from 3d_tropical_boats_island_explorer (2).html)
    // -------------------------------------------------------------------------
    function createPortalVortexTexture(c1, c2, c3) {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 512;
        const ctx = c.getContext('2d');
        const cx = 256, cy = 256;

        const radGrad = ctx.createRadialGradient(cx, cy, 8, cx, cy, 250);
        radGrad.addColorStop(0, '#ffffff');
        radGrad.addColorStop(0.22, c1 || '#38bdf8');
        radGrad.addColorStop(0.55, c2 || '#c026d3');
        radGrad.addColorStop(0.85, c3 || '#311068');
        radGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, 512, 512);

        // 8 Spiral energy arms
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        for (let arm = 0; arm < 8; arm++) {
            ctx.beginPath();
            ctx.lineWidth = 4;
            const baseAngle = (arm / 8) * Math.PI * 2;
            for (let r = 10; r < 235; r += 6) {
                const a = baseAngle + r * 0.032;
                const x = cx + Math.cos(a) * r;
                const y = cy + Math.sin(a) * r;
                if (r === 10) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        const tex = new THREE.CanvasTexture(c);
        tex.needsUpdate = true;
        return tex;
    }

    // -------------------------------------------------------------------------
    // 4. 3D DIMENSIONAL PORTAL BUILDER
    // (Extracted directly from 3d_tropical_boats_island_explorer (2).html)
    // -------------------------------------------------------------------------
    // -------------------------------------------------------------------------
    // HELIPAD CANVAS TEXTURE GENERATOR
    // -------------------------------------------------------------------------
    function createHelipadCanvasTexture(accentHex, ringHex, hHex) {
        if (typeof document === 'undefined') return null;
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Dark asphalt landing deck
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, 512, 512);

        // Hazard border square
        ctx.strokeStyle = accentHex;
        ctx.lineWidth = 18;
        ctx.strokeRect(14, 14, 484, 484);

        // Circular rings
        ctx.strokeStyle = ringHex;
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(256, 256, 205, 0, Math.PI * 2);
        ctx.stroke();

        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(256, 256, 172, 0, Math.PI * 2);
        ctx.stroke();

        // Bold Central [ H ]
        ctx.fillStyle = hHex;
        ctx.font = '900 165px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('H', 256, 260);

        // Corner hazard triangles
        ctx.fillStyle = accentHex;
        [[0,0, 60,0, 0,60], [512,0, 452,0, 512,60], [0,512, 60,512, 0,452], [512,512, 452,512, 512,452]].forEach(([x1,y1,x2,y2,x3,y3]) => {
            ctx.beginPath();
            ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath();
            ctx.fill();
        });

        const tex = new THREE.CanvasTexture(canvas);
        return tex;
    }

    // -------------------------------------------------------------------------
    // 3B. 3D ISLAND NAME SIGNBOARD CANVAS GENERATORS & MOORED WATERCRAFT
    // -------------------------------------------------------------------------
    function createIslandSignboardTexture(islandName, gameTitle, primaryColor, accentColor, tagLine) {
        if (typeof document === 'undefined') return null;
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');

        // Dark gradient backdrop
        const grad = ctx.createLinearGradient(0, 0, 1024, 300);
        grad.addColorStop(0, '#020617');
        grad.addColorStop(0.5, '#0b1d3a');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 300);

        // Glowing double borders
        ctx.strokeStyle = accentColor || '#facc15';
        ctx.lineWidth = 10;
        ctx.strokeRect(12, 12, 1000, 276);

        ctx.strokeStyle = primaryColor || '#38bdf8';
        ctx.lineWidth = 3;
        ctx.strokeRect(24, 24, 976, 252);

        // Corner decorative brackets
        const bLen = 28;
        ctx.fillStyle = accentColor || '#facc15';
        ctx.fillRect(12, 12, bLen, 10); ctx.fillRect(12, 12, 10, bLen);
        ctx.fillRect(1012 - bLen, 12, bLen, 10); ctx.fillRect(1002, 12, 10, bLen);
        ctx.fillRect(12, 278, bLen, 10); ctx.fillRect(12, 288 - bLen, 10, bLen);
        ctx.fillRect(1012 - bLen, 278, bLen, 10); ctx.fillRect(1002, 288 - bLen, 10, bLen);

        // Top Tagline
        ctx.fillStyle = accentColor || '#facc15';
        ctx.font = 'bold 20px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(tagLine || '★ SSJ ARCHIPELAGO DESTINATION ★', 512, 54);

        // Island Name (Large, glowing, bold)
        ctx.shadowColor = primaryColor || '#38bdf8';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 64px Outfit, sans-serif';
        ctx.fillText((islandName || '').toUpperCase(), 512, 142);

        // Game Title & Theme Subtitle
        ctx.shadowBlur = 0;
        ctx.fillStyle = primaryColor || '#38bdf8';
        ctx.font = 'bold 24px Outfit, sans-serif';
        ctx.fillText((gameTitle || '').toUpperCase(), 512, 205);

        // Bottom nautical docking note
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 16px Outfit, sans-serif';
        ctx.fillText('⚓ DOCKING SLIP • HELIPAD LZ-01 • DIMENSIONAL GATEWAY ⚓', 512, 256);

        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
    }

    function createHelipadSignboardTexture(islandName, primaryColor) {
        if (typeof document === 'undefined') return null;
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 512, 128);

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 6;
        ctx.strokeRect(6, 6, 500, 116);

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 18px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🚁 HELIPAD LZ-01', 256, 36);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 24px Outfit, sans-serif';
        ctx.fillText((islandName || '').toUpperCase(), 256, 80);

        ctx.fillStyle = primaryColor || '#38bdf8';
        ctx.font = 'bold 14px Outfit, sans-serif';
        ctx.fillText('ACTIVE FLIGHT RECOVERY DECK', 256, 108);

        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
    }

    function buildMooredBambooCatamaran() {
        const root = new THREE.Group();
        root.name = "Moored_Bamboo_Catamaran";
        const bambooMat = new THREE.MeshStandardMaterial({ color: 0xa67038, roughness: 0.72 });
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c3818, roughness: 0.8 });
        const blueHullMat = new THREE.MeshStandardMaterial({ color: 0x1d5bbf, roughness: 0.45 });
        const sailMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6, side: THREE.DoubleSide });

        // Twin blue pontoons
        [-1.6, 1.6].forEach(xOff => {
            const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 5.4, 12), blueHullMat);
            cyl.rotation.x = Math.PI / 2;
            cyl.position.set(xOff, 0, 0);
            root.add(cyl);

            const bow = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.2, 12), blueHullMat);
            bow.rotation.x = -Math.PI / 2;
            bow.position.set(xOff, 0.08, -3.2);
            root.add(bow);
        });

        // Cross beams
        [-1.8, -0.6, 0.6, 1.8].forEach(zPos => {
            const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.6, 8), woodMat);
            beam.rotation.z = Math.PI / 2;
            beam.position.set(0, 0.28, zPos);
            root.add(beam);
        });

        // Bamboo deck slats
        for (let bx = -1.2; bx <= 1.2; bx += 0.22) {
            const slat = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.4, 6), bambooMat);
            slat.rotation.x = Math.PI / 2;
            slat.position.set(bx, 0.38, 0);
            root.add(slat);
        }

        // Mast and Triangular Sail
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.8, 8), woodMat);
        mast.position.set(0, 2.5, -0.4);
        root.add(mast);

        const sailGeo = new THREE.BufferGeometry();
        const verts = new Float32Array([
            0, 4.8, -0.4,
            -1.4, 1.2, 0.8,
            1.4, 1.2, 0.8
        ]);
        sailGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
        sailGeo.computeVertexNormals();
        const sailMesh = new THREE.Mesh(sailGeo, sailMat);
        root.add(sailMesh);

        return root;
    }

    function buildMooredTribalOutrigger() {
        const root = new THREE.Group();
        root.name = "Moored_Tribal_Outrigger";
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x6e4b2a, roughness: 0.8 });
        const logMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });

        // Main dugout canoe hull
        const canoe = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.28, 5.8, 10), woodMat);
        canoe.rotation.x = Math.PI / 2;
        canoe.scale.set(0.7, 1.0, 1.0);
        root.add(canoe);

        // Outrigger float on side
        const floatLog = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 4.2, 8), logMat);
        floatLog.rotation.x = Math.PI / 2;
        floatLog.position.set(1.9, -0.05, 0);
        root.add(floatLog);

        // Connecting curved outrigger booms
        [-1.2, 1.2].forEach(zPos => {
            const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.1, 6), woodMat);
            boom.rotation.z = Math.PI / 2;
            boom.position.set(0.95, 0.22, zPos);
            root.add(boom);
        });

        return root;
    }

    // -------------------------------------------------------------------------
    // 4. ARCHIPELAGO PORTAL ISLAND STATION BUILDER (Island + Boat Dock + Helipad + Sanctuary + Portal)
    // Custom terrain style per game, dedicated boat parking pier, flight helipad, and majestic sanctuary!
    // -------------------------------------------------------------------------
    function build3DPortalGate(scene, portalDef) {
        const islandStationGroup = new THREE.Group();
        const cx = portalDef.coords.x;
        const cz = portalDef.coords.z;
        islandStationGroup.position.set(cx, 0, cz);

        // Theme palette definitions matching each game's visual identity
        let shelfColor = 0xfde047;
        let topColor = 0x16a34a;
        let pathColor = 0x94a3b8;
        let dockColor = 0x78350f;
        let pillarColor = 0xe2e8f0;
        let helipadAccent = '#06b6d4';
        let helipadRing = '#facc15';
        let helipadH = '#ffffff';

        if (portalDef.id === 'dimension5') {
            shelfColor = 0x0f172a; // Obsidian crystalline
            topColor = 0x1e1b4b;   // Deep indigo void
            pathColor = 0x312e81;  // Cosmic stone
            dockColor = 0x0f172a;  // Cyber pontoon
            pillarColor = 0x1e293b;
            helipadAccent = '#38bdf8';
            helipadRing = '#c026d3';
            helipadH = '#38bdf8';
        } else if (portalDef.id === 'midnight_frontier') {
            shelfColor = 0x334155; // Nocturnal granite shore
            topColor = 0x14532d;   // Pine forest floor
            pathColor = 0x475569;  // Mountain shale
            dockColor = 0x451a03;  // Weathered 1899 timber
            pillarColor = 0x334155;
            helipadAccent = '#f59e0b';
            helipadRing = '#94a3b8';
            helipadH = '#fef08a';
        } else if (portalDef.id === 'lost_horizon') {
            shelfColor = 0xfde047; // Tropical golden sand
            topColor = 0x16a34a;   // Lush island emerald
            pathColor = 0xf1f5f9;  // White sunlit marble
            dockColor = 0x78350f;  // Teak pier
            pillarColor = 0xf8fafc;
            helipadAccent = '#06b6d4';
            helipadRing = '#facc15';
            helipadH = '#ffffff';
        } else if (portalDef.id === 'water_hears') {
            shelfColor = 0x09090b; // Volcanic basalt crag
            topColor = 0x042f2e;   // Abyssal slime rock
            pathColor = 0x134e4a;  // Deep teal steel
            dockColor = 0x1c1917;  // Industrial rusted steel
            pillarColor = 0x1c1917;
            helipadAccent = '#ef4444';
            helipadRing = '#0f766e';
            helipadH = '#ef4444';
        } else if (portalDef.id === 'ferrari_odyssey') {
            shelfColor = 0xe2e8f0; // Italian limestone cliff
            topColor = 0xb45309;   // Terracotta brick promenade
            pathColor = 0xd97706;  // Mediterranean tile
            dockColor = 0xf8fafc;  // Yacht marina pier
            pillarColor = 0xdc2626;
            helipadAccent = '#dc2626';
            helipadRing = '#facc15';
            helipadH = '#ffffff';
        } else if (portalDef.id === 'dinosaur_island') {
            shelfColor = 0x27272a; // Prehistoric volcanic mud
            topColor = 0x14532d;   // Jurassic jungle soil
            pathColor = 0x3f3f46;  // InGen containment asphalt
            dockColor = 0x1c1917;  // Heavy treated timber
            pillarColor = 0x475569;
            helipadAccent = '#f59e0b';
            helipadRing = '#15803d';
            helipadH = '#facc15';
        } else if (portalDef.id === 'grand_world_explorer') {
            shelfColor = 0xfde047; // Golden coral sand
            topColor = 0x059669;   // Tropical emerald lawn
            pathColor = 0xe2e8f0;  // White coral promenade
            dockColor = 0x78350f;  // Teak marina pier
            pillarColor = 0x047857; // Polished emerald marble
            helipadAccent = '#10b981';
            helipadRing = '#f59e0b';
            helipadH = '#ffffff';
        }

        const shelfMat = new THREE.MeshStandardMaterial({ color: shelfColor, roughness: 0.85 });
        const topMat = new THREE.MeshStandardMaterial({ color: topColor, roughness: 0.8 });
        const pathMat = new THREE.MeshStandardMaterial({ color: pathColor, roughness: 0.6 });
        const dockMat = new THREE.MeshStandardMaterial({ color: dockColor, roughness: 0.75 });
        const pillarMat = new THREE.MeshStandardMaterial({ color: pillarColor, roughness: 0.45 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.7, roughness: 0.2 });

        // 1. MAIN ISLAND LANDMASS (Rooted from seabed up above sea level)
        const islandBase = new THREE.Mesh(new THREE.CylinderGeometry(28, 34, 3.4, 24), shelfMat);
        islandBase.position.y = 0.5;
        islandBase.receiveShadow = true;
        islandStationGroup.add(islandBase);

        const islandTop = new THREE.Mesh(new THREE.CylinderGeometry(25, 27.5, 1.4, 24), topMat);
        islandTop.position.y = 1.6;
        islandTop.receiveShadow = true;
        islandStationGroup.add(islandTop);

        // 2. CENTRAL WALKWAY (Connecting boat dock, helipad, and sanctuary)
        for (let z = 16; z >= -14; z -= 2.6) {
            const stone = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.16, 2.2), pathMat);
            stone.position.set(0, 1.82, z);
            stone.receiveShadow = true;
            islandStationGroup.add(stone);
        }

        // Branch path to Helipad
        for (let x = 3; x <= 16; x += 2.6) {
            const branch = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.16, 4.2), pathMat);
            branch.position.set(x, 1.82, 6);
            branch.receiveShadow = true;
            islandStationGroup.add(branch);
        }

        // 3. BOAT PARKING DOCK / PIER (Extends 22m out into deep water for parking craft)
        const dockDeck = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.4, 22), dockMat);
        dockDeck.position.set(0, 1.25, 27);
        dockDeck.receiveShadow = true;
        islandStationGroup.add(dockDeck);

        // Pier support pilings descending into seabed
        for (let pz = 18; pz <= 36; pz += 4.5) {
            [-2.2, 2.2].forEach(px => {
                const piling = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 6.5, 8), dockMat);
                piling.position.set(px, -1.5, pz);
                islandStationGroup.add(piling);
            });
        }

        // Mooring Bollards / Cleats along both sides of dock for tying boats
        const bollardMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
        for (let bz = 20; bz <= 36; bz += 5.2) {
            [-2.4, 2.4].forEach(bx => {
                const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.55, 8), bollardMat);
                bollard.position.set(bx, 1.7, bz);
                const cross = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 0.12), bollardMat);
                cross.position.set(bx, 1.9, bz);
                islandStationGroup.add(bollard, cross);
            });
        }

        // Nautical Dock Entrance Lanterns
        [-2.4, 2.4].forEach(lx => {
            const lampPost = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 3.2, 8), pillarMat);
            lampPost.position.set(lx, 2.8, 17);
            const lampHead = new THREE.Mesh(
                new THREE.SphereGeometry(0.32, 8, 8),
                new THREE.MeshBasicMaterial({ color: portalDef.colors.primary })
            );
            lampHead.position.set(lx, 4.3, 17);
            const lampLight = new THREE.PointLight(portalDef.colors.primary, 1.8, 18);
            lampLight.position.set(lx, 4.3, 17);
            islandStationGroup.add(lampPost, lampHead, lampLight);
        });

        // 4. DEDICATED HELIPAD (Flight Vehicle & Helicopter Landing Pad at X: 17, Z: 6)
        const helipadDeck = new THREE.Mesh(new THREE.CylinderGeometry(8.2, 8.6, 0.65, 24), dockMat);
        helipadDeck.position.set(17, 1.85, 6);
        helipadDeck.receiveShadow = true;
        islandStationGroup.add(helipadDeck);

        const helipadDecal = new THREE.Mesh(
            new THREE.CircleGeometry(7.8, 32),
            new THREE.MeshBasicMaterial({
                map: createHelipadCanvasTexture(helipadAccent, helipadRing, helipadH),
                side: THREE.DoubleSide
            })
        );
        helipadDecal.rotation.x = -Math.PI / 2;
        helipadDecal.position.set(17, 2.19, 6);
        islandStationGroup.add(helipadDecal);

        // 4 Perimeter Helipad LED Landing Lights
        [[9.5, 6], [24.5, 6], [17, -1.5], [17, 13.5]].forEach(([hx, hz]) => {
            const stanchion = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.65, 8), bollardMat);
            stanchion.position.set(hx, 2.3, hz);
            const led = new THREE.Mesh(
                new THREE.SphereGeometry(0.2, 8, 8),
                new THREE.MeshBasicMaterial({ color: portalDef.colors.primary })
            );
            led.position.set(hx, 2.65, hz);
            const pLight = new THREE.PointLight(portalDef.colors.primary, 1.5, 12);
            pLight.position.set(hx, 2.65, hz);
            islandStationGroup.add(stanchion, led, pLight);
        });

        // Windsock on Mast
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.5, 8), bollardMat);
        mast.position.set(24.5, 4.2, 13.5);
        const windsock = new THREE.Mesh(
            new THREE.ConeGeometry(0.45, 1.8, 8),
            new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 })
        );
        windsock.rotation.z = Math.PI / 2;
        windsock.position.set(25.4, 6.2, 13.5);
        islandStationGroup.add(mast, windsock);

        // 5. ISLAND SANCTUARY PAVILION (Houses Portal Gate at Z = -8)
        const sanctuaryFloor = new THREE.Mesh(new THREE.BoxGeometry(18, 0.4, 18), pillarMat);
        sanctuaryFloor.position.set(0, 1.8, -8);
        sanctuaryFloor.receiveShadow = true;
        islandStationGroup.add(sanctuaryFloor);

        // Glowing Floor Rune Ring
        const runeGeo = new THREE.RingGeometry(5.2, 6.0, 32);
        runeGeo.rotateX(-Math.PI / 2);
        const runeMesh = new THREE.Mesh(
            runeGeo,
            new THREE.MeshBasicMaterial({ color: portalDef.colors.primary, side: THREE.DoubleSide })
        );
        runeMesh.position.set(0, 2.02, -8);
        islandStationGroup.add(runeMesh);

        // 6 Grand Pillars supporting Sanctuary Arch Canopy
        const pCols = [
            [-7.5, -1.0], [7.5, -1.0],
            [-7.5, -8.0], [7.5, -8.0],
            [-7.5, -15.0], [7.5, -15.0]
        ];
        pCols.forEach(([px, pz]) => {
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.8, 9.2, 12), pillarMat);
            pillar.position.set(px, 6.4, pz);
            pillar.castShadow = true;
            islandStationGroup.add(pillar);

            // Glowing Crystal Beacon atop pillar
            const beacon = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.6, 0),
                new THREE.MeshBasicMaterial({ color: portalDef.colors.secondary })
            );
            beacon.position.set(px, 11.2, pz);
            islandStationGroup.add(beacon);
        });

        // Open Beam Roof Arches
        [-7.5, 7.5].forEach(bx => {
            const beam = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 16), pillarMat);
            beam.position.set(bx, 11.0, -8);
            islandStationGroup.add(beam);
        });
        const crossArch = new THREE.Mesh(new THREE.BoxGeometry(16.5, 1.4, 1.8), goldMat);
        crossArch.position.set(0, 11.6, -1.0);
        islandStationGroup.add(crossArch);

        // 6. THE 3D DIMENSIONAL PORTAL GATE (Centered inside Sanctuary at Z = -8)
        const portalSubGroup = new THREE.Group();
        portalSubGroup.position.set(0, 6.8, -8);

        // Carved Monolith Torus Arch
        const outerFrame = new THREE.Mesh(new THREE.TorusGeometry(8.5, 0.95, 10, 36), pillarMat);
        portalSubGroup.add(outerFrame);

        // Counter-Rotating Runic Energy Rings
        const ring1Mat = new THREE.MeshBasicMaterial({ color: portalDef.colors.primary, wireframe: true });
        const portalRing1 = new THREE.Mesh(new THREE.TorusGeometry(7.2, 0.32, 8, 32), ring1Mat);
        portalSubGroup.add(portalRing1);

        const ring2Mat = new THREE.MeshBasicMaterial({ color: portalDef.colors.secondary });
        const portalRing2 = new THREE.Group();
        for (let n = 0; n < 12; n++) {
            const a = (n / 12) * Math.PI * 2;
            const rune = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), ring2Mat);
            rune.position.set(Math.cos(a) * 6.5, Math.sin(a) * 6.5, 0);
            portalRing2.add(rune);
        }
        portalSubGroup.add(portalRing2);

        const ring3Mat = new THREE.MeshBasicMaterial({ color: portalDef.colors.tertiary, wireframe: true });
        const portalRing3 = new THREE.Mesh(new THREE.TorusGeometry(5.6, 0.26, 6, 24), ring3Mat);
        portalSubGroup.add(portalRing3);

        // Swirling Vortex Core
        const coreGeo = new THREE.CircleGeometry(6.8, 40);
        const hexToRgbStr = (hex) => {
            const c = new THREE.Color(hex);
            return `rgb(${Math.round(c.r*255)}, ${Math.round(c.g*255)}, ${Math.round(c.b*255)})`;
        };
        const c1 = hexToRgbStr(portalDef.colors.primary);
        const c2 = hexToRgbStr(portalDef.colors.secondary);
        const c3 = hexToRgbStr(portalDef.colors.tertiary);

        const coreMat = new THREE.MeshBasicMaterial({
            map: createPortalVortexTexture(c1, c2, c3),
            transparent: true,
            opacity: 0.94,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const portalCoreMesh = new THREE.Mesh(coreGeo, coreMat);
        portalSubGroup.add(portalCoreMesh);

        // Towering Celestial Sky Beam (140m)
        const beamGeo = new THREE.CylinderGeometry(1.6, 4.8, 140, 20, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({
            color: portalDef.colors.beam,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const portalBeamMesh = new THREE.Mesh(beamGeo, beamMat);
        portalBeamMesh.position.y = 65;
        portalSubGroup.add(portalBeamMesh);

        const portalLight = new THREE.PointLight(portalDef.colors.primary, 3.8, 70);
        portalLight.position.set(0, 3, 2);
        portalSubGroup.add(portalLight);

        islandStationGroup.add(portalSubGroup);

        // =========================================================================
        // 3D ILLUMINATED ISLAND NAME BILLBOARDS (Pierhead Arch, Sanctuary Facade, Helipad)
        // =========================================================================

        // A. GRAND PIERHEAD ENTRANCE ARCHWAY WITH DOUBLE-SIDED 3D SIGNBOARD (At Z = 37)
        const pierArchGroup = new THREE.Group();
        pierArchGroup.position.set(0, 0, 37.0);

        // Left and Right timber/metallic arch pillars
        [-4.6, 4.6].forEach(px => {
            const archPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 7.2, 8), pillarMat);
            archPillar.position.set(px, 3.8, 0);
            pierArchGroup.add(archPillar);

            // Pierhead Beacon Lantern atop pillar
            const archBeacon = new THREE.Mesh(
                new THREE.SphereGeometry(0.35, 8, 8),
                new THREE.MeshBasicMaterial({ color: portalDef.colors.secondary })
            );
            archBeacon.position.set(px, 7.6, 0);
            const archLight = new THREE.PointLight(portalDef.colors.secondary, 2.0, 16);
            archLight.position.set(px, 7.6, 0);
            pierArchGroup.add(archBeacon, archLight);
        });

        // Top horizontal beam
        const topArchBeam = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.45, 0.5), goldMat);
        topArchBeam.position.set(0, 6.8, 0);
        pierArchGroup.add(topArchBeam);

        // Double-sided 3D Island Name Board
        const dockSignTex = createIslandSignboardTexture(
            portalDef.islandName,
            portalDef.attachedGameTitle,
            hexToRgbStr(portalDef.colors.primary),
            hexToRgbStr(portalDef.colors.secondary),
            '★ SSJ ARCHIPELAGO DESTINATION ★'
        );
        const dockSignMat = new THREE.MeshStandardMaterial({
            map: dockSignTex,
            roughness: 0.35,
            metalness: 0.15
        });
        const dockSignTrimMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
        const dockSignMesh = new THREE.Mesh(
            new THREE.BoxGeometry(9.2, 2.5, 0.22),
            [dockSignTrimMat, dockSignTrimMat, dockSignTrimMat, dockSignTrimMat, dockSignMat, dockSignMat]
        );
        dockSignMesh.position.set(0, 5.2, 0);
        pierArchGroup.add(dockSignMesh);

        islandStationGroup.add(pierArchGroup);

        // B. SANCTUARY PAVILION FACADE NAMEPLATE (Above Entrance at Z = -1, Y = 13.0)
        const sanctuarySignTex = createIslandSignboardTexture(
            portalDef.islandName,
            portalDef.attachedGameTitle,
            hexToRgbStr(portalDef.colors.primary),
            hexToRgbStr(portalDef.colors.secondary),
            '★ DIMENSIONAL GATEWAY ★'
        );
        const sanctuarySignMat = new THREE.MeshStandardMaterial({
            map: sanctuarySignTex,
            roughness: 0.35,
            metalness: 0.15
        });
        const sanctuarySignMesh = new THREE.Mesh(
            new THREE.BoxGeometry(13.8, 2.2, 0.2),
            [dockSignTrimMat, dockSignTrimMat, dockSignTrimMat, dockSignTrimMat, sanctuarySignMat, sanctuarySignMat]
        );
        sanctuarySignMesh.position.set(0, 13.0, -1.0);
        islandStationGroup.add(sanctuarySignMesh);

        // C. HELIPAD AERONAUTICAL STANCHION SIGN (At X = 17, Z = 14)
        const helipadSignTex = createHelipadSignboardTexture(portalDef.islandName, hexToRgbStr(portalDef.colors.primary));
        const helipadSignMesh = new THREE.Mesh(
            new THREE.BoxGeometry(5.2, 1.2, 0.15),
            new THREE.MeshStandardMaterial({ map: helipadSignTex, roughness: 0.4 })
        );
        helipadSignMesh.position.set(17, 3.0, 14.2);
        islandStationGroup.add(helipadSignMesh);

        // 7. THEMED FOLIAGE & PROPS PER GAME DESTINATION
        if (portalDef.id === 'dimension5') {
            // Glowing floating quantum octahedron crystals
            for (let i = 0; i < 6; i++) {
                const ang = (i / 6) * Math.PI * 2;
                const cr = new THREE.Mesh(
                    new THREE.OctahedronGeometry(1.2, 0),
                    new THREE.MeshStandardMaterial({ color: portalDef.colors.primary, roughness: 0.1, metalness: 0.9 })
                );
                cr.position.set(Math.cos(ang) * 18, 4.5, Math.sin(ang) * 18);
                islandStationGroup.add(cr);
            }
        } else if (portalDef.id === 'midnight_frontier') {
            // Evergreen Pine Trees & Granite Boulders
            [[-16, 12], [-18, -4], [-16, -18], [14, -18], [18, -6], [-4, -20]].forEach(([tx, tz]) => {
                const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 6, 8), dockMat);
                trunk.position.set(tx, 3.8, tz);
                islandStationGroup.add(trunk);
                for (let c = 0; c < 3; c++) {
                    const pineCone = new THREE.Mesh(
                        new THREE.ConeGeometry(3.2 - c * 0.7, 2.8, 7),
                        new THREE.MeshStandardMaterial({ color: 0x052e16, roughness: 0.85 })
                    );
                    pineCone.position.set(tx, 6.2 + c * 1.8, tz);
                    islandStationGroup.add(pineCone);
                }
            });
        } else if (portalDef.id === 'lost_horizon') {
            // Tropical Coconut Palms
            [[-16, 12], [-18, -4], [-15, -18], [15, -18], [18, -8], [-5, -20]].forEach(([px, pz]) => {
                const trunk = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.32, 0.48, 7.5, 8),
                    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 })
                );
                trunk.position.set(px, 4.5, pz);
                trunk.rotation.z = (Math.random() - 0.5) * 0.18;
                islandStationGroup.add(trunk);

                const fronds = new THREE.Mesh(
                    new THREE.ConeGeometry(4.2, 2.5, 8),
                    new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 })
                );
                fronds.position.set(px, 8.5, pz);
                islandStationGroup.add(fronds);
            });
        } else if (portalDef.id === 'water_hears') {
            // Jagged Volcanic Spikes & Red Hazard Markers
            [[-16, 10], [-18, -6], [-14, -18], [14, -18], [18, -6]].forEach(([sx, sz]) => {
                const spike = new THREE.Mesh(
                    new THREE.ConeGeometry(1.4, 6.5, 5),
                    new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.95 })
                );
                spike.position.set(sx, 4.0, sz);
                islandStationGroup.add(spike);

                const hazLight = new THREE.PointLight(0xef4444, 2.2, 14);
                hazLight.position.set(sx, 7.2, sz);
                islandStationGroup.add(hazLight);
            });
        } else if (portalDef.id === 'ferrari_odyssey') {
            // Italian Riviera Cypress Trees & Balustrades
            [[-16, 12], [-18, -4], [-15, -18], [15, -18]].forEach(([cx, cz]) => {
                const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 4, 8), dockMat);
                trunk.position.set(cx, 3.2, cz);
                const foliage = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.1, 1.4, 9, 10),
                    new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.8 })
                );
                foliage.position.set(cx, 8.0, cz);
                islandStationGroup.add(trunk, foliage);
            });
        } else if (portalDef.id === 'dinosaur_island') {
            // Giant Jurassic Ferns & Boulders
            [[-16, 12], [-18, -4], [-15, -18], [15, -18], [18, -8]].forEach(([fx, fz]) => {
                const fern = new THREE.Mesh(
                    new THREE.ConeGeometry(3.6, 4.5, 7),
                    new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.75 })
                );
                fern.position.set(fx, 3.6, fz);
                islandStationGroup.add(fern);

                const boulder = new THREE.Mesh(
                    new THREE.DodecahedronGeometry(1.8, 1),
                    new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.9 })
                );
                boulder.position.set(fx + 2.5, 2.2, fz + 1.5);
                islandStationGroup.add(boulder);
            });
        } else if (portalDef.id === 'grand_world_explorer') {
            // Tropical Coconut Palms & Moored Bamboo Catamaran and Outrigger Canoe
            [[-16, 12], [-18, -4], [-15, -18], [15, -18], [18, -8], [-5, -20]].forEach(([px, pz]) => {
                const trunk = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.32, 0.48, 7.5, 8),
                    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 })
                );
                trunk.position.set(px, 4.5, pz);
                trunk.rotation.z = (Math.random() - 0.5) * 0.18;
                islandStationGroup.add(trunk);

                const fronds = new THREE.Mesh(
                    new THREE.ConeGeometry(4.2, 2.5, 8),
                    new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.7 })
                );
                fronds.position.set(px, 8.5, pz);
                islandStationGroup.add(fronds);
            });

            // Moored Bamboo Catamaran Sail Raft & Tribal Outrigger Canoe beside dock
            const catRaft = buildMooredBambooCatamaran();
            catRaft.position.set(-6.5, 0.4, 28);
            catRaft.rotation.y = 0.2;
            islandStationGroup.add(catRaft);

            const outrigger = buildMooredTribalOutrigger();
            outrigger.position.set(6.8, 0.35, 27);
            outrigger.rotation.y = -0.15;
            islandStationGroup.add(outrigger);

            // Grand Multi-Tier Showroom Showcase Pedestal with Golden Beacon
            const showroomPillarMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3, metalness: 0.6 });
            const showcasePedestal = new THREE.Mesh(
                new THREE.CylinderGeometry(4.2, 4.5, 0.8, 16),
                showroomPillarMat
            );
            showcasePedestal.position.set(-15, 2.2, 0);
            const beaconGem = new THREE.Mesh(
                new THREE.OctahedronGeometry(1.6, 0),
                new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.1, metalness: 0.8 })
            );
            beaconGem.position.set(-15, 3.8, 0);
            islandStationGroup.add(showcasePedestal, beaconGem);
        }

        scene.add(islandStationGroup);

        // 8. REGISTER ALL WALKABLE SURFACES
        if (registerWalkableRef) {
            // Island landmass base
            registerWalkableRef(cx - 25, cx + 25, cz - 25, cz + 25, 1.5, 1.8);
            // Boat dock pier (extends into ocean for boat parking)
            registerWalkableRef(cx - 3.2, cx + 3.2, cz + 15, cz + 39, 1.25, 1.25);
            // Helipad landing deck
            registerWalkableRef(cx + 8, cx + 26, cz - 3, cz + 15, 1.85, 1.85);
            // Sanctuary floor
            registerWalkableRef(cx - 10, cx + 10, cz - 18, cz + 2, 1.8, 1.8);
        }

        portalEntities.push({
            def: portalDef,
            group: islandStationGroup,
            ring1: portalRing1,
            ring2: portalRing2,
            ring3: portalRing3,
            core: portalCoreMesh,
            beam: portalBeamMesh,
            light: portalLight
        });
    }

    // -------------------------------------------------------------------------
    // 5. SSJ FLAGSHIP BOATS (Preserved 2 Branded Boats)
    // -------------------------------------------------------------------------
    function createSSJBoatFlagTexture() {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 256;
        const ctx = c.getContext('2d');

        const grad = ctx.createLinearGradient(0, 0, 512, 256);
        grad.addColorStop(0, '#020617');
        grad.addColorStop(0.5, '#0b1d3a');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 256);

        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 14;
        ctx.strokeRect(10, 10, 492, 236);

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.strokeRect(22, 22, 468, 212);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 22px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★  SSJ ARCHIPELAGO FLAGSHIP  ★', 256, 52);

        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 105px Outfit, sans-serif';
        ctx.fillText('SSJ', 256, 155);

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 20px Outfit, sans-serif';
        ctx.fillText('EXPEDITION COMMAND', 256, 205);

        const tex = new THREE.CanvasTexture(c);
        tex.needsUpdate = true;
        return tex;
    }

    function setupSSJBoatFlags(boats, scene) {
        if (!boats || boats.length < 2) return;
        const flagTex = createSSJBoatFlagTexture();

        [0, 1].forEach((idx) => {
            const b = boats[idx];
            if (!b || !b.mesh || b.isTropical) return;

            const pole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.06, 0.08, 3.8, 12),
                new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.15 })
            );
            pole.position.set(0, 2.3, -4.6);
            b.mesh.add(pole);

            const flagGeo = new THREE.PlaneGeometry(2.1, 1.25, 20, 8);
            flagGeo.translate(1.05, 0, 0);

            const flagMat = new THREE.MeshStandardMaterial({
                map: flagTex,
                side: THREE.DoubleSide,
                roughness: 0.5,
                metalness: 0.1
            });

            const flagMesh = new THREE.Mesh(flagGeo, flagMat);
            flagMesh.position.set(0, 3.4, -4.6);
            b.mesh.add(flagMesh);

            ssjBoats.push(b);
            ssjFlagMeshes.push(flagMesh);
        });
    }

    function updateSSJBoatFlags(elapsed, dt) {
        ssjFlagMeshes.forEach((flagMesh, i) => {
            const b = ssjBoats[i];
            const boatSpeed = (b && b.speed) ? b.speed : 0;
            const isMoving = boatSpeed > 0.5;

            const pos = flagMesh.geometry.attributes.position;
            for (let v = 0; v < pos.count; v++) {
                const vx = pos.getX(v);
                const waveSpeed = isMoving ? 10.5 : 5.0;
                const waveFreq = isMoving ? 4.8 : 3.2;
                const waveAmp = (0.12 + (boatSpeed * 0.008)) * (vx / 2.1);
                pos.setZ(v, Math.sin(vx * waveFreq - elapsed * waveSpeed) * waveAmp);
            }
            pos.needsUpdate = true;
        });
    }

    // -------------------------------------------------------------------------
    // 6. WARP FLASH & SEAMLESS TELEPORT TRANSITION
    // (Extracted directly from 3d_tropical_boats_island_explorer (2).html)
    // -------------------------------------------------------------------------
    function triggerWarpFlash(callback) {
        const flash = document.getElementById('warp-flash');
        if (flash) {
            flash.style.opacity = '1';
            setTimeout(() => {
                if (callback) callback();
                setTimeout(() => {
                    flash.style.opacity = '0';
                }, 350);
            }, 250);
        } else if (callback) {
            callback();
        }
    }

    function teleportToExactGame(portalDef) {
        if (isSubgameActive) return;
        isSubgameActive = true;

        // Trigger Hyperspace Flash
        triggerWarpFlash(() => {
            // 1. Mute Main Game Sound
            if (SoundEngineRef && SoundEngineRef.ctx && SoundEngineRef.ctx.state === 'running') {
                try { SoundEngineRef.ctx.suspend(); } catch (e) {}
            }

            // 2. Hide ALL main game controls & HUD completely!
            document.body.classList.add('in-subgame-realm');
            const mainHudElements = [
                'prompt-banner',
                'horror-alert',
                'radar-box',
                'sky-explorer-hud',
                'btn-open-teleport-grid',
                'grand-island-banner'
            ];
            mainHudElements.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.add('hidden');
            });

            // 3. Hide Top Navigation Container
            const topNav = document.querySelector('.fixed.top-2.left-2.right-2');
            if (topNav) topNav.style.display = 'none';

            // 4. Launch Clean Full-Screen Subgame Runner
            const modal = document.getElementById('subgame-runner-modal');
            const frame = document.getElementById('subgame-frame');

            if (modal && frame) {
                frame.src = encodeURI(portalDef.gameFile);
                modal.classList.remove('hidden');
                setTimeout(() => { frame.focus(); }, 300);
            }
        });
    }

    function returnToMainWorld() {
        triggerWarpFlash(() => {
            const modal = document.getElementById('subgame-runner-modal');
            const frame = document.getElementById('subgame-frame');

            if (frame) frame.src = 'about:blank';
            if (modal) modal.classList.add('hidden');

            isSubgameActive = false;

            // 1. Restore Main Game Controls & HUD
            document.body.classList.remove('in-subgame-realm');
            const topNav = document.querySelector('.fixed.top-2.left-2.right-2');
            if (topNav) topNav.style.display = '';

            const radarBox = document.getElementById('radar-box');
            if (radarBox) radarBox.classList.remove('hidden');

            // 2. Resume Main Game Sound
            if (SoundEngineRef && SoundEngineRef.ctx && SoundEngineRef.ctx.state === 'suspended') {
                try { SoundEngineRef.ctx.resume(); } catch (e) {}
            }

            // If player was inside or near Pennywise House doorway/interior, place safely on porch steps facing street
            if (playerRef && Math.abs(playerRef.pos.x - 545) < 8.0 && playerRef.pos.z > -93.0 && playerRef.pos.z < -80.0) {
                playerRef.pos.set(545, 6.2, -96.5);
            }

            // If player was at an Archipelago Portal Island, place safely on sanctuary floor facing walkway/dock
            if (playerRef) {
                for (const p of portalEntities) {
                    const portalZ = p.def.coords.z - 8.0;
                    const dist = Math.hypot(playerRef.pos.x - p.def.coords.x, playerRef.pos.z - portalZ);
                    if (dist < 30.0) {
                        playerRef.pos.set(p.def.coords.x, 1.85, p.def.coords.z - 1.0);
                        break;
                    }
                }
            }
        });
    }

    // -------------------------------------------------------------------------
    // 7. INJECT CLEAN RUNNER & WARP FLASH MARKUP
    // -------------------------------------------------------------------------
    let discoveryBannerTimer = null;
    function triggerIslandDiscoveryCelebration(portalDef, isFirstDiscovery) {
        const banner = document.getElementById("grand-island-banner");
        if (!banner) return;
        const tag = document.getElementById("banner-tag");
        const title = document.getElementById("banner-island-title");
        const sub = document.getElementById("banner-island-subtitle");
        if (tag) tag.textContent = isFirstDiscovery ? "★ UNCHARTED TERRITORY DISCOVERED ★" : "⚓ DOCKED AT ISLAND HARBOR ⚓";
        if (title) title.textContent = portalDef.islandName;
        if (sub) sub.textContent = portalDef.attachedGameTitle + " • " + portalDef.theme;
        playCelebrationChime(isFirstDiscovery);
        banner.classList.remove("opacity-0", "-translate-y-8");
        banner.classList.add("opacity-100", "translate-y-0");
        if (discoveryBannerTimer) clearTimeout(discoveryBannerTimer);
        discoveryBannerTimer = setTimeout(() => {
            banner.classList.remove("opacity-100", "translate-y-0");
            banner.classList.add("opacity-0", "-translate-y-8");
        }, isFirstDiscovery ? 4800 : 2600);
    }
    function playCelebrationChime(isMajor) {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = (SoundEngineRef && SoundEngineRef.ctx) ? SoundEngineRef.ctx : new AudioCtx();
            if (ctx.state === "suspended") ctx.resume();
            const now = ctx.currentTime;
            const notes = isMajor ? [523.25, 659.25, 783.99, 1046.50] : [587.33, 880.0];
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "triangle";
                osc.frequency.setValueAtTime(freq, now + idx * 0.12);
                gain.gain.setValueAtTime(0.001, now + idx * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.25, now + idx * 0.12 + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.8);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + idx * 0.12);
                osc.stop(now + idx * 0.12 + 0.85);
            });
        } catch (e) {}
    }
    function injectRunnerUI() {
        const bannerDiv = document.createElement("div");
        bannerDiv.id = "grand-island-banner";
        bannerDiv.className = "fixed top-6 left-1/2 -translate-x-1/2 z-[9990] pointer-events-none transition-all duration-700 opacity-0 -translate-y-8 flex flex-col items-center";
        bannerDiv.innerHTML = '<div class="px-6 py-3.5 rounded-2xl bg-slate-950/95 border-2 border-amber-400/90 shadow-[0_0_40px_rgba(245,158,11,0.5)] backdrop-blur-xl flex flex-col items-center text-center max-w-lg">' +
            '<div class="flex items-center gap-2 text-amber-300 text-xs font-black tracking-widest uppercase mb-1">' +
                '<i class="fa-solid fa-compass fa-spin" style="--fa-animation-duration: 4s;"></i>' +
                '<span id="banner-tag">UNCHARTED TERRITORY DISCOVERED</span>' +
                '<i class="fa-solid fa-compass fa-spin" style="--fa-animation-duration: 4s;"></i>' +
            '</div>' +
            '<div id="banner-island-title" class="text-xl md:text-2xl font-black text-white tracking-wide uppercase drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]">' +
                'ISLAND NAME' +
            '</div>' +
            '<div id="banner-island-subtitle" class="text-xs font-semibold text-cyan-300 mt-1">' +
                'ATTACHED GAME TITLE' +
            '</div>' +
        '</div>';
        document.body.appendChild(bannerDiv);

        // Hyperspace Flash Overlay (From reference 2)
        const flashDiv = document.createElement('div');
        flashDiv.id = 'warp-flash';
        flashDiv.className = 'fixed inset-0 bg-white opacity-0 pointer-events-none transition-opacity duration-300 z-[99999]';
        document.body.appendChild(flashDiv);

        // Isolated Full-Screen Subgame Runner with Floating Exit Pill
        const runnerDiv = document.createElement('div');
        runnerDiv.id = 'subgame-runner-modal';
        runnerDiv.className = 'fixed inset-0 z-[9999] bg-black hidden';
        runnerDiv.innerHTML = `
            <!-- Floating Minimalist Exit Button -->
            <button id="btn-return-main-world" class="fixed top-3 left-3 z-[10000] px-4 py-2 rounded-xl bg-slate-950/90 hover:bg-slate-900 text-amber-300 hover:text-white border-2 border-amber-400 shadow-2xl backdrop-blur-md flex items-center gap-2 font-extrabold text-xs md:text-sm cursor-pointer transition-all hover:scale-105 pointer-events-auto">
                <i class="fa-solid fa-arrow-left"></i>
                <span>EXIT TO MAIN WORLD</span>
                <span class="text-[10px] text-slate-400 font-mono ml-1">[ESC]</span>
            </button>
            <iframe id="subgame-frame" class="w-full h-full border-0 block" allow="autoplay; fullscreen; accelerometer; gyroscope"></iframe>
        `;
        document.body.appendChild(runnerDiv);

        document.getElementById('btn-return-main-world').onclick = returnToMainWorld;

        // Escape Key returns from subgame
        if (typeof window !== 'undefined' && window.addEventListener) {
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && isSubgameActive) {
                    returnToMainWorld();
                }
            });
        }
    }

    // -------------------------------------------------------------------------
    // 8. UPDATE ANIMATION LOOP & PROXIMITY TELEPORT
    // -------------------------------------------------------------------------
    function update(dt, elapsed) {
        if (isSubgameActive) return;

        // 1. Animate SSJ Flags
        updateSSJBoatFlags(elapsed, dt);

        if (portalCooldown > 0) portalCooldown = Math.max(0, portalCooldown - dt);

        // 2. Animate 3D Portal Gates (Counter-Rotating Rings & Swirling Vortex)
        portalEntities.forEach(p => {
            p.ring1.rotation.z = elapsed * 1.4;
            p.ring2.rotation.z = -elapsed * 0.95;
            p.ring3.rotation.z = elapsed * 2.1;
            p.core.rotation.z = -elapsed * 2.6;

            const pulse = 1.0 + Math.sin(elapsed * 4.5) * 0.06;
            p.core.scale.set(pulse, pulse, 1);
        });

        // 3. Proximity check for Island Discovery & Portal Entry
        if (playerRef) {
            activeNearPortal = null;
            for (const p of portalEntities) {
                const distToIsland = Math.hypot(playerRef.pos.x - p.def.coords.x, playerRef.pos.z - p.def.coords.z);

                // Island Discovery Radius (65m)
                if (distToIsland < 65.0) {
                    if (!p.def.discovered) {
                        p.def.discovered = true;
                        triggerIslandDiscoveryCelebration(p.def, true);
                    }
                }

                // Portal gate is centered inside the sanctuary at Z = cz - 8
                const portalZ = p.def.coords.z - 8.0;
                const distToGate = Math.hypot(playerRef.pos.x - p.def.coords.x, playerRef.pos.z - portalZ);

                // Approaching portal entrance inside sanctuary
                if (distToGate < 12.0) {
                    activeNearPortal = p.def;
                    if (distToGate < 6.5 && portalCooldown <= 0) {
                        portalCooldown = 3.5;
                        teleportToExactGame(p.def);
                        break;
                    }
                }
            }

            const promptEl = document.getElementById('prompt-banner');
            if (activeNearPortal && promptEl && !isSubgameActive) {
                promptEl.textContent = `Entering ${activeNearPortal.attachedGameTitle}... Press [E] to Teleport!`;
                promptEl.classList.remove('hidden');
            }
        }
    }

    function handleInteractionKey() {
        if (activeNearPortal) {
            teleportToExactGame(activeNearPortal);
            return true;
        }
        return false;
    }

    // -------------------------------------------------------------------------
    // 9. INITIALIZATION
    // -------------------------------------------------------------------------
    function init(context) {
        sceneRef = context.scene;
        cameraRef = context.camera;
        playerRef = context.player;
        SoundEngineRef = context.SoundEngine;
        registerWalkableRef = context.registerWalkable;

        injectRunnerUI();

        // Build all six 3D Dimensional Portals in the open ocean
        GAME_REGISTRY.forEach(portalDef => {
            build3DPortalGate(sceneRef, portalDef);
        });

        // SSJ Flagship Boats
        if (context.boats) {
            setupSSJBoatFlags(context.boats, sceneRef);
        }
    }

    // -------------------------------------------------------------------------
    // 10. RADAR & JOURNAL EXTENSIONS
    // -------------------------------------------------------------------------
    function renderArchipelagoRadar(ctx, cx, cy, scale, player, camYaw) {
        if (!ctx || !player || !player.pos) return;
        const maxDistSq = 70 * 70;
        GAME_REGISTRY.forEach(portal => {
            const rx = (portal.coords.x - player.pos.x) * scale;
            const rz = (portal.coords.z - player.pos.z) * scale;
            if (rx * rx + rz * rz > maxDistSq) return;

            ctx.fillStyle = portal.discovered ? '#38bdf8' : '#c084fc';
            ctx.beginPath();
            ctx.arc(rx, rz, 4.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.2;
            ctx.stroke();
        });
    }

    function openExplorationJournal() {
        const gridModal = document.getElementById('teleport-grid-modal');
        if (gridModal) gridModal.classList.remove('hidden');
    }

    return {
        GAME_REGISTRY,
        init,
        update,
        handleInteractionKey,
        teleportToExactGame,
        returnToMainWorld,
        renderArchipelagoRadar,
        openExplorationJournal,
        isSubgameActive: () => isSubgameActive
    };
})();
