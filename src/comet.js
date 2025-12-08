import * as THREE from 'three';

// 哈雷彗星配置 (为了视觉效果进行了调整，非真实比例)
const COMET_CONFIG = {
    name: 'Halley',
    radius: 0.4,        // 彗核半径
    color: 0x88ccff,    // 彗星偏蓝白

    // 轨道参数 (基于当前场景非线性比例严格换算)
    // 场景参考: Mercury(0.4AU)=22, Venus(0.7AU)=32, Neptune(30AU)=150, Pluto(39AU)=170
    // 哈雷真实数据: Perihelion=0.59AU, Aphelion=35.1AU
    perihelion: 28,     // 0.59 AU -> 介于水星(22)和金星(32)之间
    aphelion: 161,      // 35.1 AU -> 介于海王星(150)和冥王星(170)之间
    inclination: 162.3 * (Math.PI / 180), // 严格轨道倾角 162.3°
    orbitalPeriod: 60, // 保持用户设定的 60s (真实比例应为 2280s)

    tailLengthMax: 45,  // 彗尾最大长度 (约 1 AU = 45 单位)
    tailColor: 0xaaddff // 彗尾颜色
};

// 导出哈雷彗星的详细信息
export const halleyInfo = {
    name: '哈雷彗星 HALLEY',
    type: '短周期彗星 / Short-period Comet',
    data: [
        { label: '核心直径 Diameter', value: '11 km' },
        { label: '公转周期 Period', value: '75-76 Years' },
        { label: '近日点 Perihelion', value: '0.59 AU' },
        { label: '远日点 Aphelion', value: '35.1 AU' },
        { label: '轨道倾角 Inclination', value: '162.3° (Retrograde)' },
        { label: '下次回归 Next', value: '2061' }
    ],
    desc: '最著名的短周期彗星，每 75-76 年回归一次。它是唯一能用肉眼直接看到的短周期彗星，也是人一生中可能看到两次的彗星。<br><br>Halley\'s Comet or Comet Halley, officially designated 1P/Halley, is a short-period comet visible from Earth every 75–76 years.',
    audioPitch: 2.5,
    audioFilter: 900
};

// 计算轨道几何参数
const a = (COMET_CONFIG.perihelion + COMET_CONFIG.aphelion) / 2; // 半长轴
const c = a - COMET_CONFIG.perihelion; // 半焦距
const e = c / a; // 偏心率
const b = a * Math.sqrt(1 - e * e); // 半短轴

// 轨道计算辅助变量
const orbitalSpeed = (2 * Math.PI) / COMET_CONFIG.orbitalPeriod;

let cometMesh = null;
let nucleusMesh = null;
let comaMesh = null;
let tailMesh = null;
let orbitLine = null;

// --- Shaders for HDR Glow ---

const comaVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const comaFragmentShader = `
uniform sampler2D map;
uniform vec3 color;
uniform float opacity;
varying vec2 vUv;
void main() {
    vec4 texColor = texture2D(map, vUv);
    // 增强亮度 (HDR)
    gl_FragColor = vec4(color * 4.0, opacity) * texColor;
}
`;

const tailVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const tailFragmentShader = `
uniform sampler2D map;
uniform vec3 color;
uniform float opacity;
varying vec2 vUv;
void main() {
    vec4 texColor = texture2D(map, vUv);
    // 增强亮度 (HDR)
    gl_FragColor = vec4(color * 3.0, opacity) * texColor;
}
`;

/**
 * 创建彗星纹理
 */
function createCometTexture() {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // 径向渐变，模拟发光核心
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(200, 220, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(100, 150, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    return new THREE.CanvasTexture(canvas);
}

/**
 * 创建彗尾纹理
 */
function createTailTexture() {
    const width = 64;
    const height = 256;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 线性渐变，模拟拖尾
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(200, 230, 255, 0.8)'); // 靠近头部
    gradient.addColorStop(0.4, 'rgba(100, 180, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 0, 50, 0)');       // 尾部消失

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    return new THREE.CanvasTexture(canvas);
}

/**
 * 创建彗星及其轨道
 * @param {THREE.Scene} scene
 */
export function createComet(scene) {
    const group = new THREE.Group();

    // 1. 彗核 (Nucleus) - 实体岩石
    const nucleusGeo = new THREE.SphereGeometry(COMET_CONFIG.radius, 16, 16);
    const nucleusMat = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.9,
        metalness: 0.1
    });
    nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    group.add(nucleusMesh);

    // 2. 彗发 (Coma) - 发光气体包围
    // 使用 Mesh + ShaderMaterial 实现 HDR 辉光
    const comaGeo = new THREE.PlaneGeometry(1, 1);
    const comaMat = new THREE.ShaderMaterial({
        uniforms: {
            map: { value: createCometTexture() },
            color: { value: new THREE.Color(COMET_CONFIG.color) },
            opacity: { value: 0.8 }
        },
        vertexShader: comaVertexShader,
        fragmentShader: comaFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });
    comaMesh = new THREE.Mesh(comaGeo, comaMat);
    comaMesh.scale.set(COMET_CONFIG.radius * 8, COMET_CONFIG.radius * 8, 1); // 稍微放大一点
    nucleusMesh.add(comaMesh);

    // 3. 彗尾 (Tail) - 总是背向太阳
    // 使用圆锥体或平面模拟，这里用平面保持始终面向摄像机比较复杂，
    // 简单起见用一个十字交叉的平面或者圆锥。这里用圆锥模拟体积感。
    const tailGeo = new THREE.ConeGeometry(COMET_CONFIG.radius * 2, 1, 32, 1, true); // 高度设为1，后续动态缩放
    // 旋转几何体，使得圆锥尖端指向原点(0,0,0)，底面朝外
    tailGeo.translate(0, -0.5, 0);
    tailGeo.rotateX(-Math.PI / 2); // 此时Z轴负方向是尾巴延伸方向

    const tailMat = new THREE.ShaderMaterial({
        uniforms: {
            map: { value: createTailTexture() },
            color: { value: new THREE.Color(COMET_CONFIG.tailColor) },
            opacity: { value: 0.6 }
        },
        vertexShader: tailVertexShader,
        fragmentShader: tailFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
    });
    tailMesh = new THREE.Mesh(tailGeo, tailMat);
    nucleusMesh.add(tailMesh);

    // 4. 绘制轨道线 (Visual Orbit)
    const points = [];
    const segments = 200;
    for (let i = 0; i <= segments; i++) {
        const E = (i / segments) * 2 * Math.PI;

        // 计算轨道平面坐标 (与 updateComet 保持一致)
        const x_orbit = a * Math.cos(E) - c;
        const z_orbit = b * Math.sin(E);
        const pos = new THREE.Vector3(x_orbit, 0, z_orbit);

        // 旋转轨道平面 (仅绕 X 轴旋转倾角)
        pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), COMET_CONFIG.inclination);

        points.push(pos);
    }

    const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMat = new THREE.LineBasicMaterial({ color: 0x446688, opacity: 0.3, transparent: true });
    orbitLine = new THREE.Line(orbitGeo, orbitMat);
    scene.add(orbitLine);

    cometMesh = group;

    // 添加一个不可见的 Hitbox 用于点击检测 (因为彗核太小)
    const hitboxGeo = new THREE.SphereGeometry(COMET_CONFIG.radius * 4, 8, 8);
    const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    // 将 hitbox 添加到 nucleusMesh 而不是 group，这样它会跟随彗核移动
    nucleusMesh.add(hitbox);

    // 将 hitbox 暴露给外部，或者直接把 cometMesh 作为交互对象
    // 为了方便 script.js 识别，我们把 hitbox 挂在 cometMesh.userData 上
    cometMesh.userData.isComet = true;
    cometMesh.userData.hitbox = hitbox;

    scene.add(cometMesh);

    return { mesh: cometMesh, orbit: orbitLine, hitbox: hitbox };
}

/**
 * 更新彗星位置和状态
 * @param {number} time 全局时间 (秒)
 * @param {THREE.Camera} camera 相机对象 (用于 Billboard)
 */
export function updateComet(time, camera) {
    if (!nucleusMesh || !tailMesh) return;

    // 1. 计算平近点角 Mean Anomaly (M)
    // M = M0 + n * t
    // 2025年位置校准:
    // 上次近日点: 1986年, 周期: 76年
    // 当前: 2025年 -> 经过了 39 年
    // 进度: 39 / 76 ≈ 0.513 (刚刚过了远日点，位于最远端附近)
    const startOffset = COMET_CONFIG.orbitalPeriod * (39 / 76);
    const M = (orbitalSpeed * (time + startOffset)) % (2 * Math.PI);

    // 2. 求解偏近点角 Eccentric Anomaly (E)
    // Kepler方程: M = E - e sin E
    // 使用牛顿迭代法求解
    let E = M;
    for (let i = 0; i < 5; i++) {
        E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    }

    // 3. 计算轨道平面坐标
    const x_orbit = a * Math.cos(E) - c;
    const z_orbit = b * Math.sin(E);

    // 4. 转换到 3D 空间 (应用倾角)
    const pos = new THREE.Vector3(x_orbit, 0, z_orbit);
    pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), COMET_CONFIG.inclination);

    // 更新位置
    nucleusMesh.position.copy(pos);

    // 5. 更新彗尾
    // 彗尾方向：从太阳(0,0,0) 指向 彗星(pos) 的方向延伸出去
    // 也就是 pos 向量的方向。
    // 计算距离
    const dist = pos.length();

    // 彗尾长度：距离太阳越近，受太阳风影响越大，尾巴越长（视觉上通常这样处理，或者越亮）
    // 真实物理：越近越活跃。
    // 简单模拟：长度与距离成反比，或者在近日点附近达到最大。
    // 设定一个范围：近日点(15) -> 长度Max(40), 远日点(190) -> 长度Min(5)
    const lengthFactor = 1 - (dist - COMET_CONFIG.perihelion) / (COMET_CONFIG.aphelion - COMET_CONFIG.perihelion);
    const tailLen = 5 + lengthFactor * COMET_CONFIG.tailLengthMax;

    // 缩放尾巴 (Z轴是我们在 Geometry 中定义的长度方向)
    tailMesh.scale.set(1, 1, tailLen);

    // 旋转尾巴：使其指向背离太阳的方向
    // 当前位置 pos 就是从太阳指向彗星的向量。
    // 我们希望尾巴沿着 pos 方向延伸。
    // lookAt 会让对象的 +Z 轴指向目标。
    // 我们的圆锥体已经调整为：尖端在原点，底面在 -Z (local) 还是 +Z?
    // 在 createComet 中: tailGeo.rotateX(-Math.PI / 2);
    // 原始 Cone: 尖端在Y+, 底面Y-. rotateX(-90deg) -> 尖端在Z+, 底面Z-.
    // translate(0, -0.5, 0) -> 这一步是在 rotate 之前做的。
    // 让我们重新理一下 Geometry 变换：
    // 1. Cone: H=1. Center=(0,0,0). Top=(0,0.5,0), Bottom=(0,-0.5,0).
    // 2. Translate(0, 0.5, 0) -> Top=(0,1,0), Bottom=(0,0,0). (尖端远离原点? 不，我们要尖端在彗核)
    //    我们希望尖端在 (0,0,0), 尾巴延伸向远方。
    //    所以我们要把 Top 放在 (0,0,0).
    //    原始 Top 在 y=0.5. 所以 translate(0, -0.5, 0). 此时 Top=(0,0,0), Bottom=(0,-1,0).
    // 3. RotateX(-90) -> Y轴变Z轴. Top=(0,0,0). Bottom=(0,0,1). (Z+ 方向)
    //    这意味着尾巴沿着 Z轴正向 延伸。

    // 此时，如果我们在 nucleusMesh (位于 pos) 上执行 lookAt.
    // nucleusMesh.lookAt(target). Z轴指向 target.
    // 我们希望尾巴(Z+) 指向 背离太阳的方向。
    // 太阳在 (0,0,0). 彗星在 pos. 背离方向是 pos + pos.
    // 也就是从原点出发，穿过彗星，继续向外。
    // 相对彗星坐标系，方向是 (pos - 0).
    // 所以我们让 tailMesh lookAt (pos + pos) ?
    // 不，tailMesh 是 nucleusMesh 的子物体。
    // nucleusMesh 只有位移，没有旋转（或者我们不改变它的旋转）。
    // 我们可以只旋转 tailMesh。

    // 计算世界坐标系下的背离向量
    const awayDir = pos.clone().normalize(); // 指向外

    // 将 tailMesh 定向到 awayDir
    // 由于 tailMesh 是子物体，我们需要小心父物体的旋转。
    // 简单做法：nucleusMesh 不旋转。
    // tailMesh.lookAt( nucleusMesh.position.clone().add(awayDir) );
    // 这样 tailMesh 的 +Z 轴会指向 awayDir。
    // 我们的 Geometry 是沿着 +Z 延伸的。完美。

    // 注意：lookAt 需要世界坐标。
    const target = nucleusMesh.position.clone().add(awayDir);
    tailMesh.lookAt(target);

    // 彗发总是朝向相机 (Billboard)
    if (comaMesh && camera) {
        comaMesh.lookAt(camera.position);
    }
}
