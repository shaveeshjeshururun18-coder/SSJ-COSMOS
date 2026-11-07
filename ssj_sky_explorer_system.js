/**
 * ==============================================================================
 * SSJ TROPICAL SKY EXPLORER & PARADISE ISLAND INTEGRATION FOR LOS SANTOS
 * ==============================================================================
 * Direct extraction & seamless open world integration from:
 * C:\Users\HP\Downloads\ssj_tropical_sky_explorer.html
 * 
 * Features:
 * - Paradise Island added to the scenic South-West open ocean of Los Santos:
 *   - Sandy beach base with shallow turquoise lagoon shelf & surf foam ring
 *   - Lush green mid-tier ridge with coastal village huts
 *   - Craggy mountain cliff peak with Red-and-White Lighthouse & rotating beacon
 *   - Wooden beach watchtower with ladder & bamboo pyramid roof
 *   - Wooden harbor landing pier dock extending into the turquoise lagoon
 *   - 32+ 3D tropical palm trees with curved trunks & layered fronds
 *   - Natural Stone Arch Island (Arch Rock Atoll) with twin pillars & fly-through bridge
 *   - Golden Sky Relic Rings with rotating octahedrons & rewarding chime audio
 *   - Flocks of 3D circling seagulls with flapping wings
 * - NO duplicate water mesh added to Los Santos - sits naturally in Los Santos ocean!
 * - SSJ Tropical Sky Explorer bamboo raft flying vehicle PARKED on the island harbor pier!
 * - Handcrafted layered log hull, 4 outrigger propeller lift turbines, glowing thrusters,
 *   dual-blade rotors, steering wheel, brass dashboard, canvas canopy & SSJ Crown flag!
 * - Identical flight physics: acceleration, braking, banking roll, pitch, climb, dive, boost!
 * - Synthesized Web Audio engine (propeller drone & relic collection chime)
 * - Semi-transparent Speedometer & Altitude HUD with radial speed arc
 * - Walkable surfaces for pier, beach, village, watchtower deck, and lighthouse peak!
 * ==============================================================================
 */

window.SSJSkyExplorer = (function() {
    'use strict';

    // -------------------------------------------------------------------------
    // 1. CONFIGURATION & WORLD COORDINATES (IN LOS SANTOS OCEAN)
    // -------------------------------------------------------------------------
    const ISLAND_CONFIG = {
        mainPos: { x: -420, y: 0, z: 440 },
        archPos: { x: -570, y: 0, z: 470 },
        pierWorldPos: { x: -458, y: 2.6, z: 362 },
        vehicleParkedPos: { x: -458, y: 3.2, z: 362, yaw: 0.25 }
    };

    // Default keybinds
    const DEFAULT_KEYBINDS = {
        forward:  { code: 'KeyW',       label: 'W',     name: 'Forward / Accelerate' },
        backward: { code: 'KeyS',       label: 'S',     name: 'Reverse / Brake' },
        left:     { code: 'KeyA',       label: 'A',     name: 'Steer Left / Bank' },
        right:    { code: 'KeyD',       label: 'D',     name: 'Steer Right / Bank' },
        ascend:   { code: 'Space',      label: 'SPACE', name: 'Ascend / Lift Up' },
        descend:  { code: 'KeyC',       label: 'C',     name: 'Descend / Dive Down' },
        boost:    { code: 'ShiftLeft',  label: 'SHIFT', name: 'Turbo Boost' },
        interact: { code: 'KeyE',       label: 'E',     name: 'Enter / Exit Vehicle' }
    };

    let activeKeybinds = JSON.parse(JSON.stringify(DEFAULT_KEYBINDS));

    try {
        const saved = JSON.parse(localStorage.getItem('ssj_sky_explorer_keybinds') || 'null');
        if (saved) {
            for (const action in saved) {
                if (activeKeybinds[action]) {
                    activeKeybinds[action].code = saved[action].code;
                    activeKeybinds[action].label = saved[action].label;
                }
            }
        }
    } catch (e) {}

    const inputState = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        ascend: false,
        descend: false,
        boost: false
    };

    // Vehicle state
    const state = {
        pos: new THREE.Vector3(-458, 3.2, 362), // Parked on Paradise Harbor Pier!
        yaw: 0.25,
        pitch: 0,
        roll: 0,
        yawRate: 0,
        forwardSpeed: 0,
        verticalSpeed: 0,
        inVehicle: false,
        mesh: null,
        raftChassis: null,
        driverSeat: null,
        steeringWheel: null,
        throttleLever: null,
        liftLever: null,
        flagPosAttr: null,
        sailPosAttr: null,
        sailBaseY: null,
        propellers: [],
        thrusterCones: [],
        beaconRing: null,
        seagulls: [],
        relics: [],
        collectedRelics: 0,
        lighthouseLight: null,
        searchlightBeam: null
    };

    let sceneRef = null;
    let cameraRef = null;
    let playerRef = null;
    let registerWalkableRef = null;
    let getSeafloorHeightRef = null;
    let getWaveHeightRef = null;

    // -------------------------------------------------------------------------
    // 2. PROCEDURAL TEXTURE GENERATORS (Wood, Bamboo, Sail, SSJ Flag)
    // -------------------------------------------------------------------------
    function createWoodTexture(baseHex, grainHex) {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext('2d');
        ctx.fillStyle = baseHex;
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = grainHex;
        for (let i = 0; i < 90; i++) {
            const y = Math.random() * 256;
            const h = 1 + Math.random() * 4;
            ctx.globalAlpha = 0.15 + Math.random() * 0.25;
            ctx.fillRect(0, y, 256, h);
        }
        ctx.globalAlpha = 0.45;
        ctx.strokeStyle = '#1f1209';
        ctx.lineWidth = 2;
        for (let y = 0; y < 256; y += 32) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(256, y);
            ctx.stroke();
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }

    function createBambooTexture() {
        const c = document.createElement('canvas');
        c.width = 128;
        c.height = 256;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#b5944d';
        ctx.fillRect(0, 0, 128, 256);
        ctx.fillStyle = '#8f7032';
        for (let i = 0; i < 40; i++) {
            const x = Math.random() * 128;
            ctx.globalAlpha = 0.15 + Math.random() * 0.2;
            ctx.fillRect(x, 0, 2 + Math.random() * 4, 256);
        }
        ctx.globalAlpha = 0.85;
        for (let y = 32; y < 256; y += 48) {
            ctx.fillStyle = '#4a3717';
            ctx.fillRect(0, y, 128, 4);
            ctx.fillStyle = '#e8caa4';
            ctx.fillRect(0, y + 4, 128, 2);
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }

    function createSailCanvasTexture() {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#eadeca';
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = '#c7b299';
        for (let i = 0; i < 200; i++) {
            ctx.globalAlpha = 0.08 + Math.random() * 0.12;
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            ctx.fillRect(x, 0, 1, 256);
            ctx.fillRect(0, y, 256, 1);
        }
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = '#8f7b65';
        ctx.lineWidth = 3;
        for (let x = 64; x < 256; x += 64) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 256);
            ctx.stroke();
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }

    function createSSJFlagTexture() {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 320;
        const ctx = c.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 512, 320);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(0.5, '#0369a1');
        grad.addColorStop(1, '#0284c7');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 320);

        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 14;
        ctx.strokeRect(12, 12, 488, 296);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.strokeRect(24, 24, 464, 272);

        // Gold SSJ Crown Emblem
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(170, 130);
        ctx.lineTo(210, 80);
        ctx.lineTo(256, 120);
        ctx.lineTo(302, 80);
        ctx.lineTo(342, 130);
        ctx.lineTo(326, 150);
        ctx.lineTo(186, 150);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 68px "Cinzel", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
        ctx.fillText('SSJ', 256, 205);

        ctx.font = '700 20px "Inter", sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.letterSpacing = '6px';
        ctx.fillText('SKY EXPLORER', 256, 255);

        return new THREE.CanvasTexture(c);
    }

    function createSSJWoodPlateTexture() {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 128;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#45220d';
        ctx.fillRect(0, 0, 256, 128);
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 6;
        ctx.strokeRect(6, 6, 244, 116);
        ctx.fillStyle = '#fef08a';
        ctx.font = '900 48px "Cinzel", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 6;
        ctx.fillText('SSJ', 128, 64);
        return new THREE.CanvasTexture(c);
    }

    // -------------------------------------------------------------------------
    // 3. WEB AUDIO SYNTHESIS ENGINE (Propeller drone & Relic chime)
    // -------------------------------------------------------------------------
    let audioCtx = null;
    let propOsc = null;
    let propGain = null;
    let soundEnabled = true;

    function initAudio() {
        if (audioCtx) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
            propOsc = audioCtx.createOscillator();
            const filter = audioCtx.createBiquadFilter();
            propGain = audioCtx.createGain();

            propOsc.type = 'sawtooth';
            propOsc.frequency.value = 48;
            filter.type = 'lowpass';
            filter.frequency.value = 140;
            propGain.gain.value = 0.04;

            propOsc.connect(filter);
            filter.connect(propGain);
            propGain.connect(audioCtx.destination);
            propOsc.start();
        } catch (e) {}
    }

    function playChime() {
        if (!audioCtx) initAudio();
        if (!audioCtx || !soundEnabled) return;
        try {
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1046.5, audioCtx.currentTime + 0.35);
            g.gain.setValueAtTime(0.18, audioCtx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
            osc.connect(g);
            g.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.4);
        } catch (e) {}
    }

    // -------------------------------------------------------------------------
    // 4. PALM TREE BUILDER
    // -------------------------------------------------------------------------
    function createPalmTree(x, y, z, scale = 1.0, lean = 0.18, materials) {
        const palm = new THREE.Group();
        palm.position.set(x, y, z);
        palm.scale.setScalar(scale);
        palm.rotation.y = Math.random() * Math.PI * 2;

        const trunkSegments = 7;
        let currY = 0;
        let currX = 0;
        for (let s = 0; s < trunkSegments; s++) {
            const segH = 1.5;
            const rBot = 0.52 - s * 0.035;
            const rTop = 0.48 - s * 0.035;
            const seg = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, segH, 7), materials.trunkMat);
            seg.position.set(currX, currY + segH / 2, 0);
            seg.rotation.z = -lean * 0.35 * s;
            seg.castShadow = true;
            seg.receiveShadow = true;
            palm.add(seg);
            currY += segH * 0.94;
            currX += Math.sin(lean * 0.35 * s) * segH;
        }

        // Coconuts
        const cocoMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.85 });
        for (let i = 0; i < 4; i++) {
            const nut = new THREE.Mesh(new THREE.SphereGeometry(0.32, 6, 6), cocoMat);
            nut.position.set(currX + Math.cos(i * 1.5) * 0.42, currY - 0.2, Math.sin(i * 1.5) * 0.42);
            palm.add(nut);
        }

        // Layered Palm Fronds
        const numFronds = 7;
        for (let f = 0; f < numFronds; f++) {
            const frond = new THREE.Group();
            frond.position.set(currX, currY, 0);
            const ang = (f / numFronds) * Math.PI * 2;
            frond.rotation.y = ang;

            const leafGeo = new THREE.PlaneGeometry(0.95, 4.2, 3, 5);
            const leaf = new THREE.Mesh(leafGeo, materials.frondMat);
            leaf.position.set(0, 0.4, 2.0);
            leaf.rotation.x = Math.PI / 2.7;
            leaf.castShadow = true;
            frond.add(leaf);

            palm.add(frond);
        }
        return palm;
    }

    // -------------------------------------------------------------------------
    // 5. BUILD PARADISE ISLAND IN LOS SANTOS (NO EXTRA WORLD WATER PLANE!)
    // -------------------------------------------------------------------------
    function buildParadiseIsland(scene) {
        // Shared Materials
        const darkWoodTex = createWoodTexture('#4a2c16', '#2b1708');
        const medWoodTex = createWoodTexture('#6e4423', '#3d2310');
        const bambooTex = createBambooTexture();
        const logMat = new THREE.MeshStandardMaterial({ map: darkWoodTex, roughness: 0.78, metalness: 0.05 });
        const plankMat = new THREE.MeshStandardMaterial({ map: medWoodTex, roughness: 0.7, metalness: 0.08 });
        const bambooMat = new THREE.MeshStandardMaterial({ map: bambooTex, roughness: 0.55, metalness: 0.08 });
        const darkIronMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.85, roughness: 0.4 });

        const sandMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.88 });
        const grassMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.82 });
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.88, flatShading: true });
        const frondMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.6, side: THREE.DoubleSide });
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78553a, roughness: 0.9 });

        const islandMaterials = { sandMat, grassMat, rockMat, frondMat, trunkMat, plankMat, bambooMat, logMat, darkIronMat };

        const mainPos = ISLAND_CONFIG.mainPos;
        const mainIsland = new THREE.Group();
        mainIsland.position.set(mainPos.x, 0, mainPos.z);

        // 5A. White Foam Ring around Main Island (shore accent only, not a world ocean plane!)
        const foamRing = new THREE.Mesh(
            new THREE.RingGeometry(94, 102, 48),
            new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.65, side: THREE.DoubleSide })
        );
        foamRing.rotation.x = -Math.PI / 2;
        foamRing.position.y = 0.25;
        mainIsland.add(foamRing);

        // Shallow Turquoise Lagoon Shelf (local circular accent around island)
        const lagoonShelf = new THREE.Mesh(
            new THREE.CylinderGeometry(96, 112, 2.2, 40),
            new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.45 })
        );
        lagoonShelf.position.y = -0.9;
        mainIsland.add(lagoonShelf);

        // 5B. Sandy Beach Base
        const beachBase = new THREE.Mesh(new THREE.CylinderGeometry(78, 92, 5.5, 36), sandMat);
        beachBase.position.y = 1.6;
        beachBase.receiveShadow = true;
        mainIsland.add(beachBase);

        // Lush Green Island Mid-Tier
        const greenTier = new THREE.Mesh(new THREE.CylinderGeometry(58, 74, 11, 28), grassMat);
        greenTier.position.set(6, 7.5, 8);
        greenTier.receiveShadow = true;
        greenTier.castShadow = true;
        mainIsland.add(greenTier);

        // Dramatic Craggy Mountain Cliff for Lighthouse
        const cliffPeak = new THREE.Mesh(new THREE.CylinderGeometry(22, 46, 38, 16), rockMat);
        cliffPeak.position.set(14, 28, 18);
        cliffPeak.castShadow = true;
        cliffPeak.receiveShadow = true;
        mainIsland.add(cliffPeak);

        const cliffCap = new THREE.Mesh(new THREE.CylinderGeometry(21, 23, 3, 16), grassMat);
        cliffCap.position.set(14, 47.5, 18);
        mainIsland.add(cliffCap);

        // Iconic Red-and-White Lighthouse at Peak
        const lighthouse = new THREE.Group();
        lighthouse.position.set(14, 48.5, 18);

        const lhBody = new THREE.Mesh(
            new THREE.CylinderGeometry(4.2, 6.2, 24, 16),
            new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 })
        );
        lhBody.position.y = 12;
        lhBody.castShadow = true;
        lighthouse.add(lhBody);

        const lhRedBand = new THREE.Mesh(
            new THREE.CylinderGeometry(4.4, 4.9, 6, 16),
            new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 })
        );
        lhRedBand.position.y = 20;
        lighthouse.add(lhRedBand);

        const lhGallery = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, 1.2, 16), darkIronMat);
        lhGallery.position.y = 24.5;
        lighthouse.add(lhGallery);

        const lhLantern = new THREE.Mesh(
            new THREE.CylinderGeometry(3.5, 3.5, 4.5, 12),
            new THREE.MeshBasicMaterial({ color: 0xfef08a })
        );
        lhLantern.position.y = 27;
        lighthouse.add(lhLantern);

        const lhPointLight = new THREE.PointLight(0xfef08a, 2.5, 75);
        lhPointLight.position.set(0, 27, 0);
        lighthouse.add(lhPointLight);

        // Rotating Searchlight Beam
        const beamGeo = new THREE.CylinderGeometry(0.5, 18, 90, 16);
        beamGeo.rotateX(Math.PI / 2);
        beamGeo.translate(0, 0, 45);
        const beamMat = new THREE.MeshBasicMaterial({
            color: 0xfef08a,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide
        });
        const searchlight = new THREE.Mesh(beamGeo, beamMat);
        searchlight.position.y = 27;
        lighthouse.add(searchlight);
        state.searchlightBeam = searchlight;

        const lhRoof = new THREE.Mesh(
            new THREE.ConeGeometry(4.8, 4.5, 16),
            new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.5 })
        );
        lhRoof.position.y = 31;
        lighthouse.add(lhRoof);

        mainIsland.add(lighthouse);

        // Coastal Explorer Village Huts
        const hutPositions = [
            { x: -32, y: 12.5, z: -22, rot: 0.4 },
            { x: -16, y: 12.5, z: -34, rot: -0.2 },
            { x: -45, y: 5.2,  z: -38, rot: 0.8 },
            { x: -8,  y: 5.2,  z: -56, rot: 0.1 }
        ];
        hutPositions.forEach(hp => {
            const hut = new THREE.Group();
            hut.position.set(hp.x, hp.y, hp.z);
            hut.rotation.y = hp.rot;
            const walls = new THREE.Mesh(new THREE.BoxGeometry(8, 5.5, 6.5), plankMat);
            walls.position.y = 2.75;
            walls.castShadow = true;
            const roof = new THREE.Mesh(new THREE.ConeGeometry(6.8, 4.5, 4), bambooMat);
            roof.position.y = 7.5;
            roof.rotation.y = Math.PI / 4;
            roof.castShadow = true;
            hut.add(walls, roof);
            mainIsland.add(hut);
        });

        // Tall Wooden Watchtower on the Beach
        const watchtower = new THREE.Group();
        watchtower.position.set(-22, 4.2, -62);
        [[-2.5, -2.5], [2.5, -2.5], [-2.5, 2.5], [2.5, 2.5]].forEach(([cx, cz]) => {
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 14, 8), logMat);
            pole.position.set(cx, 7, cz);
            pole.castShadow = true;
            watchtower.add(pole);
        });
        const wtDeck = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.4, 6.5), plankMat);
        wtDeck.position.y = 12.8;
        const wtRoof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 3.2, 4), bambooMat);
        wtRoof.position.y = 16.2;
        wtRoof.rotation.y = Math.PI / 4;
        watchtower.add(wtDeck, wtRoof);
        mainIsland.add(watchtower);

        // Wooden Harbor Pier / Landing Dock extending into turquoise bay
        const pier = new THREE.Group();
        pier.position.set(-38, 2.6, -78);
        pier.rotation.y = -0.35;
        const pierDeck = new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 34), plankMat);
        pierDeck.receiveShadow = true;
        pier.add(pierDeck);
        for (let pz = -15; pz <= 15; pz += 6) {
            [-3.4, 3.4].forEach(px => {
                const post = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 6, 8), logMat);
                post.position.set(px, -1.5, pz);
                pier.add(post);
            });
        }
        mainIsland.add(pier);

        scene.add(mainIsland);

        // Scatter 32 Palm Trees on Main Island
        for (let i = 0; i < 32; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 28 + Math.random() * 52;
            const px = mainPos.x + Math.cos(angle) * dist;
            const pz = mainPos.z + Math.sin(angle) * dist;
            const py = dist < 54 ? 12.8 : 4.2;
            scene.add(createPalmTree(px, py, pz, 0.85 + Math.random() * 0.55, 0.18, islandMaterials));
        }

        // 5C. NATURAL STONE ARCH ISLAND (Arch Rock Atoll)
        const archPos = ISLAND_CONFIG.archPos;
        const archIsland = new THREE.Group();
        archIsland.position.set(archPos.x, 0, archPos.z);

        const archBeach = new THREE.Mesh(new THREE.CylinderGeometry(48, 58, 4.5, 28), sandMat);
        archBeach.position.y = 1.4;
        archIsland.add(archBeach);

        const leftPillar = new THREE.Mesh(new THREE.CylinderGeometry(14, 22, 36, 12), rockMat);
        leftPillar.position.set(-18, 18, 0);
        const rightPillar = new THREE.Mesh(new THREE.CylinderGeometry(12, 20, 32, 12), rockMat);
        rightPillar.position.set(18, 16, 0);
        const archBridge = new THREE.Mesh(new THREE.BoxGeometry(44, 11, 18), rockMat);
        archBridge.position.set(0, 31, 0);
        const archTopGrass = new THREE.Mesh(new THREE.BoxGeometry(40, 3, 15), grassMat);
        archTopGrass.position.set(0, 37, 0);

        archIsland.add(leftPillar, rightPillar, archBridge, archTopGrass);
        scene.add(archIsland);

        // Scatter 10 Palm Trees on Stone Arch Atoll
        for (let i = 0; i < 10; i++) {
            const a = Math.random() * Math.PI * 2;
            scene.add(createPalmTree(archPos.x + Math.cos(a) * 32, 3.6, archPos.z + Math.sin(a) * 32, 0.9, 0.18, islandMaterials));
        }

        // 5D. Golden Sky Relic Rings
        state.relics = [];
        const relicLocations = [
            { x: -458, y: 12, z: 362 }, // Over the Harbor Pier & Parked Vehicle!
            { x: -570, y: 18, z: 470 }, // Inside the Natural Stone Sea Arch!
            { x: -406, y: 86, z: 458 }, // Above the Red-White Lighthouse Peak!
            { x: -435, y: 22, z: 415 }, // Over the Coastal Village Huts!
            { x: -490, y: 25, z: 420 }, // Between Main Island and Stone Arch!
            { x: -420, y: 55, z: 380 }  // High altitude ocean approach!
        ];

        relicLocations.forEach((loc, idx) => {
            const rGroup = new THREE.Group();
            rGroup.position.set(loc.x, loc.y, loc.z);
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(3.6, 0.32, 12, 28),
                new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xca8a04, emissiveIntensity: 0.45, metalness: 0.8, roughness: 0.2 })
            );
            const innerStar = new THREE.Mesh(
                new THREE.OctahedronGeometry(1.6, 0),
                new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.7, roughness: 0.1 })
            );
            rGroup.add(ring, innerStar);
            scene.add(rGroup);
            state.relics.push({ group: rGroup, collected: false, id: idx });
        });

        // 5E. Animated Flocking Seagulls
        state.seagulls = [];
        const gullMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        for (let g = 0; g < 10; g++) {
            const gull = new THREE.Group();
            const leftWing = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.45), gullMat);
            leftWing.position.x = -0.7;
            const rightWing = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.45), gullMat);
            rightWing.position.x = 0.7;
            gull.add(leftWing, rightWing);
            scene.add(gull);
            state.seagulls.push({
                group: gull,
                leftWing,
                rightWing,
                cx: -406 + (Math.random() - 0.5) * 60,
                cz: 458 + (Math.random() - 0.5) * 60,
                radius: 40 + Math.random() * 65,
                angle: Math.random() * Math.PI * 2,
                speed: 0.45 + Math.random() * 0.4,
                y: 55 + Math.random() * 35
            });
        }

        // Register Walkable Surfaces for Los Santos on foot exploration!
        if (registerWalkableRef) {
            // Pier dock deck
            registerWalkableRef(-463, -453, 344, 380, 3.1, 3.1);
            // Lighthouse cap platform
            registerWalkableRef(-418, -394, 446, 470, 48.5, 48.5);
            // Coastal village central pad
            registerWalkableRef(-445, -395, 410, 455, 12.5, 12.5);
            // Watchtower observation deck
            registerWalkableRef(-444, -440, 376, 380, 17.0, 17.0);
            // Natural Stone Arch bridge top
            registerWalkableRef(-592, -548, 461, 479, 38.0, 38.0);
        }
    }

    // -------------------------------------------------------------------------
    // 6. BUILD SSJ TROPICAL SKY EXPLORER BAMBOO RAFT FLYING VEHICLE
    // -------------------------------------------------------------------------
    function buildVehicle(scene) {
        const vehicleGroup = new THREE.Group();
        const raftChassis = new THREE.Group();
        vehicleGroup.add(raftChassis);

        const darkWoodTex = createWoodTexture('#4a2c16', '#2b1708');
        const medWoodTex = createWoodTexture('#6e4423', '#3d2310');
        const bambooTex = createBambooTexture();
        const sailTex = createSailCanvasTexture();
        const flagTex = createSSJFlagTexture();
        const plateTex = createSSJWoodPlateTexture();

        const logMat = new THREE.MeshStandardMaterial({ map: darkWoodTex, roughness: 0.78, metalness: 0.05 });
        const capMat = new THREE.MeshStandardMaterial({ color: 0x221307, roughness: 0.95 });
        const plankMat = new THREE.MeshStandardMaterial({ map: medWoodTex, roughness: 0.7, metalness: 0.08 });
        const bambooMat = new THREE.MeshStandardMaterial({ map: bambooTex, roughness: 0.55, metalness: 0.08 });
        const ropeMat = new THREE.MeshStandardMaterial({ color: 0xc2a375, roughness: 0.9, metalness: 0.0 });
        const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.32, metalness: 0.85 });
        const darkIronMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.45, metalness: 0.85 });
        const coneMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55 });
        const innerConeMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.85 });
        const wickerMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 });

        // 3A. Main Layered Log & Bamboo Raft Hull
        const hullLogs = 7;
        const logR = 0.38;
        const logL = 7.4;
        for (let i = 0; i < hullLogs; i++) {
            const x = (i - (hullLogs - 1) / 2) * (logR * 1.95);
            const yCurve = Math.pow(Math.abs(i - (hullLogs - 1) / 2), 1.4) * 0.07;
            const logGeo = new THREE.CylinderGeometry(logR * 0.96, logR, logL, 10);
            logGeo.rotateX(Math.PI / 2);
            const logMesh = new THREE.Mesh(logGeo, logMat);
            logMesh.position.set(x, yCurve, 0);
            logMesh.castShadow = true;
            logMesh.receiveShadow = true;
            raftChassis.add(logMesh);

            [-logL / 2, logL / 2].forEach(zPos => {
                const cap = new THREE.Mesh(new THREE.CircleGeometry(logR * 0.95, 8), capMat);
                cap.position.set(x, yCurve, zPos + (zPos > 0 ? 0.01 : -0.01));
                if (zPos < 0) cap.rotation.y = Math.PI;
                raftChassis.add(cap);
            });
        }

        // Cross-beam bamboo/timber logs binding the hull
        [-2.4, -0.8, 0.8, 2.4].forEach(z => {
            const cross = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 5.2, 8), bambooMat);
            cross.rotation.z = Math.PI / 2;
            cross.position.set(0, 0.42, z);
            cross.castShadow = true;
            raftChassis.add(cross);

            [-2.2, -1.1, 0, 1.1, 2.2].forEach(x => {
                const rope = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.08, 6, 8), ropeMat);
                rope.rotation.x = Math.PI / 2;
                rope.position.set(x, 0.42, z);
                raftChassis.add(rope);
            });
        });

        // Upper Side Bumper Logs
        [-2.35, 2.35].forEach(x => {
            const sideRail = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 6.8, 8), bambooMat);
            sideRail.rotation.x = Math.PI / 2;
            sideRail.position.set(x, 0.88, 0);
            sideRail.castShadow = true;
            raftChassis.add(sideRail);

            [-2.6, -1.0, 0.6, 2.2].forEach(z => {
                const stanchion = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.75, 6), bambooMat);
                stanchion.position.set(x, 0.5, z);
                raftChassis.add(stanchion);

                const wrap = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 5, 8), ropeMat);
                wrap.position.set(x, 0.88, z);
                raftChassis.add(wrap);
            });
        });

        // Rear & Front Bumper Logs + SSJ Branding Plates
        const rearBumper = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 4.8, 8), logMat);
        rearBumper.rotation.z = Math.PI / 2;
        rearBumper.position.set(0, 0.72, -3.6);
        rearBumper.castShadow = true;
        raftChassis.add(rearBumper);

        const frontBumper = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 4.8, 8), logMat);
        frontBumper.rotation.z = Math.PI / 2;
        frontBumper.position.set(0, 0.72, 3.6);
        frontBumper.castShadow = true;
        raftChassis.add(frontBumper);

        const ssjPlateRear = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.82, 0.12), new THREE.MeshStandardMaterial({ map: plateTex, roughness: 0.6 }));
        ssjPlateRear.position.set(0, 0.72, -3.75);
        ssjPlateRear.rotation.y = Math.PI;
        raftChassis.add(ssjPlateRear);

        const ssjPlateFront = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.82, 0.12), new THREE.MeshStandardMaterial({ map: plateTex, roughness: 0.6 }));
        ssjPlateFront.position.set(0, 0.72, 3.75);
        raftChassis.add(ssjPlateFront);

        [-2.42, 2.42].forEach(x => {
            const sideBoard = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 2.4), new THREE.MeshStandardMaterial({ map: plateTex, roughness: 0.6 }));
            sideBoard.position.set(x, 0.88, 0);
            sideBoard.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2;
            raftChassis.add(sideBoard);
        });

        // Wooden Plank Deck Floor
        for (let z = -3.2; z <= 3.2; z += 0.52) {
            const plank = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.12, 0.48), plankMat);
            plank.position.set(0, 0.44, z);
            plank.castShadow = true;
            plank.receiveShadow = true;
            raftChassis.add(plank);
        }

        // 3B. Four Outrigger Bamboo Arms + Propeller Lift Turbines
        const outriggers = [
            { x: -3.3, z: 2.2,  dir: 1 },
            { x: 3.3,  z: 2.2,  dir: -1 },
            { x: -3.3, z: -2.2, dir: -1 },
            { x: 3.3,  z: -2.2, dir: 1 }
        ];

        state.propellers = [];
        state.thrusterCones = [];

        outriggers.forEach(out => {
            const arm = new THREE.Group();
            arm.position.set(out.x > 0 ? 2.2 : -2.2, 0.5, out.z);

            const strut1 = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 1.45, 8), bambooMat);
            strut1.rotation.z = out.x > 0 ? -Math.PI / 3.4 : Math.PI / 3.4;
            strut1.position.set(out.x > 0 ? 0.6 : -0.6, 0.25, -0.3);
            strut1.castShadow = true;
            arm.add(strut1);

            const strut2 = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 1.45, 8), bambooMat);
            strut2.rotation.z = out.x > 0 ? -Math.PI / 3.4 : Math.PI / 3.4;
            strut2.position.set(out.x > 0 ? 0.6 : -0.6, 0.25, 0.3);
            strut2.castShadow = true;
            arm.add(strut2);

            // Turbine Housing Drum
            const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.88, 16), plankMat);
            drum.position.set(out.x > 0 ? 1.1 : -1.1, 0.55, 0);
            drum.castShadow = true;
            arm.add(drum);

            [-0.32, 0.32].forEach(y => {
                const ring = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.06, 6, 16), bronzeMat);
                ring.rotation.x = Math.PI / 2;
                ring.position.set(out.x > 0 ? 1.1 : -1.1, 0.55 + y, 0);
                arm.add(ring);
            });

            // Top Rotating Propeller Assembly
            const propGroup = new THREE.Group();
            propGroup.position.set(out.x > 0 ? 1.1 : -1.1, 1.05, 0);

            const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.25, 12), bronzeMat);
            hub.castShadow = true;
            propGroup.add(hub);

            const bladeGeo = new THREE.BoxGeometry(1.68, 0.05, 0.22);
            bladeGeo.rotateY(0.15);
            const blade1 = new THREE.Mesh(bladeGeo, darkWoodTex ? logMat : plankMat);
            blade1.castShadow = true;
            propGroup.add(blade1);

            const blade2 = blade1.clone();
            blade2.rotation.y = Math.PI / 2;
            propGroup.add(blade2);

            arm.add(propGroup);
            state.propellers.push({ group: propGroup, dir: out.dir });

            // Downward Lift Thruster Nozzle & Energy Cones
            const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.48, 0.35, 12), darkIronMat);
            nozzle.position.set(out.x > 0 ? 1.1 : -1.1, 0.05, 0);
            arm.add(nozzle);

            const outerCone = new THREE.Mesh(new THREE.ConeGeometry(0.58, 2.1, 12, 1, true), coneMat);
            outerCone.position.set(out.x > 0 ? 1.1 : -1.1, -1.05, 0);
            outerCone.rotation.x = Math.PI;
            arm.add(outerCone);

            const innerCone = new THREE.Mesh(new THREE.ConeGeometry(0.34, 1.6, 12, 1, true), innerConeMat);
            innerCone.position.set(out.x > 0 ? 1.1 : -1.1, -0.85, 0);
            innerCone.rotation.x = Math.PI;
            arm.add(innerCone);

            state.thrusterCones.push({ outer: outerCone, inner: innerCone });

            raftChassis.add(arm);
        });

        // 3C. Wooden Dashboard, Steering Wheel, Control Levers & Seats
        const dash = new THREE.Group();
        dash.position.set(0, 1.05, 0.95);

        const dashConsole = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.72, 0.55), plankMat);
        dashConsole.castShadow = true;
        dash.add(dashConsole);

        [-0.55, 0, 0.55].forEach(x => {
            const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 14), bronzeMat);
            gauge.rotation.x = Math.PI / 2;
            gauge.position.set(x, 0.14, -0.29);
            dash.add(gauge);
        });

        // Handcrafted Wooden Steering Wheel
        const wheelGroup = new THREE.Group();
        wheelGroup.position.set(-0.75, 0.28, -0.32);
        wheelGroup.rotation.x = -Math.PI / 4;

        const wheelRim = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.045, 6, 16), logMat);
        const wheelHub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 8), bronzeMat);
        wheelHub.rotation.x = Math.PI / 2;
        wheelGroup.add(wheelRim, wheelHub);

        for (let s = 0; s < 4; s++) {
            const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 6), bambooMat);
            spoke.rotation.z = (s / 4) * Math.PI;
            wheelGroup.add(spoke);
        }
        dash.add(wheelGroup);
        state.steeringWheel = wheelGroup;

        // Levers
        const tLever = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 6), bronzeMat);
        tLever.position.set(0.12, 0.35, -0.15);
        dash.add(tLever);
        state.throttleLever = tLever;

        raftChassis.add(dash);

        // Two Woven Rattan Seats
        [-0.75, 0.75].forEach((x, idx) => {
            const seat = new THREE.Group();
            seat.position.set(x, 0.45, 0.1);

            const seatBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.48, 1.1), wickerMat);
            seatBase.position.y = 0.24;
            seatBase.castShadow = true;
            seat.add(seatBase);

            const seatBack = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.1, 0.24), wickerMat);
            seatBack.position.set(0, 0.85, -0.44);
            seatBack.castShadow = true;
            seat.add(seatBack);

            raftChassis.add(seat);
            if (idx === 0) state.driverSeat = seat;
        });

        // 3D. Explorer Cargo in the Rear
        const cargoGroup = new THREE.Group();
        cargoGroup.position.set(0, 0.48, -1.9);

        const crate1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.2), plankMat);
        crate1.position.set(-0.85, 0.45, 0);
        crate1.castShadow = true;
        cargoGroup.add(crate1);

        const sackMat = new THREE.MeshStandardMaterial({ color: 0x92704f, roughness: 0.95 });
        const sack = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), sackMat);
        sack.scale.set(1.1, 0.75, 0.95);
        sack.position.set(0.65, 0.4, 0.1);
        sack.castShadow = true;
        cargoGroup.add(sack);

        const ropeCoil = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.14, 8, 14), ropeMat);
        ropeCoil.rotation.x = Math.PI / 2;
        ropeCoil.position.set(0.65, 0.14, -0.75);
        cargoGroup.add(ropeCoil);

        raftChassis.add(cargoGroup);

        // 3E. Overhead Bamboo Canopy Frame & Beige Sail Canvas
        const canopyGroup = new THREE.Group();

        [[-1.85, -2.4], [1.85, -2.4], [-1.85, 1.8], [1.85, 1.8]].forEach(([px, pz]) => {
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 3.4, 8), bambooMat);
            pole.position.set(px, 2.05, pz);
            pole.rotation.z = px > 0 ? -0.1 : 0.1;
            pole.castShadow = true;
            canopyGroup.add(pole);
        });

        const sailGeo = new THREE.PlaneGeometry(3.45, 4.45, 14, 14);
        sailGeo.rotateX(Math.PI / 2);
        const sailPosAttr = sailGeo.attributes.position;
        const sailBaseY = new Float32Array(sailPosAttr.count);
        for (let i = 0; i < sailPosAttr.count; i++) {
            const x = sailPosAttr.getX(i);
            const z = sailPosAttr.getZ(i);
            const sag = (Math.cos((x / 1.7) * (Math.PI / 2)) * Math.cos((z / 2.2) * (Math.PI / 2))) * 0.22;
            sailBaseY[i] = sag;
            sailPosAttr.setY(i, sag);
        }
        sailGeo.computeVertexNormals();

        const canopySail = new THREE.Mesh(
            sailGeo,
            new THREE.MeshStandardMaterial({ map: sailTex, roughness: 0.85, side: THREE.DoubleSide })
        );
        canopySail.position.set(0, 3.55, -0.3);
        canopySail.castShadow = true;
        canopyGroup.add(canopySail);

        state.sailPosAttr = sailPosAttr;
        state.sailBaseY = sailBaseY;

        // 3F. Tall Bamboo Flag Mast & SSJ Crown Flag
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.18, 5.8, 8), bambooMat);
        mast.position.set(0, 4.2, -2.6);
        mast.castShadow = true;
        canopyGroup.add(mast);

        const goldCap = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), bronzeMat);
        goldCap.position.set(0, 7.1, -2.6);
        canopyGroup.add(goldCap);

        const flagGeo = new THREE.PlaneGeometry(2.35, 1.48, 18, 10);
        flagGeo.translate(-1.175, 0, 0); // Attach right at mast
        const flag = new THREE.Mesh(
            flagGeo,
            new THREE.MeshStandardMaterial({ map: flagTex, roughness: 0.5, side: THREE.DoubleSide })
        );
        flag.position.set(0, 6.2, -2.6);
        flag.castShadow = true;
        canopyGroup.add(flag);

        state.flagPosAttr = flagGeo.attributes.position;

        raftChassis.add(canopyGroup);

        // Ground Landing Beacon Ring
        const beaconGeo = new THREE.RingGeometry(3.8, 4.3, 32);
        beaconGeo.rotateX(-Math.PI / 2);
        const beaconRing = new THREE.Mesh(
            beaconGeo,
            new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
        );
        beaconRing.position.y = 0.05;
        vehicleGroup.add(beaconRing);
        state.beaconRing = beaconRing;

        // Position the vehicle parked on Paradise Island Harbor Pier!
        vehicleGroup.position.copy(state.pos);
        vehicleGroup.rotation.y = state.yaw;
        scene.add(vehicleGroup);

        state.mesh = vehicleGroup;
        state.raftChassis = raftChassis;
    }

    // -------------------------------------------------------------------------
    // 7. DRIVER SEATING POSE FOR LOS SANTOS AVATAR
    // -------------------------------------------------------------------------
    function setDriverPose(isSeated) {
        if (!playerRef || !playerRef.mesh) return;

        const limbs = playerRef.limbs || {};
        if (isSeated) {
            playerRef.mesh.position.set(0, 0.48, 0.15);
            playerRef.mesh.rotation.set(0, 0, 0);

            if (limbs.leftHip) limbs.leftHip.rotation.x = -Math.PI / 2.2;
            if (limbs.rightHip) limbs.rightHip.rotation.x = -Math.PI / 2.2;
            if (limbs.leftKnee) limbs.leftKnee.rotation.x = Math.PI / 2.3;
            if (limbs.rightKnee) limbs.rightKnee.rotation.x = Math.PI / 2.3;

            if (limbs.leftArm) {
                limbs.leftArm.rotation.x = -Math.PI / 3.4;
                limbs.leftArm.rotation.y = 0.25;
            }
            if (limbs.rightArm) {
                limbs.rightArm.rotation.x = -Math.PI / 3.4;
                limbs.rightArm.rotation.y = -0.25;
            }
            if (limbs.torso) limbs.torso.rotation.x = 0.12;
        } else {
            if (limbs.leftHip) limbs.leftHip.rotation.x = 0;
            if (limbs.rightHip) limbs.rightHip.rotation.x = 0;
            if (limbs.leftKnee) limbs.leftKnee.rotation.x = 0;
            if (limbs.rightKnee) limbs.rightKnee.rotation.x = 0;
            if (limbs.leftArm) limbs.leftArm.rotation.x = 0;
            if (limbs.rightArm) limbs.rightArm.rotation.x = 0;
            if (limbs.torso) limbs.torso.rotation.x = 0;
            if (playerRef.mesh.rotation && playerRef.mesh.rotation.set) {
                playerRef.mesh.rotation.set(0, playerRef.yaw || 0, 0);
            }
        }
    }

    // -------------------------------------------------------------------------
    // 8. BOARDING & DISEMBARKING
    // -------------------------------------------------------------------------
    function toggleBoarding() {
        if (!playerRef) return;
        initAudio();

        if (state.inVehicle) {
            // Disembark onto pier or terrain
            state.inVehicle = false;
            playerRef.mode = 'WALK';

            if (sceneRef && sceneRef.attach) sceneRef.attach(playerRef.mesh);
            else if (sceneRef) sceneRef.add(playerRef.mesh);

            setDriverPose(false);

            // Step out cleanly onto pier or terrain
            const exitX = state.pos.x - Math.cos(state.yaw) * 4.2;
            const exitZ = state.pos.z + Math.sin(state.yaw) * 4.2;
            const islandH = getParadiseIslandHeight(exitX, state.pos.y, exitZ);
            const exitY = Math.max(islandH > -900 ? islandH : 1.4, 3.1);

            playerRef.pos.set(exitX, exitY, exitZ);
            if (playerRef.mesh.position && playerRef.mesh.position.copy) {
                playerRef.mesh.position.copy(playerRef.pos);
            }
            playerRef.mesh.visible = true;

            if (propGain) propGain.gain.setTargetAtTime(0, audioCtx ? audioCtx.currentTime : 0, 0.2);

            const hud = document.getElementById('sky-explorer-hud');
            if (hud) hud.classList.add('hidden');

            const toast = window.SSJArchipelago && window.SSJArchipelago.showArchipelagoToast;
            if (toast) toast('⚓ Disembarked from SSJ Tropical Sky Explorer on Paradise Island');

        } else {
            const dist = playerRef.pos.distanceTo(state.pos);
            if (dist < 10.5) {
                // Board Vehicle
                state.inVehicle = true;
                playerRef.mode = 'FLYING_VEHICLE';

                if (state.driverSeat) state.driverSeat.add(playerRef.mesh);
                setDriverPose(true);
                playerRef.mesh.visible = true;

                if (propGain) propGain.gain.setTargetAtTime(0.04, audioCtx ? audioCtx.currentTime : 0, 0.1);

                const hud = document.getElementById('sky-explorer-hud');
                if (hud) hud.classList.remove('hidden');

                const toast = window.SSJArchipelago && window.SSJArchipelago.showArchipelagoToast;
                if (toast) toast('🌴 PILOTING SSJ TROPICAL SKY EXPLORER! Soar over Paradise Island & Los Santos!');
            }
        }
    }

    // -------------------------------------------------------------------------
    // 9. PARADISE ISLAND COLLISION & TERRAIN HEIGHT
    // -------------------------------------------------------------------------
    function getParadiseIslandHeight(x, y, z) {
        let maxH = -999;

        // 1. Wooden Harbor Pier Dock at (-458, 2.6, 362)
        const pierDx = x - (-458);
        const pierDz = z - 362;
        const rotCos = Math.cos(0.35);
        const rotSin = Math.sin(0.35);
        const localPierX = pierDx * rotCos - pierDz * rotSin;
        const localPierZ = pierDx * rotSin + pierDz * rotCos;
        if (Math.abs(localPierX) <= 4.2 && Math.abs(localPierZ) <= 18) {
            if (3.1 > maxH) maxH = 3.1;
        }

        // 2. Main Paradise Island
        const distToPeak = Math.hypot(x - (-406), z - 458);
        if (distToPeak < 24) {
            const factor = Math.min(1, (24 - distToPeak) / 8);
            const peakH = 13.0 + (48.5 - 13.0) * factor;
            if (peakH > maxH) maxH = peakH;
        }

        const distToHighlands = Math.hypot(x - (-414), z - 448);
        if (distToHighlands < 60) {
            const factor = Math.min(1, (60 - distToHighlands) / 10);
            const highH = 4.4 + (13.0 - 4.4) * factor;
            if (highH > maxH) maxH = highH;
        }

        const distToMain = Math.hypot(x - (-420), z - 440);
        if (distToMain < 90) {
            const factor = Math.min(1, (90 - distToMain) / 12);
            const beachH = 1.4 + (4.4 - 1.4) * factor;
            if (beachH > maxH) maxH = beachH;
        }

        // 3. Natural Stone Arch Island (Arch Rock Atoll)
        const distToArch = Math.hypot(x - (-570), z - 470);
        if (distToArch < 52) {
            const factor = Math.min(1, (52 - distToArch) / 8);
            const atollH = 1.4 + (3.8 - 1.4) * factor;
            if (atollH > maxH) maxH = atollH;

            if (Math.abs(x - (-570)) < 22 && Math.abs(z - 470) < 9) {
                if (y >= 26) {
                    if (38.0 > maxH) maxH = 38.0;
                }
            }
        }

        return maxH;
    }

    // -------------------------------------------------------------------------
    // 10. PHYSICS & ANIMATION UPDATE (Exact match to ssj_tropical_sky_explorer.html)
    // -------------------------------------------------------------------------
    function update(dt, elapsed) {
        if (!state.mesh) return;

        // Animate Lighthouse rotating searchlight
        if (state.searchlightBeam) {
            state.searchlightBeam.rotation.y = elapsed * 1.5;
        }

        // Animate Flocking Seagulls
        state.seagulls.forEach(g => {
            g.angle += g.speed * dt;
            g.group.position.set(
                g.cx + Math.cos(g.angle) * g.radius,
                g.y + Math.sin(elapsed * 2 + g.angle) * 1.5,
                g.cz + Math.sin(g.angle) * g.radius
            );
            g.group.rotation.y = -g.angle;
            const flap = Math.sin(elapsed * 9 + g.angle) * 0.45;
            g.leftWing.rotation.z = flap;
            g.rightWing.rotation.z = -flap;
        });

        // Animate Golden Sky Relic Rings
        const currentTargetPos = state.inVehicle ? state.pos : (playerRef ? playerRef.pos : state.pos);
        state.relics.forEach(r => {
            if (r.collected) return;
            r.group.rotation.y += dt * 1.8;
            r.group.position.y += Math.sin(elapsed * 3) * 0.015;

            if (currentTargetPos.distanceTo(r.group.position) < 7.5) {
                r.collected = true;
                r.group.visible = false;
                state.collectedRelics++;
                playChime();
                const toast = window.SSJArchipelago && window.SSJArchipelago.showArchipelagoToast;
                if (toast) toast(`👑 Collected SSJ Sky Relic (${state.collectedRelics}/${state.relics.length})!`);
            }
        });

        if (state.inVehicle) {
            // ---- EXACT FLIGHT CONTROLS & PHYSICS ----
            const isBoost = inputState.boost;
            const maxForwardSpeed = isBoost ? 68.0 : 42.0;
            const accel = isBoost ? 32.0 : 18.0;

            if (inputState.forward) {
                state.forwardSpeed = THREE.MathUtils.lerp(state.forwardSpeed, maxForwardSpeed, dt * 2.2);
            } else if (inputState.backward) {
                state.forwardSpeed = THREE.MathUtils.lerp(state.forwardSpeed, -18.0, dt * 2.5);
            } else {
                state.forwardSpeed = THREE.MathUtils.lerp(state.forwardSpeed, 0, dt * 1.8);
            }

            // Steer Yaw (A / D)
            let targetYawRate = (inputState.left ? 1 : 0) - (inputState.right ? 1 : 0);
            state.yawRate = THREE.MathUtils.lerp(state.yawRate || 0, targetYawRate * 1.45, dt * 5.0);
            state.yaw += state.yawRate * dt;
            state.mesh.rotation.y = state.yaw;

            // Ascend / Descend (Climb with Space, Dive with C/Ctrl)
            let targetVert = ((inputState.ascend ? 1 : 0) - (inputState.descend ? 1 : 0)) * (isBoost ? 24.0 : 16.0);
            state.verticalSpeed = THREE.MathUtils.lerp(state.verticalSpeed, targetVert, dt * 4.0);

            // Move vehicle position
            const dirX = Math.sin(state.yaw);
            const dirZ = Math.cos(state.yaw);
            state.pos.x += dirX * state.forwardSpeed * dt;
            state.pos.z += dirZ * state.forwardSpeed * dt;
            state.pos.y += state.verticalSpeed * dt;

            // Height Limits & Collision with Island Terrain / Ocean Waves
            const islandH = getParadiseIslandHeight(state.pos.x, state.pos.y, state.pos.z);
            let floorH = getSeafloorHeightRef ? getSeafloorHeightRef(state.pos.x, state.pos.z) : 0;
            let waveH = getWaveHeightRef ? getWaveHeightRef(state.pos.x, state.pos.z, elapsed) : 0;

            const minGroundY = Math.max(islandH > -900 ? islandH + 0.15 : -999, floorH + 1.2, waveH + 0.8, 1.4);
            if (state.pos.y < minGroundY) {
                state.pos.y = minGroundY;
                if (state.verticalSpeed < 0) state.verticalSpeed = 0;
            }
            state.pos.y = Math.min(350.0, state.pos.y); // High altitude ceiling

            // Dynamic banking roll & pitch
            const targetRoll = -state.yawRate * 0.38;
            const targetPitch = (state.forwardSpeed / maxForwardSpeed) * 0.16 - (state.verticalSpeed * 0.012);
            state.roll = THREE.MathUtils.lerp(state.roll, targetRoll, dt * 4.5);
            state.pitch = THREE.MathUtils.lerp(state.pitch, targetPitch, dt * 4.0);

            state.raftChassis.rotation.z = state.roll;
            state.raftChassis.rotation.x = state.pitch;

            // Steering Wheel & Throttle Levers
            if (state.steeringWheel) state.steeringWheel.rotation.z = -state.yawRate * 0.55;
            if (state.throttleLever) state.throttleLever.rotation.x = (state.forwardSpeed / maxForwardSpeed) * 0.45;

            // Modulate Audio Synthesizer
            if (propOsc && audioCtx) {
                const targetFreq = 48 + Math.abs(state.forwardSpeed) * 1.5 + (isBoost ? 28 : 0);
                propOsc.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.08);
            }

            // Third-Person Chase Camera Follow (Exact match to ssj_tropical_sky_explorer.html!)
            if (cameraRef) {
                const camDist = 13.5;
                const camHeight = 4.8 + state.pitch * 3.5;
                const desiredCamX = state.pos.x - Math.sin(state.yaw) * camDist;
                const desiredCamZ = state.pos.z - Math.cos(state.yaw) * camDist;
                const desiredCamY = Math.max(waveH + 2.0, state.pos.y + camHeight);

                cameraRef.position.x = THREE.MathUtils.lerp(cameraRef.position.x, desiredCamX, dt * 6.5);
                cameraRef.position.y = THREE.MathUtils.lerp(cameraRef.position.y, desiredCamY, dt * 6.5);
                cameraRef.position.z = THREE.MathUtils.lerp(cameraRef.position.z, desiredCamZ, dt * 6.5);

                const lookAtPos = new THREE.Vector3(
                    state.pos.x + Math.sin(state.yaw) * 6,
                    state.pos.y + 1.8,
                    state.pos.z + Math.cos(state.yaw) * 6
                );
                cameraRef.lookAt(lookAtPos);
            }

            // Sync Los Santos player position with cockpit seat
            if (playerRef) {
                playerRef.pos.copy(state.pos);
                playerRef.yaw = state.yaw;
            }

            if (state.beaconRing) state.beaconRing.visible = false;

        } else {
            // Parked idling on the pier
            state.forwardSpeed = 0;
            state.verticalSpeed = 0;
            state.roll = THREE.MathUtils.lerp(state.roll, 0, dt * 4.0);
            state.pitch = THREE.MathUtils.lerp(state.pitch, 0, dt * 4.0);
            state.raftChassis.rotation.set(state.pitch, 0, state.roll);

            if (state.beaconRing) {
                state.beaconRing.visible = true;
                state.beaconRing.scale.setScalar(1.0 + Math.sin(elapsed * 3.0) * 0.08);
            }
        }

        // Apply Position to Vehicle Group
        const hoverOffset = state.inVehicle ? Math.sin(elapsed * 2.8) * 0.02 : 0;
        state.mesh.position.copy(state.pos);
        state.mesh.position.y += hoverOffset;

        // Spin Propellers
        const propSpeed = (state.inVehicle ? (inputState.boost ? 48.0 : 32.0) : 8.0) * dt;
        state.propellers.forEach(p => {
            p.group.rotation.y += propSpeed * p.dir;
        });

        // Pulse Glowing Thruster Energy Plumes
        const thrusterScale = (state.inVehicle ? (inputState.boost ? 1.6 : 1.1) : 0.6) + Math.sin(elapsed * 12.0) * 0.15;
        state.thrusterCones.forEach(t => {
            t.outer.scale.set(1, thrusterScale, 1);
            t.inner.scale.set(1, thrusterScale * 1.1, 1);
        });

        // Cloth vertex ripple on Flag & Canopy
        const windSpeed = 6 + Math.abs(state.forwardSpeed) * 0.35;
        if (state.flagPosAttr) {
            for (let i = 0; i < state.flagPosAttr.count; i++) {
                const fx = state.flagPosAttr.getX(i);
                const distFromMast = Math.abs(fx);
                const waveZ = Math.sin(elapsed * windSpeed - distFromMast * 2.8) * (distFromMast * 0.14);
                state.flagPosAttr.setZ(i, waveZ);
            }
            state.flagPosAttr.needsUpdate = true;
        }

        if (state.sailPosAttr && state.sailBaseY) {
            for (let i = 0; i < state.sailPosAttr.count; i++) {
                const sx = state.sailPosAttr.getX(i);
                const sz = state.sailPosAttr.getZ(i);
                const ripple = Math.sin(elapsed * (windSpeed * 0.7) + sx * 2 + sz * 2) * 0.035;
                state.sailPosAttr.setY(i, state.sailBaseY[i] + ripple);
            }
            state.sailPosAttr.needsUpdate = true;
        }

        // Update Proximity / Interaction Prompt
        checkPlayerInteractionPrompt();

        // Update Speedometer HUD
        updateSpeedometerHUD();
    }

    // -------------------------------------------------------------------------
    // 11. HUD & PROMPTS
    // -------------------------------------------------------------------------
    function checkPlayerInteractionPrompt() {
        if (!playerRef) return;
        const promptEl = document.getElementById('prompt-banner');
        if (!promptEl) return;

        if (state.inVehicle) {
            promptEl.classList.remove('hidden');
            promptEl.textContent = `[E] Disembark Sky Explorer • [SPACE] Climb • [C] Dive • [SHIFT] Turbo Boost`;
        } else {
            const dist = playerRef.pos.distanceTo(state.pos);
            if (dist < 10.5) {
                promptEl.classList.remove('hidden');
                promptEl.innerHTML = `<i class="fa-solid fa-plane-up mr-2 text-sky-400"></i> Press [E] to Board SSJ Tropical Sky Explorer`;
            }
        }
    }

    function updateSpeedometerHUD() {
        if (!state.inVehicle) return;
        const speedVal = document.getElementById('sky-speed-val');
        const altVal = document.getElementById('sky-alt-val');
        const arcEl = document.getElementById('sky-speed-arc');
        if (!speedVal || !altVal) return;

        const displayKmh = Math.round(Math.abs(state.forwardSpeed) * 3.2);
        speedVal.textContent = displayKmh;
        altVal.textContent = Math.max(0, Math.round(state.pos.y - 1.4));

        if (arcEl) {
            const maxArc = 230;
            const arcFill = Math.min(maxArc, (displayKmh / 180) * maxArc);
            arcEl.setAttribute('stroke-dasharray', `${arcFill} 360`);
        }
    }

    function injectHUD() {
        if (document.getElementById('sky-explorer-hud')) return;

        const hudDiv = document.createElement('div');
        hudDiv.id = 'sky-explorer-hud';
        hudDiv.className = 'fixed bottom-6 right-6 z-40 hidden flex items-center gap-4 bg-slate-950/85 border border-sky-400/60 rounded-2xl p-4 backdrop-blur-md shadow-2xl pointer-events-none text-white select-none';
        hudDiv.innerHTML = `
            <div class="relative w-20 h-20 flex items-center justify-center">
                <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" stroke-width="8" stroke-dasharray="230 360" stroke-linecap="round"/>
                    <circle id="sky-speed-arc" cx="50" cy="50" r="42" fill="none" stroke="#38bdf8" stroke-width="8" stroke-dasharray="0 360" stroke-linecap="round"/>
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span id="sky-speed-val" class="text-xl font-black font-mono text-white leading-none">0</span>
                    <span class="text-[9px] font-bold text-sky-400 tracking-wider">KM/H</span>
                </div>
            </div>
            <div class="flex flex-col gap-0.5">
                <div class="text-[10px] font-extrabold text-amber-400 tracking-widest flex items-center gap-1.5">
                    <i class="fa-solid fa-plane text-sky-400"></i> SSJ SKY EXPLORER
                </div>
                <div class="text-xs text-slate-300 font-semibold">
                    ALT: <span id="sky-alt-val" class="font-bold text-white font-mono">0</span>m
                </div>
                <div class="text-[10px] text-slate-400 mt-1">
                    <span class="text-sky-300 font-bold">[W/S]</span> Thrust • 
                    <span class="text-sky-300 font-bold">[A/D]</span> Bank • 
                    <span class="text-sky-300 font-bold">[SPACE]</span> Climb • 
                    <span class="text-sky-300 font-bold">[C]</span> Dive
                </div>
            </div>
        `;
        document.body.appendChild(hudDiv);
    }

    // -------------------------------------------------------------------------
    // 12. INPUT LISTENERS
    // -------------------------------------------------------------------------
    function setupInputListeners() {
        window.addEventListener('keydown', (e) => {
            initAudio();
            if (e.code === activeKeybinds.forward.code) inputState.forward = true;
            if (e.code === activeKeybinds.backward.code) inputState.backward = true;
            if (e.code === activeKeybinds.left.code) inputState.left = true;
            if (e.code === activeKeybinds.right.code) inputState.right = true;
            if (e.code === activeKeybinds.ascend.code) inputState.ascend = true;
            if (e.code === activeKeybinds.descend.code) inputState.descend = true;
            if (e.code === activeKeybinds.boost.code) inputState.boost = true;

            if (e.code === activeKeybinds.interact.code && !e.repeat) {
                if (state.inVehicle || (playerRef && playerRef.pos.distanceTo(state.pos) < 10.5)) {
                    toggleBoarding();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === activeKeybinds.forward.code) inputState.forward = false;
            if (e.code === activeKeybinds.backward.code) inputState.backward = false;
            if (e.code === activeKeybinds.left.code) inputState.left = false;
            if (e.code === activeKeybinds.right.code) inputState.right = false;
            if (e.code === activeKeybinds.ascend.code) inputState.ascend = false;
            if (e.code === activeKeybinds.descend.code) inputState.descend = false;
            if (e.code === activeKeybinds.boost.code) inputState.boost = false;
        });
    }

    // -------------------------------------------------------------------------
    // 13. SYSTEM INITIALIZATION
    // -------------------------------------------------------------------------
    function init(context) {
        sceneRef = context.scene;
        cameraRef = context.camera;
        playerRef = context.player;
        registerWalkableRef = context.registerWalkable;
        getSeafloorHeightRef = context.getSeafloorHeight;
        getWaveHeightRef = context.getWaveHeight;

        injectHUD();
        setupInputListeners();

        // 1. Build Paradise Island into Los Santos Ocean (without adding extra ocean mesh!)
        buildParadiseIsland(sceneRef);

        // 2. Build SSJ Tropical Sky Explorer & Park on Paradise Island Harbor Pier!
        buildVehicle(sceneRef);

        console.log('🌴 SSJ Tropical Sky Explorer & Paradise Island initialized in Los Santos ocean at (-420, 0, 440)!');
    }

    return {
        init,
        update,
        state,
        toggleBoarding,
        getParadiseIslandHeight
    };
})();
