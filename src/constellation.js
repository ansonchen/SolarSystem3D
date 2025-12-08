import * as THREE from 'three';

/**
 * 星座管理器
 * 负责渲染真实星座的恒星粒子和连线
 */

// 天球半径 (足够大以作为背景)
const RADIUS = 4500;

// 辅助函数：将赤经(RA)和赤纬(Dec)转换为3D坐标
// RA: 小时 (0-24), Dec: 度 (-90 to 90)
function getStarPosition(ra, dec) {
    const phi = (90 - dec) * (Math.PI / 180); // 极角 (0 at North Pole)
    const theta = (ra / 24) * (Math.PI * 2);  // 方位角

    // Three.js 坐标系: Y is Up
    const x = RADIUS * Math.sin(phi) * Math.cos(theta);
    const y = RADIUS * Math.cos(phi);
    const z = RADIUS * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}

// 星座数据 (名称, 连线逻辑, 星星列表[RA, Dec, 亮度大小])
const constellationsData = [
    {
        name: "Orion (猎户座)",
        stars: [
            [5.91, 7.4, 1.5],   // Betelgeuse (参宿四)
            [5.24, 6.3, 1.2],   // Bellatrix (参宿五)
            [5.60, -1.2, 1.0],  // Alnitak (参宿一)
            [5.60, -1.9, 1.0],  // Alnilam (参宿二)
            [5.53, -2.6, 1.0],  // Mintaka (参宿三)
            [5.79, -9.6, 1.2],  // Saiph (参宿六)
            [5.24, -8.2, 1.5]   // Rigel (参宿七)
        ],
        lines: [[0,2], [1,2], [2,3], [3,4], [2,5], [4,6], [3,5], [3,6]] // 简化连线
    },
    {
        name: "Ursa Major (北斗七星/大熊座)",
        stars: [
            [11.06, 61.7, 1.2], // Dubhe (天枢)
            [11.03, 56.3, 1.1], // Merak (天璇)
            [11.89, 53.6, 1.1], // Phecda (天玑)
            [12.25, 57.0, 1.0], // Megrez (天权)
            [12.90, 55.9, 1.2], // Alioth (玉衡)
            [13.39, 54.9, 1.1], // Mizar (开阳)
            [13.79, 49.3, 1.3]  // Alkaid (摇光)
        ],
        lines: [[0,1], [1,2], [2,3], [3,4], [4,5], [5,6], [0,3]] // 斗勺形状
    },
    {
        name: "Cassiopeia (仙后座)",
        stars: [
            [0.15, 59.1, 1.1], // Caph
            [0.67, 56.5, 1.1], // Schedar
            [0.94, 60.7, 1.2], // Cih
            [1.42, 60.2, 1.0], // Ruchbah
            [1.90, 63.6, 1.0]  // Segin
        ],
        lines: [[0,1], [1,2], [2,3], [3,4]] // W 形状
    },
    {
        name: "Scorpius (天蝎座)",
        stars: [
            [16.48, -26.4, 1.5], // Antares (心宿二)
            [16.00, -19.8, 1.1], // Graffias
            [15.97, -26.1, 1.0], // Dschubba
            [16.35, -26.5, 1.0], // Wei
            [16.83, -30.5, 1.0], // Epsilon
            [16.85, -34.3, 1.0], // Mu
            [16.90, -38.0, 1.0], // Zeta
            [17.20, -43.0, 1.1], // Eta
            [17.61, -37.1, 1.2], // Sargas
            [17.56, -37.3, 1.3]  // Shaula
        ],
        lines: [[0,2], [2,1], [0,3], [0,4], [4,5], [5,6], [6,7], [7,8], [8,9]]
    },
    {
        name: "Crux (南十字座)",
        stars: [
            [12.44, -63.1, 1.3], // Acrux
            [12.79, -59.6, 1.2], // Mimosa
            [12.51, -57.1, 1.5], // Gacrux
            [12.25, -58.7, 1.0]  // Delta
        ],
        lines: [[0,2], [1,3]] // 十字形状
    },
    {
        name: "Cygnus (天鹅座)",
        stars: [
            [20.69, 45.2, 1.4], // Deneb (天津四)
            [20.38, 40.2, 1.1], // Sadr
            [19.51, 27.9, 1.1], // Albireo
            [20.77, 33.9, 1.0], // Epsilon
            [19.76, 45.1, 1.0]  // Delta
        ],
        lines: [[0,1], [1,2], [1,3], [1,4]] // 十字/天鹅形状
    },
    {
        name: "Leo (狮子座)",
        stars: [
            [10.14, 11.9, 1.4], // Regulus (轩辕十四)
            [11.82, 14.6, 1.1], // Denebola (五帝座一)
            [10.33, 19.8, 1.2], // Algieba
            [11.23, 20.5, 1.1], // Zosma
            [10.11, 23.4, 1.0], // Adhafera
            [9.76, 23.8, 1.0]   // Rasalas
        ],
        lines: [[0,2], [2,4], [4,5], [2,3], [3,1], [0,2]] // 镰刀+三角形
    },
    {
        name: "Gemini (双子座)",
        stars: [
            [7.58, 31.9, 1.3], // Castor (北河二)
            [7.74, 28.0, 1.4], // Pollux (北河三)
            [6.62, 16.4, 1.2], // Alhena
            [7.34, 21.9, 1.0], // Wasat
            [7.07, 20.6, 1.0]  // Mebsuta
        ],
        lines: [[0,4], [4,2], [1,3], [3,2]] // 两个小人
    },
    {
        name: "Taurus (金牛座)",
        stars: [
            [4.60, 16.5, 1.5], // Aldebaran (毕宿五)
            [5.43, 21.1, 1.2], // Elnath
            [3.79, 24.1, 1.2], // Alcyone (昴宿六)
            [4.47, 15.6, 1.0], // Gamma
            [4.33, 15.9, 1.0]  // Delta
        ],
        lines: [[0,3], [3,4], [0,2], [1,4]] // V字脸+角
    },
    {
        name: "Canis Major (大犬座)",
        stars: [
            [6.75, -16.7, 2.0], // Sirius (天狼星 - 最亮!)
            [6.97, -28.9, 1.2], // Adhara
            [7.14, -26.4, 1.2], // Wezen
            [6.38, -17.9, 1.1], // Mirzam
            [7.58, -29.3, 1.1]  // Aludra
        ],
        lines: [[0,3], [0,2], [2,1], [2,4]] // 狗的形状
    },
    {
        name: "Lyra (天琴座)",
        stars: [
            [18.62, 38.8, 1.5], // Vega (织女星)
            [18.83, 33.0, 1.0], // Sulafat
            [18.92, 32.7, 1.0], // Sheliak
            [18.74, 36.9, 1.0]  // Epsilon
        ],
        lines: [[0,3], [3,2], [2,1], [1,0]] // 小平行四边形+织女
    },
    {
        name: "Aquila (天鹰座)",
        stars: [
            [19.85, 8.9, 1.4],  // Altair (牛郎星)
            [19.77, 10.6, 1.1], // Tarazed
            [19.91, 6.4, 1.1],  // Alshain
            [19.10, 13.8, 1.0], // Zeta
            [19.41, 3.1, 1.0]   // Delta
        ],
        lines: [[0,1], [0,2], [0,3], [0,4]] // 展翅
    },
    {
        name: "Pegasus (飞马座)",
        stars: [
            [23.08, 15.2, 1.2], // Markab
            [23.06, 28.1, 1.2], // Scheat
            [0.14, 29.1, 1.2],  // Alpheratz (仙女座α，共用)
            [0.22, 15.2, 1.2],  // Algenib
            [21.74, 9.9, 1.1]   // Enif
        ],
        lines: [[0,1], [1,2], [2,3], [3,0], [0,4]] // 秋季四边形+马头
    },
    {
        name: "Andromeda (仙女座)",
        stars: [
            [0.14, 29.1, 1.2],  // Alpheratz (连接飞马座)
            [1.16, 35.6, 1.1],  // Mirach
            [2.06, 42.3, 1.2]   // Almach
        ],
        lines: [[0,1], [1,2]] // 长链
    }
];

// Vertex Shader
const starVertexShader = `
    uniform float time;
    attribute float size;
    attribute float blinkOffset;
    varying vec3 vColor;
    void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

        // 闪烁逻辑：正弦波控制大小和透明度
        // 速度较慢 (time * 1.5)，相位随机 (blinkOffset)
        float twinkle = 0.8 + 0.4 * sin(time * 1.5 + blinkOffset);

        gl_PointSize = size * twinkle * (3000.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
    }
`;

// Fragment Shader
const starFragmentShader = `
    uniform sampler2D pointTexture;
    varying vec3 vColor;
    void main() {
        vec4 texColor = texture2D(pointTexture, gl_PointCoord);
        if (texColor.a < 0.05) discard;

        // 颜色叠加，乘以 3.0 以触发 Bloom (HDR)
        gl_FragColor = vec4(vColor * 3.0, 1.0) * texColor;
    }
`;

export function createConstellations(scene) {
    const starPositions = [];
    const starColors = [];
    const starSizes = [];
    const blinkOffsets = []; // 新增：闪烁相位

    const linePositions = [];

    const group = new THREE.Group();

    const baseColor = new THREE.Color(0xffffff);
    const highlightColor = new THREE.Color(0xaaddff);

    constellationsData.forEach(constellation => {
        const cStars = constellation.stars.map(s => {
            const pos = getStarPosition(s[0], s[1]);

            starPositions.push(pos.x, pos.y, pos.z);

            const color = Math.random() > 0.5 ? baseColor : highlightColor;
            starColors.push(color.r, color.g, color.b);

            // 调整大小为 20
            starSizes.push(s[2] * 20.0);

            // 随机闪烁相位
            blinkOffsets.push(Math.random() * Math.PI * 2);

            return pos;
        });

        if (constellation.lines) {
            constellation.lines.forEach(pair => {
                const p1 = cStars[pair[0]];
                const p2 = cStars[pair[1]];
                linePositions.push(p1.x, p1.y, p1.z);
                linePositions.push(p2.x, p2.y, p2.z);
            });
        }
    });

    // 1. 创建星星粒子
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    starGeo.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));
    starGeo.setAttribute('blinkOffset', new THREE.Float32BufferAttribute(blinkOffsets, 1));

    // 使用 ShaderMaterial
    const starUniforms = {
        time: { value: 0 },
        pointTexture: { value: createStarTexture() }
    };

    const starMat = new THREE.ShaderMaterial({
        uniforms: starUniforms,
        vertexShader: starVertexShader,
        fragmentShader: starFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });

    const stars = new THREE.Points(starGeo, starMat);
    group.add(stars);

    // 2. 创建连线 (保持不变)
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

    const lineMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const lines = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lines);

    // 3. 背景星 (保持不变)
    const bgStarGeo = new THREE.BufferGeometry();
    const bgStarPos = [];
    for(let i=0; i<1500; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const r = RADIUS * (0.9 + Math.random() * 0.2);
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        bgStarPos.push(x, y, z);
    }
    bgStarGeo.setAttribute('position', new THREE.Float32BufferAttribute(bgStarPos, 3));
    const bgStarMat = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 10,
        transparent: true,
        opacity: 0.5,
        sizeAttenuation: true
    });
    const bgStars = new THREE.Points(bgStarGeo, bgStarMat);
    group.add(bgStars);

    scene.add(group);

    // 返回更新函数
    return {
        update: (deltaTime) => {
            starUniforms.time.value += deltaTime;
        }
    };
}

// 生成圆形发光贴图
function createStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64; // 提高分辨率 (原32)
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');     // 核心纯白
    grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.9)'); // 高光区域扩大
    grad.addColorStop(0.5, 'rgba(220, 240, 255, 0.4)'); // 外围光晕
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    return new THREE.CanvasTexture(canvas);
}
