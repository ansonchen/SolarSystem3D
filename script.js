import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { planetInfo, planetsConfig } from './src/config.js';
import { createSun } from './src/sun.js';
import { createBackground, createStars } from './src/environment.js';
import { getInitialCameraPosition } from './src/utils.js';
import * as AudioMgr from './src/audio.js';
import * as Textures from './src/textures.js';
import { getRotationSpeed } from './src/physics.js'; // 物理引擎只负责自转
import { getOrbitalSpeed } from './src/orbit.js';    // 新的公转模块
import * as MoonMgr from './src/moon.js';            // 月球模块
import { BeltSystem } from './src/belts.js';         // 小行星带模块
import { createConstellations } from './src/constellation.js'; // 星座模块
import { createFarGalaxies, updateFarGalaxies } from './src/far_galaxy.js'; // 河外星系模块
import { createComet, updateComet, halleyInfo } from './src/comet.js'; // 彗星模块
import { initCamera } from './src/camera.js';
import { initContact } from './src/contact.js';
import { StoryView } from './src/story_view.js';

// --- 场景初始化 ---
const scene = new THREE.Scene();
createBackground(scene);
createFarGalaxies(scene); // 添加河外星系超远景
// createStars(scene); // 移除前景浮动星尘
const constellationMgr = createConstellations(scene); // 添加真实星座背景

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 15000);
let INITIAL_CAM_POS = getInitialCameraPosition();
camera.position.copy(INITIAL_CAM_POS);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.6; // 稍微降低曝光，配合 Bloom 防止过曝
document.body.appendChild(renderer.domElement);

// 初始化相机截图按钮
initCamera(renderer);
initContact();

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

// --- 后期处理 (Post-Processing) ---
const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.85; // 提高阈值，只让非常亮的物体发光 (太阳、背景)
bloomPass.strength = 1.0;   // 稍微降低强度，避免过曝
bloomPass.radius = 0.5;

const outputPass = new OutputPass();

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);
composer.addPass(outputPass);

// 灯光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // 降低环境光，让行星暗部更自然
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffffff, 3.0, 0, 0);
sunLight.position.set(0, 0, 0);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 4096;
sunLight.shadow.mapSize.height = 4096;
// 优化阴影参数以消除伪影
sunLight.shadow.bias = -0.0001; // 稍微增加负偏差
sunLight.shadow.normalBias = 0.05; // 显著增加法线偏差，这对球体非常有效
scene.add(sunLight);

// --- 创建天体 ---
const { sun, sunUniforms } = createSun(scene);

// 创建哈雷彗星
const cometObj = createComet(scene);

// 初始化小行星带系统
const beltSystem = new BeltSystem(scene);
// 1. 主小行星带 (Mars: 58, Jupiter: 80) -> 范围 65-75
const asteroidBelt = beltSystem.createBelt('AsteroidBelt', 2000, 65, 75, 0.15, 0x888888, false);
// 2. 柯伊伯带 (Neptune: 150, Pluto: 170) -> 范围 160-220
const kuiperBelt = beltSystem.createBelt('KuiperBelt', 3000, 160, 220, 0.2, 0xaaccff, true);

const planetMeshes = [];

planetsConfig.forEach(data => {
    const orbitGroup = new THREE.Group();
    if (data.orbitTilt) {
        orbitGroup.rotation.x = THREE.MathUtils.degToRad(data.orbitTilt);
        orbitGroup.rotation.z = THREE.MathUtils.degToRad(10);
    }
    scene.add(orbitGroup);

    const texData = data.texFn();
    const map = texData.texture || texData;
    const bumpMap = texData.bumpMap || null;
    const specularMap = texData.specularMap || null;

    const geometry = new THREE.SphereGeometry(data.radius, 128, 128);
    let finalMat;

    if (specularMap) {
        finalMat = new THREE.MeshPhongMaterial({
            map: map,
            color: 0xffffff,
            emissive: new THREE.Color(data.color),
            emissiveIntensity: 0.1,
            specularMap: specularMap,
            specular: 0x333333,
            shininess: 30,
            bumpMap: bumpMap,
            bumpScale: data.bumpScale
        });
    } else {
        finalMat = new THREE.MeshStandardMaterial({
            map: map,
            color: 0xffffff,
            roughness: data.roughness,
            metalness: 0.1,
            emissive: new THREE.Color(data.color),
            emissiveIntensity: 0.1,
            bumpMap: bumpMap,
            bumpScale: data.bumpScale || 0
        });
    }

    const mesh = new THREE.Mesh(geometry, finalMat);
    mesh.position.x = data.distance;
    mesh.rotation.z = THREE.MathUtils.degToRad(data.tilt || 23.5);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    orbitGroup.add(mesh);

    if (data.atmosphere) {
        const atmoGeo = new THREE.SphereGeometry(data.radius * 1.1, 64, 64);
        const atmoMat = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(data.atmosphere) },
                viewVector: { value: camera.position }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    vViewPosition = -mvPosition.xyz;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                void main() {
                    vec3 normal = normalize(vNormal);
                    vec3 viewDir = normalize(vViewPosition);
                    float dotProduct = dot(normal, viewDir);
                    float intensity = pow(0.5 - dotProduct, 6.0);
                    intensity = clamp(intensity, 0.0, 0.8);
                    gl_FragColor = vec4(color, intensity * 0.6);
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
        });
        const atmo = new THREE.Mesh(atmoGeo, atmoMat);
        mesh.add(atmo);
    }

    let cloudMesh = null;
    if (data.hasClouds) {
        const cloudGeo = new THREE.SphereGeometry(data.radius + 0.05, 64, 64);
        const cloudMat = new THREE.MeshStandardMaterial({
            map: Textures.createEarthCloudTexture(),
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            alphaTest: 0.1
        });
        cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
        mesh.add(cloudMesh);

        const shadowGeo = new THREE.SphereGeometry(data.radius + 0.02, 64, 64);
        const shadowMat = new THREE.MeshBasicMaterial({
            map: cloudMat.map,
            color: 0x000000,
            transparent: true,
            opacity: 0.2,
            blending: THREE.NormalBlending
        });
        const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        mesh.add(shadowMesh);
    }

    // 初始化月球 (仅地球)
    if (data.name === 'Earth') {
        window.earthMoonMesh = MoonMgr.createMoon(mesh);
    }

    if (data.ring) {
        const ringGeo = new THREE.RingGeometry(data.ring.inner, data.ring.outer, 128);
        const pos = ringGeo.attributes.position;
        const uv = ringGeo.attributes.uv;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            uv.setXY(i, (x / data.ring.outer) * 0.5 + 0.5, (y / data.ring.outer) * 0.5 + 0.5);
        }

        let ringTexture;
        if (data.ring.type === 'particle') {
            ringTexture = Textures.createParticleRingTexture(data.ring.color);
        } else if (data.ring.type === 'detailed') {
            ringTexture = Textures.createRingTexture(data.ring.color, true);
        } else {
            ringTexture = Textures.createRingTexture(data.ring.color);
        }

        const ringMat = new THREE.MeshBasicMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        mesh.add(ring);
    }

    const orbitCurve = new THREE.EllipseCurve(0, 0, data.distance, data.distance, 0, 2 * Math.PI);
    const points = orbitCurve.getPoints(128);
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    orbitLine.rotation.x = Math.PI / 2;

    if (data.orbitTilt) {
        const tiltedOrbitGroup = new THREE.Group();
        tiltedOrbitGroup.rotation.x = THREE.MathUtils.degToRad(data.orbitTilt);
        tiltedOrbitGroup.rotation.z = THREE.MathUtils.degToRad(10);
        tiltedOrbitGroup.add(orbitLine);
        scene.add(tiltedOrbitGroup);
    } else {
        scene.add(orbitLine);
    }

    // 标签
    const div = document.createElement('div');
    div.className = 'label';
    div.textContent = data.name;
    div.addEventListener('click', (e) => {
        e.stopPropagation();
        const worldPos = new THREE.Vector3();
        mesh.getWorldPosition(worldPos);
        showInfo(planetInfo[data.name], worldPos, new THREE.Vector3(12, 6, 12));
    });

    const label = new CSS2DObject(div);
    scene.add(label);

    // 计算真实物理参数
    const rotationSpeed = getRotationSpeed(data.name);
    const orbitalSpeed = getOrbitalSpeed(data.name);

    planetMeshes.push({
        mesh, data, orbitGroup, cloudMesh, label,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed, // 自转角速度 (弧度/秒)
        orbitalSpeed   // 公转角速度 (弧度/秒)
    });
});

// --- 动画与交互 ---

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.zoomSpeed = 0.8;
controls.rotateSpeed = 0.5;
controls.minDistance = 20;
controls.maxDistance = 800;

const storyView = new StoryView(camera, controls, planetMeshes, sun);

controls.addEventListener('start', () => {
    isTransitioning = false;
    targetCameraPos = null;
});

let isAutoRotating = true;
let targetCameraPos = null;
let targetLookAt = null;
let isTransitioning = false;
let isNameVisible = true;

const occlusionRaycaster = new THREE.Raycaster();
const occlusionVec = new THREE.Vector3();

let lastTime = Date.now();
let totalTime = 0;

function animate() {
    requestAnimationFrame(animate);

    // 计算时间差 (秒)
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastTime) / 1000; // 毫秒转秒
    lastTime = currentTime;

    if (isAutoRotating) {
        totalTime += deltaTime;
        updateComet(totalTime, camera); // 传入 camera

        planetMeshes.forEach(obj => {
            // 使用物理引擎计算的角速度
            obj.angle += obj.orbitalSpeed * deltaTime;
            obj.mesh.position.x = Math.cos(obj.angle) * obj.data.distance;
            obj.mesh.position.z = Math.sin(obj.angle) * obj.data.distance;
        });
    }

    sunUniforms.time.value += 0.06;

    // 更新星座闪烁
    if (constellationMgr && constellationMgr.update) {
        constellationMgr.update(deltaTime);
    }

    // 更新小行星带
    beltSystem.update();

    // 更新河外星系动画
    updateFarGalaxies(deltaTime);

    planetMeshes.forEach(obj => {
        // 使用物理引擎计算的自转速度
        obj.mesh.rotation.y += obj.rotationSpeed * deltaTime;

        // 云层速度设为自转的 1.4 倍（模拟大气流动）
        if (obj.cloudMesh) {
            obj.cloudMesh.rotation.y += obj.rotationSpeed * deltaTime * 1.4;
        }

        // 更新月球 (仅地球)
        if (obj.data.name === 'Earth') {
            MoonMgr.updateMoon(deltaTime, obj.rotationSpeed);
        }

        if (obj.label) {
            const worldPos = new THREE.Vector3();
            obj.mesh.getWorldPosition(worldPos);
            obj.label.position.copy(worldPos);
            obj.label.position.y += obj.data.radius + 1.5;

            const elem = obj.label.element;

            if (!isNameVisible) {
                elem.style.opacity = 0;
                elem.style.pointerEvents = 'none';
            } else {
                const labelPos = obj.label.position;
                const camPos = camera.position;
                const distToLabel = camPos.distanceTo(labelPos);

                occlusionVec.subVectors(labelPos, camPos).normalize();
                occlusionRaycaster.set(camPos, occlusionVec);

                const occluders = [sun, ...planetMeshes.map(p => p.mesh)];
                const intersects = occlusionRaycaster.intersectObjects(occluders, false);

                let isVisible = true;
                if (intersects.length > 0) {
                    if (intersects[0].distance < distToLabel - 0.5) {
                        isVisible = false;
                    }
                }

                if (isVisible) {
                    elem.style.opacity = 1;
                    elem.style.pointerEvents = 'auto';
                } else {
                    elem.style.opacity = 0.2;
                    elem.style.pointerEvents = 'none';
                }
            }
        }
    });

    sun.rotation.y += 0.002;

    if (storyView.isActive) {
        storyView.update(deltaTime);
    } else {
        if (isTransitioning && targetCameraPos && targetLookAt) {
            camera.position.lerp(targetCameraPos, 0.05);
            controls.target.lerp(targetLookAt, 0.05);

            if (camera.position.distanceTo(targetCameraPos) < 0.5) {
                isTransitioning = false;
                targetCameraPos = null;
            }
        }
        controls.update();
    }
    // renderer.render(scene, camera); // 使用 composer 替代
    composer.render();
    labelRenderer.render(scene, camera);
}

animate();

// --- UI & Events ---

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const infoPanel = document.getElementById('info-panel');
const infoTitle = document.getElementById('info-title');
const infoDesc = document.getElementById('info-desc');
const closeBtn = document.getElementById('info-close');
const toggleBtn = document.getElementById('toggle-orbit');
const backBtn = document.getElementById('back-btn');
const audioBtn = document.getElementById('audio-btn');
const nameBtn = document.getElementById('name-btn');

audioBtn.addEventListener('click', () => {
    AudioMgr.toggleAudio(audioBtn);
});

function toggleName() {
    isNameVisible = !isNameVisible;
    if (isNameVisible) {
        nameBtn.innerHTML = '<span class="icon">👁</span> NAME: ON';
        nameBtn.classList.add('active');
    } else {
        nameBtn.innerHTML = '<span class="icon">👁</span> NAME: OFF';
        nameBtn.classList.remove('active');
    }
}
nameBtn.addEventListener('click', toggleName);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight); // 更新 composer 尺寸
    labelRenderer.setSize(window.innerWidth, window.innerHeight);

    INITIAL_CAM_POS = getInitialCameraPosition();

    if (infoPanel.classList.contains('hidden') && !isTransitioning) {
        camera.position.copy(INITIAL_CAM_POS);
    }
});

// 创建提示框元素
const tooltip = document.createElement('div');
tooltip.style.position = 'absolute';
tooltip.style.color = '#fff';
tooltip.style.textShadow = '0 0 4px #000'; // 增加阴影以保证在亮背景下可见
tooltip.style.padding = '4px 8px';
tooltip.style.fontSize = '12px';
tooltip.style.pointerEvents = 'none';
tooltip.style.opacity = '0'; // 初始隐藏
tooltip.style.transition = 'opacity 0.5s'; // 渐变效果
tooltip.style.zIndex = '9999';
tooltip.style.whiteSpace = 'nowrap';
document.body.appendChild(tooltip);

let hoverTimer = null;
let hideTimer = null;
let activeBelt = null;

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // 构建可交互对象列表 (与 pointerdown 保持一致)
    const interactables = [...planetMeshes.map(p => p.mesh), sun];
    if (window.earthMoonMesh) interactables.push(window.earthMoonMesh);
    if (asteroidBelt) interactables.push(asteroidBelt.hitbox);
    if (kuiperBelt) interactables.push(kuiperBelt.hitbox);
    if (cometObj && cometObj.hitbox) interactables.push(cometObj.hitbox);

    const intersects = raycaster.intersectObjects(interactables, true);
    const validIntersects = intersects.filter(hit => hit.object.type === 'Mesh');

    let isHoveringBelt = false;

    if (validIntersects.length > 0) {
        document.body.style.cursor = 'pointer';
        const target = validIntersects[0].object;

        // 针对小行星带和柯伊伯带显示双击提示
        if ((asteroidBelt && target === asteroidBelt.hitbox) ||
            (kuiperBelt && target === kuiperBelt.hitbox)) {
            isHoveringBelt = true;
            // 持续更新位置
            tooltip.style.left = (event.clientX + 15) + 'px';
            tooltip.style.top = (event.clientY + 15) + 'px';
        }
    } else {
        document.body.style.cursor = 'default';
    }

    // 处理提示框状态机
    if (isHoveringBelt) {
        if (!activeBelt) {
            // 刚进入区域
            activeBelt = true;
            // 延迟 0.5 秒显示
            hoverTimer = setTimeout(() => {
                tooltip.textContent = '双击查看 (Double click)';
                tooltip.style.opacity = '1'; // 渐显

                // 显示 0.5 秒后渐隐
                hideTimer = setTimeout(() => {
                    tooltip.style.opacity = '0'; // 渐隐
                }, 1000); // 0.5s (transition) + 0.5s (visible)
            }, 500);
        }
    } else {
        if (activeBelt) {
            // 离开区域
            activeBelt = false;
            clearTimeout(hoverTimer);
            clearTimeout(hideTimer);
            tooltip.style.opacity = '0'; // 立即隐藏
        }
    }
});

function showInfo(info, targetPos, offset) {
    const updateContent = () => {
        infoTitle.textContent = info.name;
        let html = `<div class="info-grid">`;
        if (info.type) html += `<div class="info-row"><span class="info-label">类型 Type</span><span class="info-value">${info.type}</span></div>`;
        if (info.data) {
            info.data.forEach(item => {
                html += `<div class="info-row"><span class="info-label">${item.label}</span><span class="info-value">${item.value}</span></div>`;
            });
        }
        html += `</div><p class="info-text">${info.desc}</p>`;
        infoDesc.innerHTML = html;
    };

    if (infoPanel.classList.contains('hidden')) {
        updateContent();
        infoPanel.classList.remove('hidden');
        backBtn.classList.remove('hidden');
    } else {
        const elements = [infoTitle, infoDesc];
        elements.forEach(el => el.classList.add('content-fading-out'));

        setTimeout(() => {
            updateContent();
            elements.forEach(el => {
                el.classList.remove('content-fading-out');
                el.classList.add('content-fading-in');
            });
            void infoTitle.offsetHeight;
            elements.forEach(el => el.classList.remove('content-fading-in'));
        }, 300);
    }

    targetLookAt = targetPos.clone();

    const isMobile = window.innerWidth < 768;
    let finalOffset;

    if (isMobile) {
        finalOffset = new THREE.Vector3(0, 25, 35);
    } else {
        finalOffset = offset || new THREE.Vector3(12, 6, 12);
    }

    targetCameraPos = targetPos.clone().add(finalOffset);
    isTransitioning = true;

    isAutoRotating = false;
    toggleBtn.textContent = "继续公转 RESUME";

    if (info.audioPitch) {
        AudioMgr.setAudioEffect(info.audioPitch, info.audioFilter || 200);
    }
}

window.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // 构建可交互对象列表
    const interactables = [...planetMeshes.map(p => p.mesh), sun];
    if (window.earthMoonMesh) interactables.push(window.earthMoonMesh);
    // 添加小行星带 Hitbox
    if (asteroidBelt) interactables.push(asteroidBelt.hitbox);
    if (kuiperBelt) interactables.push(kuiperBelt.hitbox);
    // 添加哈雷彗星 Hitbox
    if (cometObj && cometObj.hitbox) interactables.push(cometObj.hitbox);

    const intersects = raycaster.intersectObjects(interactables, true);
    const validIntersects = intersects.filter(hit => hit.object.type === 'Mesh');

    if (validIntersects.length > 0) {
        let targetMesh = validIntersects[0].object;

        if (targetMesh === sun) {
            const isMobile = window.innerWidth < 768;
            const sunOffset = isMobile ? new THREE.Vector3(0, 50, 70) : new THREE.Vector3(0, 20, 40);
            showInfo(planetInfo['Sun'], new THREE.Vector3(0,0,0), sunOffset);
            return;
        }

        // 检测哈雷彗星点击
        if (cometObj && targetMesh === cometObj.hitbox) {
            const worldPos = new THREE.Vector3();
            targetMesh.getWorldPosition(worldPos);
            showInfo(halleyInfo, worldPos, new THREE.Vector3(5, 2, 5));
            return;
        }

        // 检测月球点击
        if (window.earthMoonMesh && targetMesh === window.earthMoonMesh) {
            const worldPos = new THREE.Vector3();
            targetMesh.getWorldPosition(worldPos);
            // 月球比较小，相机需要拉近一点
            showInfo(planetInfo['Moon'], worldPos, new THREE.Vector3(3, 1.5, 3));
            return;
        }

        let planetObj = planetMeshes.find(p => p.mesh === targetMesh);
        if (!planetObj && targetMesh.parent) {
             planetObj = planetMeshes.find(p => p.mesh === targetMesh.parent);
        }

        if (planetObj) {
            const worldPos = new THREE.Vector3();
            planetObj.mesh.getWorldPosition(worldPos);
            showInfo(planetInfo[planetObj.data.name], worldPos, new THREE.Vector3(12, 6, 12));
        }
    }
});

// 双击事件：专门用于处理范围较大的小行星带和柯伊伯带，防止误触
window.addEventListener('dblclick', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const interactables = [];
    if (asteroidBelt) interactables.push(asteroidBelt.hitbox);
    if (kuiperBelt) interactables.push(kuiperBelt.hitbox);

    const intersects = raycaster.intersectObjects(interactables, true);

    if (intersects.length > 0) {
        const targetMesh = intersects[0].object;

        if (targetMesh === asteroidBelt.hitbox) {
            showInfo(planetInfo['AsteroidBelt'], new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 60, 80));
        } else if (targetMesh === kuiperBelt.hitbox) {
            showInfo(planetInfo['KuiperBelt'], new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 100, 200));
        }
    }
});

backBtn.addEventListener('click', () => {
    targetCameraPos = INITIAL_CAM_POS.clone();
    targetLookAt = new THREE.Vector3(0, 0, 0);
    isTransitioning = true;

    infoPanel.classList.add('hidden');
    backBtn.classList.add('hidden');

    AudioMgr.setAudioEffect(1.0, 150);

    // 恢复公转
    isAutoRotating = true;
    toggleBtn.textContent = '暂停公转 PAUSE';
});

closeBtn.addEventListener('click', () => {
    infoPanel.classList.add('hidden');
});

toggleBtn.addEventListener('click', () => {
    isAutoRotating = !isAutoRotating;
    toggleBtn.textContent = isAutoRotating ? '暂停公转 PAUSE' : '继续公转 RESUME';
});