import * as THREE from 'three';

// 月球配置参数
const MOON_CONFIG = {
    radius: 0.6,       // 地球半径(2.2) * 0.27 ≈ 0.6
    distance: 6,       // 距离地球的距离 (为了视觉效果，设为半径的10倍左右)
    color: 0xdddddd,   // 灰白色

    // 运动参数 (基于当前比例系统)
    // 公转: 参考 orbit.js (30s = 1年) -> 27.32/365.25 * 30 ≈ 2.244s
    orbitalPeriod: 2.244,

    // 自转: 参考 physics.js (30s = 1天) -> 27.32 * 30 = 819.6s
    rotationPeriod: 819.6
};

// 计算角速度 (弧度/秒)
const orbitalSpeed = (2 * Math.PI) / MOON_CONFIG.orbitalPeriod;
const rotationSpeed = (2 * Math.PI) / MOON_CONFIG.rotationPeriod;

// 生成简单的月球纹理 (陨石坑风格)
function createMoonTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // 背景灰
    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(0, 0, size, size);

    // 随机陨石坑
    for (let i = 0; i < 400; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = Math.random() * 10 + 2;

        // 坑的阴影
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.3})`;
        ctx.fill();

        // 坑的亮部 (简单的立体感)
        ctx.beginPath();
        ctx.arc(x - r*0.2, y - r*0.2, r * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.1})`;
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

let moonMesh = null;
let moonPivot = null;
let moonAngle = 0;

/**
 * 创建月球并添加到地球 Mesh 中
 * @param {THREE.Mesh} earthMesh - 地球的网格对象
 */
export function createMoon(earthMesh) {
    // 1. 创建月球枢纽 (Pivot)
    // 这个枢纽将添加到地球上，用于控制月球的公转位置
    moonPivot = new THREE.Group();
    earthMesh.add(moonPivot);

    // 2. 创建月球本体
    const geometry = new THREE.SphereGeometry(MOON_CONFIG.radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        map: createMoonTexture(),
        color: MOON_CONFIG.color,
        roughness: 0.9,
        metalness: 0.0
    });

    moonMesh = new THREE.Mesh(geometry, material);

    // 设置月球相对于地球的位置
    moonMesh.position.set(MOON_CONFIG.distance, 0, 0);

    // 开启阴影
    moonMesh.castShadow = true;
    moonMesh.receiveShadow = true;

    moonPivot.add(moonMesh);

    return moonMesh;
}

/**
 * 更新月球运动
 * @param {number} deltaTime - 时间差(秒)
 * @param {number} earthRotationSpeed - 地球当前的自转速度(弧度/秒)
 */
export function updateMoon(deltaTime, earthRotationSpeed) {
    if (!moonPivot || !moonMesh) return;

    // 1. 公转逻辑
    // 因为 moonPivot 是地球的子物体，它默认会跟着地球自转。
    // 为了实现独立的公转速度，我们需要：
    // 实际旋转 = (目标公转速度 - 地球自转速度) * dt
    // 这样抵消掉地球的带动，实现精确的公转周期。

    // 注意：这里简化处理，直接在 Pivot 上叠加旋转。
    // 如果 Pivot 跟着地球转，那它的角速度就是 earthRotationSpeed。
    // 我们希望它的绝对角速度是 orbitalSpeed。
    // 所以相对于父级(地球)，它的旋转速度应该是 orbitalSpeed - earthRotationSpeed。

    const relativeSpeed = orbitalSpeed - earthRotationSpeed;
    moonPivot.rotation.y += relativeSpeed * deltaTime;

    // 2. 自转逻辑
    moonMesh.rotation.y += rotationSpeed * deltaTime;
}
