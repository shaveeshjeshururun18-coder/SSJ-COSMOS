/**
 * KENNEY 3D MEGA ASSETS SYSTEM FOR OPEN WORLD SIMULATORS
 * Integrates all 10 Kenney 3D asset packs into Three.js:
 *  1. kenney_car-kit (Drivable vehicles)
 *  2. kenney_watercraft-pack (Sailable boats & buoys)
 *  3. kenney_train-kit (Locomotives & carriages)
 *  4. kenney_racing-kit (Speedway grandstands, barriers & banners)
 *  5. kenney_city-kit-roads (Paved highways & streetlights)
 *  6. kenney_city-kit-commercial (Skyscrapers & office towers)
 *  7. kenney_city-kit-suburban (Suburban houses & estates)
 *  8. kenney_city-kit-industrial (Factories, silos & warehouses)
 *  9. kenney_mini-forest (Pine trees, bridges & wilderness)
 * 10. kenney_animated-characters-protagonists (Rigged characters & archers)
 */

(function () {
    console.log('🏎️ [KenneySystem] Initializing Kenney 3D Mega Assets Engine...');

    const KenneySystem = {
        loader: null,
        cache: new Map(),
        spawnedMeshes: [],
        drivableVehicles: [],
        animatedBuoys: [],

        init() {
            if (typeof THREE === 'undefined') {
                console.error('[KenneySystem] THREE.js is not loaded yet!');
                return;
            }
            if (typeof THREE.GLTFLoader === 'function') {
                this.loader = new THREE.GLTFLoader();
                console.log('✅ [KenneySystem] GLTFLoader ready.');
            } else {
                console.warn('[KenneySystem] THREE.GLTFLoader not found in global scope. Waiting for script...');
            }
        },

        ensureLoader() {
            if (!this.loader && typeof THREE.GLTFLoader === 'function') {
                this.loader = new THREE.GLTFLoader();
            }
            return !!this.loader;
        },

        // Asynchronous model loading with memory caching
        loadModel(url) {
            return new Promise((resolve, reject) => {
                if (this.cache.has(url)) {
                    resolve(this.cache.get(url).clone(true));
                    return;
                }
                if (!this.ensureLoader()) {
                    reject(new Error('GLTFLoader not available'));
                    return;
                }

                this.loader.load(
                    url,
                    (gltf) => {
                        const scene = gltf.scene;
                        scene.traverse((child) => {
                            if (child.isMesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                                if (child.material) {
                                    child.material.roughness = 0.65;
                                    child.material.metalness = 0.15;
                                }
                            }
                        });
                        this.cache.set(url, scene);
                        resolve(scene.clone(true));
                    },
                    undefined,
                    (err) => {
                        console.warn(`[KenneySystem] Error loading ${url}:`, err);
                        reject(err);
                    }
                );
            });
        },

        // Spawn a model instance with transform, scaling and walkable registration
        async spawn(opts) {
            const {
                url,
                pos = [0, 0, 0],
                rot = [0, 0, 0],
                scale = 1.0,
                isWalkable = false,
                parent = null,
                userData = null
            } = opts;

            try {
                const mesh = await this.loadModel(url);
                mesh.position.set(pos[0], pos[1], pos[2]);
                mesh.rotation.set(rot[0], rot[1], rot[2]);
                mesh.scale.set(scale, scale, scale);
                if (userData) mesh.userData = Object.assign(mesh.userData || {}, userData);

                if (isWalkable && typeof window.registerWalkable === 'function') {
                    mesh.traverse((c) => {
                        if (c.isMesh) window.registerWalkable(c);
                    });
                }

                const targetParent = parent || (typeof scene !== 'undefined' ? scene : null);
                if (targetParent) targetParent.add(mesh);
                this.spawnedMeshes.push(mesh);
                return mesh;
            } catch (err) {
                // Return null on failure gracefully
                return null;
            }
        },

        // Build the complete 10-Pack Kenney Mega District in the open world
        async buildMegaDistrict(targetScene) {
            const sc = targetScene || scene;
            if (!sc) {
                console.error('[KenneySystem] No valid Three.js scene found.');
                return;
            }

            console.log('🏙️ [KenneySystem] Generating 10-Pack Kenney Metropolis, Speedway & Harbor...');
            const root = new THREE.Group();
            root.name = 'KENNEY_MEGA_DISTRICT_ROOT';
            sc.add(root);

            // -------------------------------------------------------------
            // 1. KENNEY RACING SPEEDWAY (Lining the 200m Runway at X: 75)
            // -------------------------------------------------------------
            const racingRoot = new THREE.Group();
            racingRoot.name = 'KENNEY_RACING_SPEEDWAY';
            root.add(racingRoot);

            // Starting Gate & Checkered Banner Towers
            await this.spawn({
                url: 'assets/kenney/racing/Models/GLTF format/bannerTowerGreen.glb',
                pos: [67, 5.0, -115],
                rot: [0, 0, 0],
                scale: 1.8,
                parent: racingRoot
            });
            await this.spawn({
                url: 'assets/kenney/racing/Models/GLTF format/bannerTowerRed.glb',
                pos: [83, 5.0, -115],
                rot: [0, Math.PI, 0],
                scale: 1.8,
                parent: racingRoot
            });
            await this.spawn({
                url: 'assets/kenney/racing/Models/GLTF format/flagCheckers.glb',
                pos: [75, 5.0, -115],
                rot: [0, 0, 0],
                scale: 2.2,
                parent: racingRoot
            });

            // Grandstands for Spectators along the runway left & right
            const grandstandOffsets = [-95, -70, -45, -20, 5, 30];
            for (const z of grandstandOffsets) {
                // Covered Grandstand on East side
                await this.spawn({
                    url: 'assets/kenney/racing/Models/GLTF format/grandStandCovered.glb',
                    pos: [88, 5.0, z],
                    rot: [0, -Math.PI / 2, 0],
                    scale: 2.4,
                    isWalkable: true,
                    parent: racingRoot
                });
                // Open Grandstand on West side
                await this.spawn({
                    url: 'assets/kenney/racing/Models/GLTF format/grandStandAwning.glb',
                    pos: [62, 5.0, z],
                    rot: [0, Math.PI / 2, 0],
                    scale: 2.4,
                    isWalkable: true,
                    parent: racingRoot
                });
            }

            // Speedway Crash Barriers lining the runway edges
            for (let z = -112; z <= 55; z += 6) {
                await this.spawn({
                    url: 'assets/kenney/racing/Models/GLTF format/barrierRed.glb',
                    pos: [66.5, 5.0, z],
                    rot: [0, Math.PI / 2, 0],
                    scale: 1.6,
                    parent: racingRoot
                });
                await this.spawn({
                    url: 'assets/kenney/racing/Models/GLTF format/barrierWhite.glb',
                    pos: [83.5, 5.0, z],
                    rot: [0, Math.PI / 2, 0],
                    scale: 1.6,
                    parent: racingRoot
                });
            }

            // Trackside Sponsor Billboards & Camera Towers
            await this.spawn({
                url: 'assets/kenney/racing/Models/GLTF format/billboardDouble_exclusive.glb',
                pos: [92, 5.0, -80],
                rot: [0, -Math.PI / 2, 0],
                scale: 2.0,
                parent: racingRoot
            });
            await this.spawn({
                url: 'assets/kenney/racing/Models/GLTF format/billboard.glb',
                pos: [58, 5.0, -35],
                rot: [0, Math.PI / 2, 0],
                scale: 2.0,
                parent: racingRoot
            });
            await this.spawn({
                url: 'assets/kenney/racing/Models/GLTF format/camera_exclusive.glb',
                pos: [88, 5.0, 50],
                rot: [0, -Math.PI * 0.75, 0],
                scale: 2.0,
                parent: racingRoot
            });

            // -------------------------------------------------------------
            // 2. KENNEY CAR FLEET (Parked & Drivable with [E] Interaction)
            // -------------------------------------------------------------
            const carFleet = [
                {
                    id: 'kenney_race_f1',
                    name: 'Kenney Formula Supercar',
                    desc: 'Ultra-lightweight aerodynamic racing beast. Twin turbo V8 with race-compound tires.',
                    url: 'assets/kenney/cars/Models/GLB format/race.glb',
                    pos: [71, 5.1, -100],
                    rot: [0, 0, 0],
                    scale: 1.55
                },
                {
                    id: 'kenney_cyber_race',
                    name: 'Kenney Cyber Vortex Future',
                    desc: 'Next-gen electric hypercar with adaptive active aero and instant torque.',
                    url: 'assets/kenney/cars/Models/GLB format/race-future.glb',
                    pos: [79, 5.1, -100],
                    rot: [0, 0, 0],
                    scale: 1.55
                },
                {
                    id: 'kenney_police_interceptor',
                    name: 'Metropolis Police Cruiser',
                    desc: 'Pursuit-rated interceptor with heavy bullbar, dual sirens, and sport suspension.',
                    url: 'assets/kenney/cars/Models/GLB format/police.glb',
                    pos: [71, 5.1, -85],
                    rot: [0, 0, 0],
                    scale: 1.55
                },
                {
                    id: 'kenney_luxury_suv',
                    name: 'Kenney Royale Platinum SUV',
                    desc: 'Full-size luxury 4x4 with executive interior and all-terrain capabilities.',
                    url: 'assets/kenney/cars/Models/GLB format/suv-luxury.glb',
                    pos: [79, 5.1, -85],
                    rot: [0, 0, 0],
                    scale: 1.55
                },
                {
                    id: 'kenney_sports_sedan',
                    name: 'Kenney GT Sports Sedan',
                    desc: 'Precision-engineered sports saloon with tuned exhaust and rear diffuser.',
                    url: 'assets/kenney/cars/Models/GLB format/sedan-sports.glb',
                    pos: [71, 5.1, -70],
                    rot: [0, 0, 0],
                    scale: 1.55
                },
                {
                    id: 'kenney_city_taxi',
                    name: 'Downtown Yellow Taxi',
                    desc: 'Reliable city transit workhorse ready for fast passenger cross-island fares.',
                    url: 'assets/kenney/cars/Models/GLB format/taxi.glb',
                    pos: [79, 5.1, -70],
                    rot: [0, 0, 0],
                    scale: 1.55
                },
                {
                    id: 'kenney_rapid_ambulance',
                    name: 'City Paramedic Ambulance',
                    desc: 'Emergency response medical transporter equipped with lifesaver gear.',
                    url: 'assets/kenney/cars/Models/GLB format/ambulance.glb',
                    pos: [71, 5.1, -55],
                    rot: [0, 0, 0],
                    scale: 1.55
                },
                {
                    id: 'kenney_heavy_firetruck',
                    name: 'Frontier Heavy Fire Engine',
                    desc: 'High-pressure water tender and ladder truck for emergency frontier rescues.',
                    url: 'assets/kenney/cars/Models/GLB format/firetruck.glb',
                    pos: [79, 5.1, -55],
                    rot: [0, 0, 0],
                    scale: 1.55
                }
            ];

            for (const c of carFleet) {
                const carMesh = await this.spawn({
                    url: c.url,
                    pos: c.pos,
                    rot: c.rot,
                    scale: c.scale,
                    parent: root
                });

                if (carMesh) {
                    carMesh.userData = {
                        id: c.id,
                        name: c.name,
                        desc: c.desc,
                        type: 'CAR',
                        category: 'car'
                    };

                    // Register with the game's interactive showroom vehicle system!
                    if (typeof window.registerShowroomVehicle === 'function') {
                        window.registerShowroomVehicle(c.id, c.name, c.desc, 'CAR', carMesh, carMesh.position);
                    }
                    this.drivableVehicles.push(carMesh);
                }
            }

            // -------------------------------------------------------------
            // 3. KENNEY CITY ROADS & MODULAR HIGHWAYS (Roads Kit)
            // -------------------------------------------------------------
            const roadsRoot = new THREE.Group();
            roadsRoot.name = 'KENNEY_CITY_ROADS';
            root.add(roadsRoot);

            // Connect Showroom Runway (X: 75) to the East Metropolis Avenue (X: 110)
            for (let x = 85; x <= 135; x += 10) {
                await this.spawn({
                    url: 'assets/kenney/roads/Models/GLB format/road-straight.glb',
                    pos: [x, 5.0, -115],
                    rot: [0, Math.PI / 2, 0],
                    scale: 5.0,
                    isWalkable: true,
                    parent: roadsRoot
                });
            }

            // North-South Main Commercial Avenue at X: 125 (from Z: -145 to Z: -20)
            for (let z = -145; z <= -20; z += 10) {
                await this.spawn({
                    url: 'assets/kenney/roads/Models/GLB format/road-straight.glb',
                    pos: [125, 5.0, z],
                    rot: [0, 0, 0],
                    scale: 5.0,
                    isWalkable: true,
                    parent: roadsRoot
                });

                // Streetlights & utility poles every 30m
                if (Math.abs(z % 30) < 5) {
                    await this.spawn({
                        url: 'assets/kenney/roads/Models/GLB format/electricity-pole.glb',
                        pos: [131, 5.0, z],
                        rot: [0, 0, 0],
                        scale: 2.0,
                        parent: roadsRoot
                    });
                }
            }

            // Crossroad Intersections
            await this.spawn({
                url: 'assets/kenney/roads/Models/GLB format/road-crossroad.glb',
                pos: [125, 5.0, -115],
                rot: [0, 0, 0],
                scale: 5.0,
                isWalkable: true,
                parent: roadsRoot
            });
            await this.spawn({
                url: 'assets/kenney/roads/Models/GLB format/road-crossroad.glb',
                pos: [125, 5.0, -65],
                rot: [0, 0, 0],
                scale: 5.0,
                isWalkable: true,
                parent: roadsRoot
            });

            // -------------------------------------------------------------
            // 4. KENNEY COMMERCIAL SKYSCRAPERS & TOWERS (Commercial Kit)
            // -------------------------------------------------------------
            const commercialRoot = new THREE.Group();
            commercialRoot.name = 'KENNEY_COMMERCIAL_SKYLINE';
            root.add(commercialRoot);

            const commercialBuildings = [
                { id: 'bldg_a', url: 'assets/kenney/commercial/Models/GLB format/building-a.glb', pos: [145, 5.0, -140], scale: 6.0 },
                { id: 'bldg_b', url: 'assets/kenney/commercial/Models/GLB format/building-b.glb', pos: [145, 5.0, -115], scale: 6.5 },
                { id: 'bldg_c', url: 'assets/kenney/commercial/Models/GLB format/building-c.glb', pos: [145, 5.0, -90], scale: 6.0 },
                { id: 'bldg_d', url: 'assets/kenney/commercial/Models/GLB format/building-d.glb', pos: [145, 5.0, -65], scale: 7.0 },
                { id: 'bldg_e', url: 'assets/kenney/commercial/Models/GLB format/building-e.glb', pos: [145, 5.0, -40], scale: 6.2 },
                { id: 'bldg_f', url: 'assets/kenney/commercial/Models/GLB format/building-f.glb', pos: [105, 5.0, -140], scale: 5.8 },
                { id: 'bldg_g', url: 'assets/kenney/commercial/Models/GLB format/building-g.glb', pos: [105, 5.0, -65], scale: 6.2 },
                { id: 'bldg_h', url: 'assets/kenney/commercial/Models/GLB format/building-h.glb', pos: [105, 5.0, -40], scale: 6.5 }
            ];

            for (const b of commercialBuildings) {
                await this.spawn({
                    url: b.url,
                    pos: b.pos,
                    rot: [0, Math.PI / 2, 0],
                    scale: b.scale,
                    isWalkable: true,
                    parent: commercialRoot
                });
            }

            // -------------------------------------------------------------
            // 5. KENNEY SUBURBAN RESIDENTIAL ESTATES (Suburban Kit)
            // -------------------------------------------------------------
            const suburbanRoot = new THREE.Group();
            suburbanRoot.name = 'KENNEY_SUBURBAN_ESTATES';
            root.add(suburbanRoot);

            const suburbanVillas = [
                { url: 'assets/kenney/suburban/Models/GLB format/building-type-a.glb', pos: [120, 5.0, -175], rot: 0 },
                { url: 'assets/kenney/suburban/Models/GLB format/building-type-b.glb', pos: [140, 5.0, -175], rot: 0 },
                { url: 'assets/kenney/suburban/Models/GLB format/building-type-c.glb', pos: [160, 5.0, -175], rot: 0 },
                { url: 'assets/kenney/suburban/Models/GLB format/building-type-d.glb', pos: [120, 5.0, -200], rot: Math.PI },
                { url: 'assets/kenney/suburban/Models/GLB format/building-type-e.glb', pos: [140, 5.0, -200], rot: Math.PI },
                { url: 'assets/kenney/suburban/Models/GLB format/building-type-f.glb', pos: [160, 5.0, -200], rot: Math.PI }
            ];

            for (const s of suburbanVillas) {
                await this.spawn({
                    url: s.url,
                    pos: s.pos,
                    rot: [0, s.rot, 0],
                    scale: 3.5,
                    isWalkable: true,
                    parent: suburbanRoot
                });
            }

            // -------------------------------------------------------------
            // 6. KENNEY INDUSTRIAL PLANT & STORAGE SILOS (Industrial Kit)
            // -------------------------------------------------------------
            const industrialRoot = new THREE.Group();
            industrialRoot.name = 'KENNEY_INDUSTRIAL_ZONE';
            root.add(industrialRoot);

            const industrialSites = [
                { url: 'assets/kenney/industrial/Models/GLB format/building-a.glb', pos: [185, 5.0, -115], scale: 5.5 },
                { url: 'assets/kenney/industrial/Models/GLB format/building-b.glb', pos: [185, 5.0, -85], scale: 5.5 },
                { url: 'assets/kenney/industrial/Models/GLB format/building-c.glb', pos: [185, 5.0, -55], scale: 5.0 },
                { url: 'assets/kenney/industrial/Models/GLB format/building-d.glb', pos: [215, 5.0, -115], scale: 6.0 },
                { url: 'assets/kenney/industrial/Models/GLB format/building-e.glb', pos: [215, 5.0, -85], scale: 5.5 }
            ];

            for (const ind of industrialSites) {
                await this.spawn({
                    url: ind.url,
                    pos: ind.pos,
                    rot: [0, 0, 0],
                    scale: ind.scale,
                    isWalkable: true,
                    parent: industrialRoot
                });
            }

            // -------------------------------------------------------------
            // 7. KENNEY OCEAN WATERCRAFT HARBOR & MARINA (Watercraft Pack)
            // -------------------------------------------------------------
            const harborRoot = new THREE.Group();
            harborRoot.name = 'KENNEY_WATERCRAFT_HARBOR';
            root.add(harborRoot);

            // Moored Interactive Boats at the runway end water edge (Z: 65 to 110)
            const watercraftFleet = [
                {
                    id: 'kenney_speedboat_alpha',
                    name: 'Kenney Wave-Rider Speedboat',
                    desc: 'High-performance twin-prop ocean racer. Slices through swells at 45 knots.',
                    url: 'assets/kenney/watercraft/Models/GLB format/boat-speed-a.glb',
                    pos: [70, 0.2, 75],
                    rot: [0, 0, 0],
                    scale: 2.2
                },
                {
                    id: 'kenney_fanboat_swamp',
                    name: 'Kenney Everglades Fan Airboat',
                    desc: 'Giant aero-prop driven hydro-skimmer. Glides effortlessly across shallow coastlines.',
                    url: 'assets/kenney/watercraft/Models/GLB format/boat-fan.glb',
                    pos: [80, 0.2, 75],
                    rot: [0, 0, 0],
                    scale: 2.2
                },
                {
                    id: 'kenney_fishing_boat',
                    name: 'Frontier Commercial Trawler',
                    desc: 'Sturdy sea trawler with fish storage tanks and radar mast.',
                    url: 'assets/kenney/watercraft/Models/GLB format/boat-fishing-small.glb',
                    pos: [65, 0.2, 92],
                    rot: [0, -Math.PI / 4, 0],
                    scale: 2.2
                },
                {
                    id: 'kenney_houseboat_luxury',
                    name: 'Tropical Coastline Houseboat',
                    desc: 'Floating living villa with bedroom deck, observation roof, and twin pontoons.',
                    url: 'assets/kenney/watercraft/Models/GLB format/boat-house-a.glb',
                    pos: [88, 0.2, 92],
                    rot: [0, Math.PI / 4, 0],
                    scale: 2.2
                }
            ];

            for (const w of watercraftFleet) {
                const boatMesh = await this.spawn({
                    url: w.url,
                    pos: w.pos,
                    rot: w.rot,
                    scale: w.scale,
                    parent: harborRoot
                });

                if (boatMesh) {
                    boatMesh.userData = {
                        id: w.id,
                        name: w.name,
                        desc: w.desc,
                        type: 'BOAT',
                        category: 'boat'
                    };

                    if (typeof window.registerShowroomVehicle === 'function') {
                        window.registerShowroomVehicle(w.id, w.name, w.desc, 'BOAT', boatMesh, boatMesh.position);
                    }
                    this.drivableVehicles.push(boatMesh);
                }
            }

            // Floating Navigation Buoys in the Bay
            const buoyPositions = [
                [50, 0.3, 110],
                [75, 0.3, 130],
                [100, 0.3, 110]
            ];
            for (const bp of buoyPositions) {
                const buoyMesh = await this.spawn({
                    url: 'assets/kenney/watercraft/Models/GLB format/buoy-flag.glb',
                    pos: bp,
                    rot: [0, 0, 0],
                    scale: 2.0,
                    parent: harborRoot
                });
                if (buoyMesh) {
                    this.animatedBuoys.push({ mesh: buoyMesh, basePos: bp.slice(), phase: Math.random() * Math.PI * 2 });
                }
            }

            // -------------------------------------------------------------
            // 8. KENNEY SHAVEESH JESHURUN TRAIN STATION (Train Kit)
            // -------------------------------------------------------------
            const trainRoot = new THREE.Group();
            trainRoot.name = 'KENNEY_TRAIN_DEPOT';
            root.add(trainRoot);

            // Shaveesh Jeshurun Station coordinates are approx (X: -155, Z: -52)
            await this.spawn({
                url: 'assets/kenney/trains/Models/GLB format/train-locomotive-a.glb',
                pos: [-155, 12.8, -48],
                rot: [0, Math.PI / 2, 0],
                scale: 3.2,
                parent: trainRoot
            });
            await this.spawn({
                url: 'assets/kenney/trains/Models/GLB format/train-carriage-coal.glb',
                pos: [-145, 12.8, -48],
                rot: [0, Math.PI / 2, 0],
                scale: 3.2,
                parent: trainRoot
            });
            await this.spawn({
                url: 'assets/kenney/trains/Models/GLB format/train-locomotive-passenger-a.glb',
                pos: [-135, 12.8, -48],
                rot: [0, Math.PI / 2, 0],
                scale: 3.2,
                isWalkable: true,
                parent: trainRoot
            });

            // -------------------------------------------------------------
            // 9. KENNEY ALPINE & TROPICAL FOREST (Mini-Forest Kit)
            // -------------------------------------------------------------
            const forestRoot = new THREE.Group();
            forestRoot.name = 'KENNEY_FOREST_WILDERNESS';
            root.add(forestRoot);

            // Cluster evergreen high pines along the mountain ridges and scenic road
            const treePositions = [
                [55, 5.0, -135],
                [50, 5.0, -110],
                [45, 5.0, -85],
                [48, 5.0, -60],
                [52, 5.0, -35],
                [110, 5.0, -170],
                [130, 5.0, -165],
                [150, 5.0, -160],
                [170, 5.0, -155],
                [-140, 12.5, -65],
                [-165, 12.5, -35]
            ];

            for (const tp of treePositions) {
                await this.spawn({
                    url: 'assets/kenney/forest/Models/GLB format/tree-high.glb',
                    pos: tp,
                    rot: [0, Math.random() * Math.PI * 2, 0],
                    scale: 3.0 + Math.random() * 1.5,
                    parent: forestRoot
                });
            }

            // Wooden Bridge & Platform across the stream/gulley
            await this.spawn({
                url: 'assets/kenney/forest/Models/GLB format/bridge.glb',
                pos: [98, 5.0, -115],
                rot: [0, Math.PI / 2, 0],
                scale: 3.0,
                isWalkable: true,
                parent: forestRoot
            });

            // -------------------------------------------------------------
            // 10. KENNEY CHARACTERS & SPECTATORS (Protagonists & Archers)
            // -------------------------------------------------------------
            await this.spawn({
                url: 'assets/kenney/forest/Models/GLB format/character-archer.glb',
                pos: [75, 5.0, -112],
                rot: [0, Math.PI, 0],
                scale: 2.0,
                parent: root
            });
            await this.spawn({
                url: 'assets/kenney/forest/Models/GLB format/character-archer.glb',
                pos: [88, 7.5, -95],
                rot: [0, -Math.PI / 2, 0],
                scale: 1.8,
                parent: root
            });

            console.log(`🎉 [KenneySystem] All 10 Kenney Asset Packs successfully deployed! (Total: ${this.spawnedMeshes.length} items)`);
        },

        // Per-frame animation update (ocean bobbing for buoys & parked watercraft)
        update(dt, elapsed) {
            if (this.animatedBuoys.length > 0) {
                for (const b of this.animatedBuoys) {
                    const waveY = (typeof window.getWaveHeight === 'function')
                        ? window.getWaveHeight(b.basePos[0], b.basePos[2], elapsed)
                        : Math.sin(elapsed * 2.0 + b.phase) * 0.25;
                    b.mesh.position.y = b.basePos[1] + waveY;
                    b.mesh.rotation.z = Math.sin(elapsed * 1.5 + b.phase) * 0.08;
                    b.mesh.rotation.x = Math.cos(elapsed * 1.2 + b.phase) * 0.08;
                }
            }
        }
    };

    window.KenneySystem = KenneySystem;
    window.buildKenneyCityDistrict = function (sc) {
        return KenneySystem.buildMegaDistrict(sc);
    };

    // Auto-initialize when Three.js is ready
    if (typeof THREE !== 'undefined') {
        KenneySystem.init();
    } else {
        window.addEventListener('DOMContentLoaded', () => KenneySystem.init());
    }
})();
