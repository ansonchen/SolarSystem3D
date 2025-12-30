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

const lunarMansionsData = [
    // --- 东方青龙 Azure Dragon of the East ---
    {
        name: "Jiao (角木蛟)",
        stars: [
            [13.42, -11.16, 1.3], // Spica (α Vir)
            [13.58, -0.60, 1.1]   // Heze (ζ Vir)
        ],
        lines: [[0, 1]],
        color: 0x99ff99
    },
    {
        name: "Kang (亢金龙)",
        stars: [
            [14.21, -10.27, 1.1], // κ Vir
            [14.27, -6.00, 1.0],  // ι Vir
            [14.47, -2.23, 1.0],  // φ Vir
            [14.32, -13.37, 1.0]  // λ Vir
        ],
        lines: [[3, 0], [0, 1], [1, 2]], // 弧形
        color: 0x99ff99
    },
    {
        name: "Di (氐土貉)",
        stars: [
            [14.85, -16.04, 1.2], // α2 Lib
            [15.20, -19.79, 1.1], // ι Lib
            [15.59, -14.79, 1.1], // γ Lib
            [15.28, -9.38, 1.1]   // β Lib
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 0]], // 四边形
        color: 0x99ff99
    },
    {
        name: "Fang (房日兔)",
        stars: [
            [15.98, -26.11, 1.1], // π Sco
            [15.95, -29.21, 1.1], // ρ Sco
            [16.01, -22.62, 1.1], // δ Sco
            [16.09, -19.80, 1.1]  // β Sco
        ],
        lines: [[1, 0], [0, 2], [2, 3]], // 一条线
        color: 0x99ff99
    },
    {
        name: "Xin (心月狐)",
        stars: [
            [16.35, -25.59, 1.2], // σ Sco
            [16.49, -26.43, 1.5], // α Sco (Antares)
            [16.60, -28.22, 1.1]  // τ Sco
        ],
        lines: [[0, 1], [1, 2]], // 心脏三星
        color: 0x99ff99
    },
    {
        name: "Wei (尾火虎)",
        stars: [
            [16.84, -34.29, 1.1], // ε Sco
            [16.88, -38.07, 1.1], // μ1 Sco
            [16.90, -42.36, 1.1], // ζ Sco
            [17.20, -43.24, 1.1], // η Sco
            [17.62, -43.00, 1.1], // θ Sco
            [17.79, -40.13, 1.1], // ι1 Sco
            [17.71, -39.03, 1.1], // κ Sco
            [17.56, -37.10, 1.1], // λ Sco
            [17.51, -37.30, 1.0]  // υ Sco
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8]], // 钩子
        color: 0x99ff99
    },
    {
        name: "Ji (箕水豹)",
        stars: [
            [18.11, -30.42, 1.1], // γ Sgr
            [18.35, -29.83, 1.1], // δ Sgr
            [18.40, -34.38, 1.1], // ε Sgr
            [18.29, -36.76, 1.1]  // η Sgr
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 0]], // 四边形
        color: 0x99ff99
    },

    // --- 北方玄武 Black Tortoise of the North ---
    {
        name: "Dou (斗木獬)",
        stars: [
            [18.76, -26.99, 1.1], // φ Sgr
            [18.47, -25.42, 1.1], // λ Sgr
            [18.23, -21.06, 1.1], // μ Sgr
            [18.92, -26.30, 1.1], // σ Sgr
            [19.12, -27.67, 1.1], // τ Sgr
            [19.04, -29.88, 1.1]  // ζ Sgr
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]], // 斗勺形状，闭合
        color: 0xccccff
    },
    {
        name: "Niu (牛金牛)",
        stars: [
            [20.35, -14.78, 1.1], // β Cap
            [20.30, -12.54, 1.1], // α2 Cap
            [20.21, -12.62, 1.0], // ξ2 Cap
            [20.46, -18.21, 1.0], // π Cap
            [20.45, -18.75, 1.0], // o Cap
            [20.48, -17.81, 1.0]  // ρ Cap
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]], // 六颗星构成牛角形状，闭合
        color: 0xccccff
    },
    {
        name: "Nu (女土蝠)",
        stars: [
            [20.80, -9.50, 1.0], // ε Aqr
            [20.88, -8.98, 1.0], // μ Aqr
            [20.86, -5.63, 1.0], // 4 Aqr
            [20.80, -5.03, 1.0]  // 3 Aqr
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 0]], // 四边形
        color: 0xccccff
    },
    {
        name: "Xu (虚日鼠)",
        stars: [
            [21.53, -5.57, 1.1], // β Aqr
            [21.26, +5.25, 1.1]  // α Equ
        ],
        lines: [[0, 1]], // 两星相连
        color: 0xccccff
    },
    {
        name: "Wei (危月燕)",
        stars: [
            [22.10, -0.32, 1.1], // α Aqr
            [22.17, +6.20, 1.1], // θ Peg
            [21.74, +9.88, 1.1]  // ε Peg
        ],
        lines: [[0, 1], [1, 2], [2, 0]], // 三角形，像屋顶
        color: 0xccccff
    },
    {
        name: "Shi (室火猪)",
        stars: [
            [23.08, +15.21, 1.2], // α Peg
            [23.06, +28.08, 1.2]  // β Peg
        ],
        lines: [[0, 1]], // 两星相连
        color: 0xccccff
    },
    {
        name: "Bi (壁水貐)",
        stars: [
            [0.22, +15.18, 1.2], // γ Peg
            [0.14, +29.09, 1.2]  // α And
        ],
        lines: [[0, 1]], // 两星相连
        color: 0xccccff
    },
    // --- 西方白虎 White Tiger of the West ---
    {
        name: "Kui (奎木狼)",
        stars: [
            [0.79, +24.27, 1.1], // ζ And
            [0.95, +23.42, 1.0], // η And
            [1.16, +35.62, 1.2], // β And
            [0.66, +30.86, 1.1], // δ And
            [0.64, +29.31, 1.0]  // ε And
        ],
        lines: [[0, 1], [1, 4], [4, 3], [3, 2]], // 形成一个不规则形状
        color: 0xffcccc
    },
    {
        name: "Lou (娄金狗)",
        stars: [
            [1.91, +20.81, 1.1], // β Ari
            [1.89, +19.29, 1.0], // γ Ari
            [2.12, +23.46, 1.1]  // α Ari
        ],
        lines: [[0, 1], [1, 2]], // 弧线
        color: 0xffcccc
    },
    {
        name: "Wei (胃土雉)",
        stars: [
            [2.72, +27.71, 1.1], // 35 Ari
            [2.80, +29.25, 1.0], // 39 Ari
            [2.83, +27.26, 1.0]  // 41 Ari
        ],
        lines: [[0, 1], [1, 2], [2, 0]], // 三角形
        color: 0xffcccc
    },
    {
        name: "Mao (昴日鸡)", // 昴星团 Pleiades
        stars: [
            [3.79, +24.11, 1.3], // Alcyone
            [3.82, +24.05, 1.2], // Atlas
            [3.75, +24.11, 1.1], // Electra
            [3.76, +24.37, 1.1], // Maia
            [3.77, +23.95, 1.1], // Merope
            [3.75, +24.47, 1.1], // Taygeta
            [3.82, +24.14, 1.0]  // Pleione
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]], // 形成星团紧密感
        color: 0xffcccc
    },
    {
        name: "Bi (毕月乌)", // 毕星团 Hyades
        stars: [
            [4.48, +19.18, 1.3], // ε Tau
            [4.38, +17.54, 1.1], // δ1 Tau
            [4.33, +15.63, 1.1], // γ Tau
            [4.60, +16.51, 1.4], // α Tau (Aldebaran)
            [4.48, +15.96, 1.0], // θ1 Tau
            [4.48, +15.87, 1.0], // θ2 Tau
            [4.44, +15.62, 1.0], // 71 Tau
            [4.01, +12.49, 1.0]  // λ Tau
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]], // V字形和延伸
        color: 0xffcccc
    },
    {
        name: "Zi (觜火猴)",
        stars: [
            [5.59, +9.93, 1.1], // λ Ori
            [5.58, +9.49, 1.0], // φ1 Ori
            [5.62, +9.29, 1.0]  // φ2 Ori
        ],
        lines: [[0, 1], [1, 2], [2, 0]], // 小三角形
        color: 0xffcccc
    },
    {
        name: "Shen (参水猿)", // 猎户座主体
        stars: [
            [5.60, -1.20, 1.0], // Alnitak (参宿一)
            [5.60, -1.90, 1.0], // Alnilam (参宿二)
            [5.53, -2.60, 1.0], // Mintaka (参宿三)
            [5.91, +7.40, 1.5], // Betelgeuse (参宿四)
            [5.24, +6.30, 1.2], // Bellatrix (参宿五)
            [5.79, -9.60, 1.2], // Saiph (参宿六)
            [5.24, -8.20, 1.5]  // Rigel (参宿七)
        ],
        lines: [[0, 1], [1, 2], [3, 0], [4, 0], [0, 5], [2, 6]], // 猎户座连线
        color: 0xffcccc
    },

    // --- 南方朱雀 Vermilion Bird of the South ---
    {
        name: "Jing (井木犴)",
        stars: [
            [6.38, +22.51, 1.1], // μ Gem
            [6.48, +20.21, 1.0], // ν Gem
            [6.63, +16.39, 1.1], // γ Gem
            [6.75, +12.89, 1.0], // ξ Gem
            [6.73, +25.13, 1.1], // ε Gem
            [7.33, +21.98, 1.0], // δ Gem
            [7.07, +20.57, 1.0], // ζ Gem
            [7.30, +16.54, 1.0]  // λ Gem
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 7], [7, 6], [6, 5], [5, 4], [4, 0]], // 形成一个近似长方形
        color: 0xffcc99
    },
    {
        name: "Gui (鬼金羊)",
        stars: [
            [8.53, +18.09, 1.1], // θ Cnc
            [8.54, +20.44, 1.0], // η Cnc
            [8.72, +21.47, 1.1], // γ Cnc
            [8.74, +18.15, 1.1]  // δ Cnc
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 0]], // 四边形
        color: 0xffcc99
    },
    {
        name: "Liu (柳土獐)",
        stars: [
            [8.63, +5.70, 1.0], // δ Hya
            [8.65, +3.34, 1.0], // σ Hya
            [8.72, +3.40, 1.0], // η Hya
            [8.80, +5.83, 1.0], // ρ Hya
            [8.78, +6.42, 1.1], // ε Hya
            [8.92, +5.94, 1.0], // ζ Hya
            [9.10, +5.09, 1.0], // ω Hya
            [9.24, +2.31, 1.0]  // θ Hya
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]], // 弯曲的柳枝状
        color: 0xffcc99
    },
    {
        name: "Xing (星日马)",
        stars: [
            [9.46, -8.66, 1.2], // α Hya (Alphard)
            [9.48, -2.77, 1.0], // τ1 Hya
            [9.53, -1.18, 1.0], // τ2 Hya
            [9.66, -1.14, 1.0], // ι Hya
            [9.33, -11.97, 1.0], // 26 Hya
            [9.34, -9.55, 1.0]  // 27 Hya
        ],
        lines: [[0, 4], [4, 5], [5, 3], [3, 2], [2, 1]], // 弧线
        color: 0xffcc99
    },
    {
        name: "Zhang (张月鹿)",
        stars: [
            [9.86, -14.84, 1.0], // υ1 Hya
            [10.08, -13.06, 1.0], // λ Hya
            [10.15, -16.48, 1.0], // μ Hya
            [10.37, -19.49, 1.0], // φ Hya
            [10.45, -16.89, 1.0]  // κ Hya
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4]], // 不规则弧线
        color: 0xffcc99
    },
    {
        name: "Yi (翼火蛇)",
        stars: [
            [11.00, -18.39, 1.0], // α Crt
            [11.23, -14.89, 1.0], // β Crt
            [11.45, -17.41, 1.0], // γ Crt
            [11.53, -14.65, 1.0], // δ Crt
            [11.66, -10.97, 1.0], // ε Crt
            [11.75, -18.23, 1.0], // ζ Crt
            [12.10, -8.96, 1.0]   // η Crt
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0]], // 杯子状
        color: 0xffcc99
    },
    {
        name: "Zhen (轸水蚓)",
        stars: [
            [12.29, -17.60, 1.1], // γ Crv
            [12.41, -19.22, 1.0], // ε Crv
            [12.55, -16.51, 1.0], // δ Crv
            [12.43, -22.38, 1.0]  // β Crv
        ],
        lines: [[0, 1], [1, 2], [2, 3], [3, 0]], // 四边形
        color: 0xffcc99
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

    // 合并标准星座和二十八星宿
    // const allConstellations = [...constellationsData, ...lunarMansionsData];
    const allConstellations = [...lunarMansionsData];

    allConstellations.forEach(constellation => {
        const cStars = constellation.stars.map(s => {
            const pos = getStarPosition(s[0], s[1]);

            starPositions.push(pos.x, pos.y, pos.z);

            // 如果有自定义颜色（如二十八星宿），则使用；否则随机
            if (constellation.color) {
                const c = new THREE.Color(constellation.color);
                starColors.push(c.r, c.g, c.b);
            } else {
                const color = Math.random() > 0.5 ? baseColor : highlightColor;
                starColors.push(color.r, color.g, color.b);
            }

            // 调整大小为 20 (如果是二十八宿，稍微大一点以便识别)
            const baseSize = constellation.color ? 25.0 : 20.0;
            starSizes.push(s[2] * baseSize);

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
