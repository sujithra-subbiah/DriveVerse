// --- CONFIG & STATE ---
let baseSpeed = 1.8;        // <--- Speed increase panniyaachu
let speed = baseSpeed;
let trafficSpeed = 0.55;    
let nitroFuel = 100;
let gameStarted = false;
let policeCatch = false;
let nitroActive = false;
let gameOver = false;
let score = 0;
let level = 1;
let nightMode = false;
let shakeIntensity = 0;
let lastSpeedUpdate = Date.now(); 
let fuel = 100;
let isPaused = false;
const fuelBar = document.getElementById("fuelBar");
const fuels = []; // Fuel cans store panna array
let moveLeft = false; moveRight = false; moveForward = false; moveBackward = false;
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const countdownOverlay = document.getElementById("countdownOverlay");
const countdownText = document.getElementById("countdownText");
const resumeBtn = document.getElementById("resumeBtn");

// ... rest of your resume logic ...
// Game pause aaga idhu help pannum
const setIcon = document.getElementById("settingsIcon");
const setMenu = document.getElementById("settingsMenu");

setIcon.addEventListener('click', () => {
    if (typeof gameStarted !== 'undefined' && gameStarted) {
        isPaused = true;
    }
});

const closeSet = document.getElementById("closeSettings");
closeSet.addEventListener('click', () => {
    if (typeof gameStarted !== 'undefined' && gameStarted) {
        isPaused = false;
    }
});

// --- START ENGINE & COUNTDOWN LOGIC (Corrected Version) ---
startBtn.onclick = () => {
    startScreen.style.display = "none";
    countdownOverlay.style.display = "flex";
    
    // 1. Background Music
    if (bgMusic && bgMusic.paused) {
        bgMusic.currentTime = 0;
        bgMusic.play().catch(e => console.log("BGM error"));
    }

    // 2. Countdown Sound (Neenga download panna andha racestartsound.mp3)
    if(typeof raceStartSound !== 'undefined') {
        raceStartSound.currentTime = 0;
        raceStartSound.play().catch(e => {});
    }

    let count = 3;
    countdownText.innerText = count;
    isPaused = true; // Car drive lock

    // 3. Visual Countdown Sync (1 second interval)
    let timer = setInterval(() => {
        count--;
        
        if (count > 0) {
            // Screen-la 2, 1 nu maara idhu mukkiyam
            countdownText.innerText = count;
        } 
        else if (count === 0) {
            // GO! varumbodhu Engine sound start aaganum
            countdownText.innerText = "GO!";
            
            if(typeof engineSound !== 'undefined') {
                engineSound.currentTime = 0;
                engineSound.play().catch(e => {});
            }
        } 
        else {
            // Countdown mudinjadhum game-ah start panrom
            clearInterval(timer);
            countdownOverlay.style.display = "none";
            isPaused = false; // Drive unlock
            gameStarted = true;
        }
    }, 1000); 
}; // Bracket correct-ah inga mudiyudhu
// High Score Persistence
let highScore = localStorage.getItem("driveVerseHighScore") || 0;

const restartBtn = document.getElementById("restartBtn");
const gameOverScreen = document.getElementById("gameOverScreen");
const nitroBar = document.getElementById("nitroBar");

// --- SOUNDS ---
const engineSound = new Audio("sounds/engine.mp3");
const coinSound = new Audio("sounds/coin.mp3");
const crashSound = new Audio("sounds/crash.mp3");
const beepSound = new Audio("sounds/beep.mp3"); // New Beep Sound
const bgMusic = new Audio("sounds/bg-music.mp3"); // New Background Music

engineSound.loop = true;
engineSound.volume = 0.4;
coinSound.volume = 0.6;
crashSound.volume = 0.7;

bgMusic.loop = true;
bgMusic.volume = 1.0; // Music background-la lite-ah oduna podhum
beepSound.volume = 1.0;

function startAudio() {
    if (gameStarted) {
        if (engineSound.paused) {
            engineSound.play().catch(e => console.log("Engine audio waiting..."));
        }
        if (bgMusic.paused) {
            bgMusic.play().catch(e => console.log("BG music waiting..."));
        }
    }
}
// --- SCENE SETUP ---
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x87CEEB, 0.005); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x87CEEB);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(10, 20, 10);
scene.add(light);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// --- SPECIAL FX: WIND PARTICLES ---
const particles = new THREE.Group();
const particleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
for (let i = 0; i < 40; i++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 8), particleMat);
    p.position.set(Math.random() * 60 - 30, Math.random() * 20, Math.random() * -100);
    particles.add(p);
}
scene.add(particles);

// --- VISUAL EXTRAS (Birds & Nature) ---
const birds = [];
function createBird() {
    const birdGroup = new THREE.Group();
    const wingGeo = new THREE.BoxGeometry(0.5, 0.02, 0.2);
    const wingMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const wingL = new THREE.Mesh(wingGeo, wingMat);
    const wingR = new THREE.Mesh(wingGeo, wingMat);
    wingL.position.x = -0.25; wingR.position.x = 0.25;
    birdGroup.add(wingL, wingR);
    birdGroup.position.set(Math.random() * 100 - 50, 20 + Math.random() * 10, -Math.random() * 500);
    scene.add(birdGroup);
    birds.push({ mesh: birdGroup, wingL, wingR });
}
for(let i=0; i<12; i++) createBird();

const natureProps = [];
function createTree(x, z) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2), new THREE.MeshStandardMaterial({ color: 0x4d2600 }));
    const leaves = new THREE.Mesh(new THREE.ConeGeometry(1.8, 4, 8), new THREE.MeshStandardMaterial({ color: 0x145214 }));
    leaves.position.y = 2.5;
    const tree = new THREE.Group();
    tree.add(trunk, leaves);
    tree.position.set(x, 1, z);
    scene.add(tree);
    natureProps.push(tree);
}
for(let i=0; i<50; i++) { createTree(Math.random() > 0.5 ? -15 : 15, -i * 20); }

// --- ROAD & ENVIRONMENT (Infinite Logic) ---
const roads = []; 
const roadLines = []; 

function createRoad(z) {
    const roadGeometry = new THREE.PlaneGeometry(100, 200);
    // MeshStandardMaterial road color eppovumae black-ah irukka dhaan 0x111111
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.z = z;
    scene.add(road);
    roads.push(road);
}

// 1. Initial blocks (15 blocks * 200 length = 3000 units munnadiye road irukkum)
for (let i = 0; i < 15; i++) {
    createRoad(-i * 200);
}

// 2. Center Lines
for (let i = 0; i < 40; i++) {
    const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.1, 5), 
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    line.position.set(0, 0.05, -i * 10);
    scene.add(line);
    roadLines.push(line);
}

// --- ROAD LOOP LOGIC (Idhai animate() function kulla vaiyunga) ---
function handleInfiniteRoad() {
    roads.forEach(road => {
        // Road car-ah thandi pinnadi pōna, adhai munnadi 3000 units thallurom
        if (road.position.z > car.position.z + 200) {
            road.position.z -= 15 * 200; 
        }
    });

    roadLines.forEach(line => {
        if (line.position.z > car.position.z + 20) {
            line.position.z -= 400; 
        }
    });
}
// --- BUILDINGS WITH DYNAMIC WINDOWS ---
const buildings = [];
const buildingColors = [0x333333, 0x444444, 0x222222, 0x555555];

function createBuilding(x, z) {
    const h = Math.random() * 35 + 15;
    const randomColor = buildingColors[Math.floor(Math.random() * buildingColors.length)];
    const bGeo = new THREE.BoxGeometry(10, h, 10);
    const bMat = new THREE.MeshStandardMaterial({ color: randomColor });
    const b = new THREE.Mesh(bGeo, bMat);
    b.position.set(x, h/2, z);

    const winGeo = new THREE.PlaneGeometry(1.2, 1.2);
    for (let row = 3; row < h - 3; row += 4) {
        for (let side = 0; side < 2; side++) {
            const zPos = side === 0 ? 5.05 : -5.05;
            for (let col = -3; col <= 3; col += 3) {
                const winMat = new THREE.MeshStandardMaterial({ 
                    color: 0x111111,
                    emissive: 0x000000,
                    emissiveIntensity: 0
                });
                const windowMesh = new THREE.Mesh(winGeo, winMat);
                windowMesh.position.set(col, row - h/2, zPos);
                if(side === 1) windowMesh.rotation.y = Math.PI;
                b.add(windowMesh);
            }
        }
    }
    scene.add(b);
    buildings.push(b);
}
for (let i = -1000; i < 1000; i += 35) { createBuilding(-35, i); createBuilding(35, i); }

// --- CARS & COINS ---
const car = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 4), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
car.position.y = 0.5;
scene.add(car);

const headLightL = new THREE.SpotLight(0xffffff, 0, 60, Math.PI/4);
headLightL.position.set(-0.8, 0.5, -2);
car.add(headLightL, headLightL.target);
headLightL.target.position.set(-0.8, 0, -10);
const headLightR = headLightL.clone();
headLightR.position.x = 0.8;
car.add(headLightR, headLightR.target);

// fuel ---
function createFuelCan(z) {
    // Oru chinna Cylinder or Box (Green color)
    const can = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 1.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.5 })
    );
    can.position.set(Math.random() * 10 - 5, 1, z);
    scene.add(can);
    fuels.push(can);
}

// Initial cans create panna (loop-la add pannunga)
for (let i = -1000; i < 1000; i += 150) createFuelCan(i);

// --- SIREN LIGHTS ADDED HERE ---
const policeCar = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 4), new THREE.MeshStandardMaterial({ color: 0xffffff }));
policeCar.position.set(0, 0.5, 30);
scene.add(policeCar);
const sirenRed = new THREE.PointLight(0xff0000, 0, 15);
const sirenBlue = new THREE.PointLight(0x0000ff, 0, 15);
sirenRed.position.set(-0.5, 1.2, 0); sirenBlue.position.set(0.5, 1.2, 0);
policeCar.add(sirenRed, sirenBlue);

const trafficCars = [];
function createTrafficCar(z) {
    const isLorry = Math.random() > 0.75; 
    const length = isLorry ? 8.5 : 4.5;   
    const height = isLorry ? 2.5 : 1.1;   
    const color = isLorry ? 0x555555 : Math.random() * 0xffffff;

    const traffic = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, height, length), 
        new THREE.MeshStandardMaterial({ color: color })
    );
    
    traffic.position.set(Math.random() > 0.5 ? -5 : 5, height / 2, z);
    
    // Indha line thaan romba mukkiyam (Don't skip)
    traffic.userData = { isLorry: isLorry, length: length }; 
    
    scene.add(traffic);
    trafficCars.push(traffic);
}
// Gap-ah 60-ku mathittaen, lorries-ku space kedaikkum
for (let i = -1000; i < 1000; i += 60) createTrafficCar(i);
// --- CENTER OBSTACLES (Safe Center logic avoid panna) ---
const centerObstacles = [];

function createCenterObstacle(z) {
    // 1. Group create panrom (Body + Windows + Wheels ellam onna irukka)
    const obstacleGroup = new THREE.Group();

    // 2. Red Body (Car shape-ku mathittaen)
    const geometry = new THREE.BoxGeometry(2, 1, 4); 
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xff0000, 
        emissive: 0xff0000, 
        emissiveIntensity: 1.2 
    });
    const body = new THREE.Mesh(geometry, material);
    obstacleGroup.add(body);

    // 3. Add Details (Windows & Wheels function-ah call panrom)
    if (typeof addCarDetails === 'function') {
        addCarDetails(obstacleGroup);
    }

    // 4. Glow Light (Red shadow effect)
    const redLight = new THREE.PointLight(0xff0000, 20, 15); 
    redLight.position.set(0, 1, 0); 
    obstacleGroup.add(redLight); 

    // Position and Add to Scene
    obstacleGroup.position.set(0, 0.5, z); 
    scene.add(obstacleGroup);
    centerObstacles.push(obstacleGroup);
}
// Oru 8 obstacles dhooram dhoorama create panrom
for (let i = 1; i <= 8; i++) {
    createCenterObstacle(-i * 600); 
}

const coins = [];
function createCoin(z) {
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.2, 32), new THREE.MeshStandardMaterial({ color: 0xFFD700 }));
    coin.rotation.x = Math.PI / 2;
    coin.position.set([-4.5, 0, 4.5][Math.floor(Math.random()*3)], 1.2, z);
    scene.add(coin);
    coins.push(coin);
}
for (let i = -1000; i < 1000; i += 35) createCoin(i);
// --- ALL CONTROLS (Movement, Night Mode, Space) ---
document.addEventListener("keydown", (e) => {
    // 1. Movement Keys
    if (e.key === "ArrowUp") { 
        moveForward = true; 
        if (!gameStarted) { 
            gameStarted = true; 
            if(typeof startAudio === 'function') startAudio(); 
        }
    }
    if (e.key === "ArrowDown") moveBackward = true;
    if (e.key === "ArrowLeft") moveLeft = true;
    if (e.key === "ArrowRight") moveRight = true;
    if (e.key === "Shift" && typeof nitroFuel !== 'undefined' && nitroFuel > 10) { 
        nitroActive = true; 
    }

    // 2. Night Mode (N Key)
    if (e.key === "n" || e.key === "N") {
        nightMode = !nightMode;
        if (typeof renderer !== 'undefined') renderer.setClearColor(nightMode ? 0x000011 : 0x87CEEB);
        if (typeof scene !== 'undefined' && scene.fog) scene.fog.color.setHex(nightMode ? 0x000011 : 0x87CEEB);
        if (typeof ambientLight !== 'undefined') ambientLight.intensity = nightMode ? 0.05 : 0.6;
        if (typeof headLightL !== 'undefined') headLightL.intensity = nightMode ? 10 : 0;
        if (typeof headLightR !== 'undefined') headLightR.intensity = nightMode ? 10 : 0;

        if (typeof buildings !== 'undefined') {
            buildings.forEach(b => {
                b.children.forEach(win => {
                    if(win.geometry && win.geometry.type === "PlaneGeometry") {
                        const isLit = Math.random() > 0.3;
                        win.material.emissive.setHex(nightMode && isLit ? 0xffff00 : 0x000000);
                        win.material.emissiveIntensity = nightMode ? 1.5 : 0;
                        win.material.color.setHex(nightMode && isLit ? 0xffffff : 0x111111);
                    }
                });
            });
        }
    }

    // 3. Space Key Logic (Pause/Resume)
    if (e.code === "Space") {
        e.preventDefault();

        if (!gameStarted) {
            if(typeof startBtn !== 'undefined') startBtn.click(); 
        } else if (gameOver) {
            location.reload();
        } else {
            // Ippo game oaditu irundha Pause pannuvom
            if (!isPaused) {
                isPaused = true;
                const resOverlay = document.getElementById("resumeOverlay");
                const setMenu = document.getElementById("settingsMenu");
                
                if (resOverlay) resOverlay.style.display = "flex";
                if (setMenu) setMenu.style.display = "none";

                if(typeof bgMusic !== 'undefined') bgMusic.pause();
                if(typeof engineSound !== 'undefined') engineSound.pause();
            } else {
                // Oruvelai pause-la irundha, Resume button-ah click panna solluvom
                // Idhu namma munaadi ezhudhiya Countdown + Sound logic-ah trigger pannum
                const resBtn = document.getElementById("resumeBtn");
                if(resBtn) resBtn.click();
            }
        }
    }
}); // <--- All controls end here perfectly!
// --- 2. KEYUP LISTENER ---
document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowUp") moveForward = false;
    if (e.key === "ArrowDown") moveBackward = false;
    if (e.key === "ArrowLeft") moveLeft = false;
    if (e.key === "ArrowRight") moveRight = false;
    if (e.key === "Shift") nitroActive = false;
});

// --- ANIMATION ---
function animate() {
    requestAnimationFrame(animate);
    function addCarDetails(carGroup) {
    // 1. WINDOW (Black Glass Look)
    const windowGeo = new THREE.BoxGeometry(1.6, 0.6, 1.2);
    const windowMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const win = new THREE.Mesh(windowGeo, windowMat);
    win.position.set(0, 0.6, 0.2); // Car top-la glass maari set panrom
    carGroup.add(win);

    // 2. WHEELS (4 Black Wheels)
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.4, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    const wheelPositions = [
        {x: -1, y: -0.4, z: 1.2},  // Front Left
        {x: 1, y: -0.4, z: 1.2},   // Front Right
        {x: -1, y: -0.4, z: -1.2}, // Back Left
        {x: 1, y: -0.4, z: -1.2}    // Back Right
    ];

    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(pos.x, pos.y, pos.z);
        carGroup.add(wheel);
    });
}
    
    if (gameOver) return;

    let now = Date.now();
    let delta = now * 0.005;

    // --- MAIN GAME LOGIC (Fuel, Movement & Environment) ---
    if (gameStarted && !gameOver && !isPaused) {
        handleInfiniteRoad();
        // 1. Fuel Consumption
        fuel -= 0.12; 
        if(fuelBar) {
            fuelBar.style.width = fuel + "%";
            if (fuel < 20) {
                fuelBar.style.background = "#ff0000";
                if (Math.floor(Date.now() / 500) % 2 === 0 && beepSound.paused) {
                    beepSound.currentTime = 0;
                    beepSound.play().catch(e => {});
                }
            } else {
                fuelBar.style.background = "#ffcc00"; 
            }
        }
        if (fuel <= 0) { fuel = 0; triggerGameOver(); }

        // 2. Dynamic Environment & Lights
        let cycleScore = score % 1200;
        if (cycleScore < 300) {
            renderer.setClearColor(0x87CEEB); scene.fog.color.setHex(0x87CEEB);
            ambientLight.intensity = 0.7; light.intensity = 1.2;
            updateWorldLights(false);
        } else if (cycleScore < 600) {
            renderer.setClearColor(0xfff4e6); scene.fog.color.setHex(0xfff4e6);
            ambientLight.intensity = 0.9; light.intensity = 1.5;
            updateWorldLights(false);
        } else if (cycleScore < 900) {
            renderer.setClearColor(0xff8c00); scene.fog.color.setHex(0xff8c00);
            ambientLight.intensity = 0.5; light.intensity = 0.8;
            updateWorldLights(true, 0.5);
        } else {
            renderer.setClearColor(0x000022); scene.fog.color.setHex(0x000022);
            ambientLight.intensity = 0.1; light.intensity = 0.1;
            updateWorldLights(true, 1.5);
        }

        // 3. Automatic Speed Increase
        if (now - lastSpeedUpdate > 30000) { 
            baseSpeed += 0.06; trafficSpeed += 0.04; lastSpeedUpdate = now;
        }

        // 4. Movement & Car Controls
        let nitroShake = 0;
        if (nitroActive && nitroFuel > 0) {
            speed = baseSpeed + 0.6; nitroFuel -= 0.6; nitroShake = (Math.random() - 0.5) * 0.12; 
            camera.fov = 85; 
        } else {
            speed = baseSpeed; camera.fov = 75;
            if (nitroFuel < 100) nitroFuel += 0.15;
        }
        camera.updateProjectionMatrix();
        if(nitroBar) nitroBar.style.width = nitroFuel + "%";

        if (moveForward) car.position.z -= speed;
        if (moveBackward) car.position.z += speed;
        if (moveLeft && car.position.x > -7.5) { car.position.x -= 0.45; car.rotation.z = 0.18; }
        else if (moveRight && car.position.x < 7.5) { car.position.x += 0.45; car.rotation.z = -0.18; }
        else { car.rotation.z *= 0.9; }

      // --- 5. Police Chase Logic (Updated for Progressive Difficulty) ---
if (!moveForward) { 
    policeCatch = true; 
} else { 
    policeCatch = false; 
}

if (policeCatch) {
    // Score adhighamaaga aaga police innum vegama varuvaanga
    let difficultyBonus = score / 2000; 
    policeCar.position.z -= (speed + 0.10 + difficultyBonus); 
    
    policeCar.position.x += (car.position.x - policeCar.position.x) * 0.1;

    if (car.position.distanceTo(policeCar.position) < 3.0) { 
        shakeIntensity = 2; 
        triggerGameOver(); 
    }
} else {
    // --- SAFE START LOGIC ---
    // Game aarambathula (score = 0) police 30 unit dhoorathula iruppaanga.
    // Score yera yera (ovvoru 100 points-kum) 1 unit nerungi varuvaanga.
    // Minimum 12 unit dhooram varai close-ah varuvaanga.
    
    let dynamicGap = 30 - Math.min(score / 100, 18); 
    
    policeCar.position.z = car.position.z + dynamicGap;
    policeCar.position.x += (car.position.x - policeCar.position.x) * 0.05;
}

        // 6. Traffic & Obstacles
        trafficCars.forEach(t => {
            t.position.z += trafficSpeed;
            if (t.position.z > car.position.z + 60) {
                t.position.z = car.position.z - 600;
                t.position.x = Math.random() > 0.5 ? -5 : 5;
            }
            let tLength = (t.userData && t.userData.length) ? t.userData.length : 4.5;
            let hitZ = tLength / 2 + 1.8; 
            if (Math.abs(car.position.x - t.position.x) < 2.2 && Math.abs(car.position.z - t.position.z) < hitZ) {
                shakeIntensity = 1.5; triggerGameOver();
            }
        });

    } // <--- End of Active Game Logic (gameStarted && !isPaused)

    // --- OBJECTS THAT ALWAYS RUN (Particles, Birds, Coins, Road) ---
    particles.position.z = car.position.z;
    particles.children.forEach(p => {
        p.position.z += speed * 2;
        if (p.position.z > 20) p.position.z = -150;
        p.visible = gameStarted;
        p.scale.z = nitroActive ? 5 : 1; 
    });

    birds.forEach(b => {
        b.mesh.position.z += 0.2;
        b.wingL.rotation.z = Math.sin(delta * 3) * 0.6;
        b.wingR.rotation.z = -Math.sin(delta * 3) * 0.6;
        if(b.mesh.position.z > car.position.z + 50) b.mesh.position.z = car.position.z - 500;
    });

    natureProps.forEach(tree => { if(tree.position.z > car.position.z + 80) tree.position.z = car.position.z - 600; });

    fuels.forEach(f => {
        f.rotation.y += 0.05;
        if (car.position.distanceTo(f.position) < 3.5) {
            fuel = Math.min(fuel + 30, 100); 
            f.position.z = car.position.z - 900; 
            f.position.x = Math.random() * 10 - 5;
        }
        if (f.position.z > car.position.z + 60) { f.position.z = car.position.z - 900; }
    });

    coins.forEach(c => {
        c.rotation.z += 0.05;
        if (car.position.distanceTo(c.position) < 3) {
            score += 10; updateScore();
            coinSound.currentTime = 0; coinSound.play();
            c.position.z = car.position.z - 600;
            if (score > highScore) { highScore = score; localStorage.setItem("driveVerseHighScore", highScore); }
        }
        if (c.position.z > car.position.z + 60) c.position.z = car.position.z - 600;
    });
    // --- Inside animate function, active game logic kulla vaiyunga ---

centerObstacles.forEach(obs => {
    // 1. Infinite Repositioning (Road munnadi pōga pōga loop aagum)
    if (obs.position.z > car.position.z + 60) {
        obs.position.z = car.position.z - 1200; 
    }

    // 2. Collision Detection (Car center-la muttuna Crash!)
    let diffX = Math.abs(car.position.x - obs.position.x);
    let diffZ = Math.abs(car.position.z - obs.position.z);

    if (diffX < 1.8 && diffZ < 2.2) {
        shakeIntensity = 2.0; // Screen nalla adhirum
        
        if (typeof crashSound !== 'undefined') {
            crashSound.currentTime = 0;
            crashSound.play().catch(e => {});
        }
        
        triggerGameOver(); // "DUM" sound vandhu game over aagum
    }
});
    if (gameStarted) {
        let sirenTime = Date.now() * 0.01;
        sirenRed.intensity = Math.sin(sirenTime) > 0 ? 12 : 0.1;
        sirenBlue.intensity = Math.sin(sirenTime) < 0 ? 12 : 0.1;
    }

    roadLines.forEach(l => { if (l.position.z > car.position.z + 20) l.position.z = car.position.z - 200; });
    buildings.forEach(b => { if (b.position.z > car.position.z + 100) b.position.z = car.position.z - 1200; });

    // --- CAMERA & RENDER ---
    let currentShake = (Math.random() - 0.5) * (shakeIntensity + (nitroActive ? 0.12 : 0));
    const targetZ = car.position.z + 16;  
    const targetY = car.position.y + 7.5;   
    camera.position.z += (targetZ - camera.position.z) * 0.1;
    camera.position.y += (targetY - camera.position.y) * 0.1;
    camera.position.x += (car.position.x * 0.6 + currentShake - camera.position.x) * 0.1;
    camera.lookAt(car.position.x, car.position.y + 1, car.position.z - 25);
    if (shakeIntensity > 0) shakeIntensity *= 0.9;

    renderer.render(scene, camera);
}

// --- GLOBAL HELPER FUNCTIONS ---
function updateWorldLights(status, intensity = 1) {
    headLightL.intensity = status ? 10 : 0;
    headLightR.intensity = status ? 10 : 0;
    buildings.forEach(b => {
        b.children.forEach(win => {
            if(win.geometry && win.geometry.type === "PlaneGeometry") {
                win.material.emissive.setHex(status ? 0xffff00 : 0x000000);
                win.material.emissiveIntensity = status ? intensity : 0;
            }
        });
    });
}

function triggerGameOver() {
    if (gameOver) return;
    gameOver = true;
    crashSound.play(); engineSound.pause();
    document.getElementById("finalScore").innerText = "Final Score : " + score;
    gameOverScreen.style.display = "flex";
}

function updateScore() {
    const sb = document.getElementById("scoreBoard");
    level = Math.floor(score / 200) + 1;
    sb.innerHTML = `SCORE: ${score} | LEVEL: ${level}<br><span>BEST: ${highScore}</span>`;
}

// --- SETTINGS & CONTROLS ---
settingsIcon.onclick = () => {
    settingsMenu.style.display = "flex";
    if (gameStarted) isPaused = true;
};
closeSettings.onclick = () => {
    settingsMenu.style.display = "none";
    if (gameStarted) isPaused = false;
};
document.getElementById("showControls").onclick = () => { 
    settingsMenu.style.display = "none"; 
    controlsPopup.style.display = "block"; 
};
closeControls.onclick = () => { 
    controlsPopup.style.display = "none"; 
    settingsMenu.style.display = "flex"; 
};
// --- RESUME LOGIC (Updated with Downloaded Sound) ---
if (document.getElementById("resumeBtn")) {
    document.getElementById("resumeBtn").addEventListener('click', function() {
        document.getElementById("resumeOverlay").style.display = "none";
        const cdOverlay = document.getElementById("countdownOverlay");
        const cdText = document.getElementById("countdownText");

        if (cdOverlay) {
            cdOverlay.style.display = "flex";
            let count = 3; 
            cdText.innerText = count;

            // 1. NEENGA DOWNLOAD PANNA SOUND-AH INGA PLAY PANNUNGA
            // Start-la epadi play aagudho, adhey maari resume-layum katchidhama ketae countdown oadum
            if(typeof raceStartSound !== 'undefined') {
                raceStartSound.currentTime = 0;
                raceStartSound.play().catch(e => {});
            }

            // 2. Visual Countdown Sync (Start-la panna adhey 1000ms rhythm)
            let timer = setInterval(() => {
                count--;
                if (count > 0) { 
                    cdText.innerText = count; 
                } 
                else if (count === 0) { 
                    cdText.innerText = "GO!"; 
                    
                    // GO! varumbodhu Engine sound start aagum
                    if(typeof engineSound !== 'undefined') {
                        engineSound.currentTime = 0; 
                        engineSound.play().catch(e => {}); 
                    }
                } 
                else { 
                    clearInterval(timer); 
                    cdOverlay.style.display = "none"; 
                    isPaused = false; // Drive unlock
                }
            }, 1000); // Start logic-oda match aaga 1 second rhythm
        }
    });
}
// --- MUSIC ON/OFF LOGIC ---
const musicBtn = document.getElementById("musicToggle");

if (musicBtn) {
    musicBtn.onclick = () => {
        // bgMusic dhaan unga background music variable-nu confirm pannikkonga
        if (typeof bgMusic !== 'undefined') {
            if (bgMusic.paused) {
                bgMusic.play().catch(e => console.log("Playback error"));
                musicBtn.innerText = "ON";
                musicBtn.style.background = "#ffd700"; // Gold color
                musicBtn.style.color = "black";
            } else {
                bgMusic.pause();
                musicBtn.innerText = "OFF";
                musicBtn.style.background = "#555"; // Grey color
                musicBtn.style.color = "white";
            }
        }
    };
}
// 1. Slider element-ah variable-la edukkurom
const volSlider = document.getElementById("volumeSlider");

if (volSlider) {
    // Slider-ah move pannumpodhu (oninput) indha function trigger aagum
    volSlider.oninput = (e) => {
        const volumeValue = e.target.value; // Idhu 0.0-la irundhu 1.0 varai irukkum
        
        // Background Music volume-ah mathurom
        if (typeof bgMusic !== 'undefined') {
            bgMusic.volume = volumeValue;
        }

        // Optional: Engine sound-aiyum konjam kammi panna idhai use pannunga
        if (typeof engineSound !== 'undefined') {
            engineSound.volume = volumeValue * 0.7; // Engine sound music-ah vida konjam kammiyaa irukkum
        }
        
        console.log("Current Volume: " + volumeValue);
    };
}
// 1. Background Music-ah load pannumbodhey volume set panniduvom
if (typeof bgMusic !== 'undefined') {
    bgMusic.volume = 0.6; // Neenga slider-la vachurukka initial volume
    bgMusic.loop = true;  // Music thirumba thirumba oadanum
}

// 2. Start Button Click pannuna odaney ella sound-um trigger aaganum
startBtn.onclick = () => {
    startScreen.style.display = "none";
    countdownOverlay.style.display = "flex";
    
    // --- AUDIO AUTO-START ---
    // User click pannitaanga, so ippo browser sound-ah block pannaadhu
    if (typeof bgMusic !== 'undefined') {
        bgMusic.play().catch(e => {
            console.log("Audio start-la chinna issue: ", e);
        });
    }

    // Countdown sound start aagum
    if(typeof raceStartSound !== 'undefined') {
        raceStartSound.currentTime = 0;
        raceStartSound.play().catch(e => {});
    }

    // Mithadha countdown logic (3, 2, 1, GO!)
    let count = 3;
    countdownText.innerText = count;
    isPaused = true; 

    let timer = setInterval(() => {
        count--;
        if (count > 0) {
            countdownText.innerText = count;
        } else if (count === 0) {
            countdownText.innerText = "GO!";
            if(typeof engineSound !== 'undefined') {
                engineSound.currentTime = 0;
                engineSound.play().catch(e => {});
            }
        } else {
            clearInterval(timer);
            countdownOverlay.style.display = "none";
            isPaused = false; 
            gameStarted = true;
        }
    }, 1000); 
};
restartBtn.addEventListener("click", () => location.reload());

// --- START GAME ---
animate();