import * as Textures from './textures.js';

export const planetInfo = {
    Sun: {
        name: '太阳 SUN',
        type: 'G2V 黄矮星 / Yellow Dwarf',
        data: [
            { label: '质量 Mass', value: '333,000 x Earth' },
            { label: '直径 Diameter', value: '1,392,700 km' },
            { label: '表面温度 Surface Temp', value: '5,500 °C' },
            { label: '核心温度 Core Temp', value: '15,000,000 °C' },
            { label: '能量来源 Energy', value: '核聚变 Nuclear Fusion' }
        ],
        desc: '太阳系的主宰，占据了太阳系 99.86% 的质量。它为整个星系提供光和热，是地球生命存在的根本源泉。<br><br>The star at the center of the Solar System. It is a nearly perfect sphere of hot plasma, heated to incandescence by nuclear fusion reactions in its core.',
        audioPitch: 0.5,
        audioFilter: 80
    },
    Mercury: {
        name: '水星 MERCURY',
        type: '类地行星 / Terrestrial Planet',
        data: [
            { label: '质量 Mass', value: '0.055 x Earth' },
            { label: '直径 Diameter', value: '4,879 km' },
            { label: '自转周期 Day', value: '58.6 Days' },
            { label: '公转周期 Year', value: '88 Days' },
            { label: '温度 Temp', value: '-170°C ~ 430°C' },
            { label: '卫星 Moons', value: '0' }
        ],
        desc: '离太阳最近的行星，表面布满陨石坑，酷似月球。由于缺乏大气层调节，昼夜温差极大。<br><br>The smallest planet in the Solar System and the closest to the Sun. Its surface is heavily cratered and similar in appearance to the Moon.',
        audioPitch: 2.0,
        audioFilter: 800
    },
    Venus: {
        name: '金星 VENUS',
        type: '类地行星 / Terrestrial Planet',
        data: [
            { label: '质量 Mass', value: '0.815 x Earth' },
            { label: '直径 Diameter', value: '12,104 km' },
            { label: '自转周期 Day', value: '243 Days' },
            { label: '公转周期 Year', value: '225 Days' },
            { label: '温度 Temp', value: '462°C (Hottest)' },
            { label: '大气 Atmosphere', value: '96% CO2' }
        ],
        desc: '被称为“启明星”。浓密的二氧化碳大气层导致了失控的温室效应，使其成为地狱般的行星。<br><br>Second planet from the Sun. It has a dense atmosphere of carbon dioxide that traps heat, causing a runaway greenhouse effect.',
        audioPitch: 0.8,
        audioFilter: 200
    },
    Earth: {
        name: '地球 EARTH',
        type: '类地行星 / Terrestrial Planet',
        data: [
            { label: '质量 Mass', value: '1.000 x Earth' },
            { label: '直径 Diameter', value: '12,742 km' },
            { label: '自转周期 Day', value: '23.9 Hours' },
            { label: '公转周期 Year', value: '365.25 Days' },
            { label: '温度 Temp', value: '15°C (Avg)' },
            { label: '卫星 Moons', value: '1 (The Moon)' }
        ],
        desc: '目前已知唯一孕育生命的星球。表面 71% 被液态水覆盖，拥有适宜的气候和保护性的大气层。<br><br>Third planet from the Sun and the only astronomical object known to harbor life. About 71% of Earth\'s surface is covered with water.',
        audioPitch: 1.0,
        audioFilter: 400
    },
    Mars: {
        name: '火星 MARS',
        type: '类地行星 / Terrestrial Planet',
        data: [
            { label: '质量 Mass', value: '0.107 x Earth' },
            { label: '直径 Diameter', value: '6,779 km' },
            { label: '自转周期 Day', value: '24.6 Hours' },
            { label: '公转周期 Year', value: '687 Days' },
            { label: '温度 Temp', value: '-63°C (Avg)' },
            { label: '卫星 Moons', value: '2 (Phobos, Deimos)' }
        ],
        desc: '红色的沙漠行星。拥有太阳系最高的火山（奥林匹斯山）和最大的峡谷（水手谷）。<br><br>Fourth planet from the Sun. A dusty, cold, desert world with a very thin atmosphere. It is home to Olympus Mons, the largest volcano in the solar system.',
        audioPitch: 1.2,
        audioFilter: 500
    },
    Jupiter: {
        name: '木星 JUPITER',
        type: '气态巨行星 / Gas Giant',
        data: [
            { label: '质量 Mass', value: '318 x Earth' },
            { label: '直径 Diameter', value: '139,820 km' },
            { label: '自转周期 Day', value: '9.9 Hours' },
            { label: '公转周期 Year', value: '11.86 Years' },
            { label: '温度 Temp', value: '-145°C' },
            { label: '卫星 Moons', value: '95+' }
        ],
        desc: '太阳系体积和质量最大的行星。标志性的“大红斑”是一个持续了数百年的巨大反气旋风暴。<br><br>The largest planet in the Solar System. It is a gas giant with mass one-thousandth that of the Sun, but two-and-a-half times that of all the other planets combined.',
        audioPitch: 0.4,
        audioFilter: 60
    },
    Saturn: {
        name: '土星 SATURN',
        type: '气态巨行星 / Gas Giant',
        data: [
            { label: '质量 Mass', value: '95 x Earth' },
            { label: '直径 Diameter', value: '116,460 km' },
            { label: '自转周期 Day', value: '10.7 Hours' },
            { label: '公转周期 Year', value: '29.5 Years' },
            { label: '温度 Temp', value: '-178°C' },
            { label: '光环 Rings', value: 'Spectacular' }
        ],
        desc: '以其壮丽的光环系统著称。光环主要由冰粒和岩石碎片组成。它是太阳系唯一密度小于水的行星。<br><br>Sixth planet from the Sun and the second-largest in the Solar System. It is best known for its fabulous ring system.',
        audioPitch: 0.6,
        audioFilter: 100
    },
    Uranus: {
        name: '天王星 URANUS',
        type: '冰巨星 / Ice Giant',
        data: [
            { label: '质量 Mass', value: '14.5 x Earth' },
            { label: '直径 Diameter', value: '50,724 km' },
            { label: '自转周期 Day', value: '17.2 Hours' },
            { label: '公转周期 Year', value: '84 Years' },
            { label: '温度 Temp', value: '-224°C (Coldest)' },
            { label: '轴倾角 Tilt', value: '98°' }
        ],
        desc: '自转轴倾斜 98°，几乎是“躺”在轨道上滚动。大气中富含甲烷，使其呈现出独特的青蓝色。<br><br>Seventh planet from the Sun. It has the third-largest planetary radius and fourth-largest planetary mass in the Solar System.',
        audioPitch: 1.5,
        audioFilter: 600
    },
    Neptune: {
        name: '海王星 NEPTUNE',
        type: '冰巨星 / Ice Giant',
        data: [
            { label: '质量 Mass', value: '17.1 x Earth' },
            { label: '直径 Diameter', value: '49,244 km' },
            { label: '自转周期 Day', value: '16 Hours' },
            { label: '公转周期 Year', value: '165 Years' },
            { label: '温度 Temp', value: '-214°C' },
            { label: '风速 Wind', value: '2,100 km/h' }
        ],
        desc: '太阳系最遥远的行星。拥有深邃的蓝色大气和太阳系最强烈的风暴。<br><br>Eighth and farthest-known Solar planet from the Sun. It is the fourth-largest planet by diameter, the third-most-massive planet, and the densest giant planet.',
        audioPitch: 0.9,
        audioFilter: 300
    },
    Pluto: {
        name: '冥王星 PLUTO',
        type: '矮行星 / Dwarf Planet',
        data: [
            { label: '质量 Mass', value: '0.002 x Earth' },
            { label: '直径 Diameter', value: '2,376 km' },
            { label: '自转周期 Day', value: '6.4 Days' },
            { label: '公转周期 Year', value: '248 Years' },
            { label: '温度 Temp', value: '-229°C' },
            { label: '卫星 Moons', value: '5' }
        ],
        desc: '位于柯伊伯带的矮行星。轨道偏心率极大，有时比海王星更靠近太阳。<br><br>A dwarf planet in the Kuiper belt, a ring of bodies beyond the orbit of Neptune. It was the first and the largest Kuiper belt object to be discovered.',
        audioPitch: 1.8,
        audioFilter: 700
    },
    Moon: {
        name: '月球 MOON',
        type: '卫星 / Satellite',
        data: [
            { label: '质量 Mass', value: '0.012 x Earth' },
            { label: '直径 Diameter', value: '3,474 km' },
            { label: '自转周期 Day', value: '27.3 Days' },
            { label: '公转周期 Year', value: '27.3 Days' },
            { label: '温度 Temp', value: '-173°C ~ 127°C' },
            { label: '距离 Distance', value: '384,400 km' }
        ],
        desc: '地球唯一的天然卫星。它是太阳系中第五大的卫星。月球被潮汐锁定，永远以同一面朝向地球。<br><br>Earth\'s only natural satellite. It is the fifth-largest satellite in the Solar System. The Moon is in synchronous rotation with Earth, always showing the same face.',
        audioPitch: 2.5,
        audioFilter: 900
    },
    AsteroidBelt: {
        name: '小行星带 ASTEROID BELT',
        type: '小行星群 / Asteroid Group',
        data: [
            { label: '位置 Location', value: 'Mars - Jupiter' },
            { label: '总质量 Mass', value: '4% of Moon' },
            { label: '最大天体 Largest', value: 'Ceres (谷神星)' },
            { label: '数量 Count', value: '1.1 - 1.9 Million' },
            { label: '组成 Composition', value: 'Rock & Stone' }
        ],
        desc: '位于火星和木星轨道之间的环形区域，聚集了数百万颗形状不规则的小行星。它们是太阳系形成初期残留的岩石碎片。<br><br>The circumstellar disc in the Solar System located roughly between the orbits of the planets Mars and Jupiter. It is occupied by numerous irregularly shaped bodies called asteroids or minor planets.',
        audioPitch: 1.5,
        audioFilter: 600
    },
    KuiperBelt: {
        name: '柯伊伯带 KUIPER BELT',
        type: '外海王星天体 / TNOs',
        data: [
            { label: '位置 Location', value: 'Beyond Neptune' },
            { label: '宽度 Width', value: '20 AU' },
            { label: '最大天体 Largest', value: 'Pluto, Eris' },
            { label: '组成 Composition', value: 'Ice (Frozen Volatiles)' },
            { label: '起源 Origin', value: 'Solar System Formation' }
        ],
        desc: '海王星轨道之外的一个巨大圆盘状区域，充满了冰冻的挥发物（如甲烷、氨、水）。它是短周期彗星的发源地，冥王星也位于此。<br><br>A circumstellar disc in the outer Solar System, extending from the orbit of Neptune to approximately 50 AU from the Sun. It is similar to the asteroid belt, but is far larger—20 times as wide and 20 to 200 times as massive.',
        audioPitch: 0.3,
        audioFilter: 100
    }
};

export const planetsConfig = [
    { name: 'Mercury', radius: 1.2, distance: 22, speed: 0.02, texFn: Textures.createMercuryTexture, color: 0xFFFFFF, shininess: 2, roughness: 0.9, bumpScale: 0.08 },
    { name: 'Venus', radius: 2.0, distance: 32, speed: 0.015, texFn: Textures.createVenusTexture, color: 0xFFFFFF, shininess: 10, roughness: 0.6, bumpScale: 0.05, atmosphere: '#E6B860' },
    { name: 'Earth', radius: 2.2, distance: 45, speed: 0.012, texFn: Textures.createEarthTextures, color: 0x1E88E5, shininess: 25, roughness: 0.5, hasClouds: true, atmosphere: '#CAE8FF', bumpScale: 0.05 },
    { name: 'Mars', radius: 1.4, distance: 58, speed: 0.01, texFn: Textures.createMarsTexture, color: 0xE65100, shininess: 5, roughness: 0.8, atmosphere: '#E65100', bumpScale: 0.08 },
    { name: 'Jupiter', radius: 6.0, distance: 80, speed: 0.005, texFn: Textures.createJupiterTexture, color: 0xFFFFFF, shininess: 20, roughness: 0.5 },
    { name: 'Saturn', radius: 5.0, distance: 105, speed: 0.004, texFn: Textures.createSaturnTexture, color: 0xF5F0D7, shininess: 10, roughness: 0.4, ring: { inner: 6, outer: 11, color: 'rgba(245, 240, 215, 0.9)', type: 'particle' } },
    { name: 'Uranus', radius: 3.5, distance: 130, speed: 0.003, texFn: Textures.createUranusTexture, color: 0xFFFFFF, shininess: 30, roughness: 0.2, tilt: 98, atmosphere: '#80DEEA', ring: { inner: 4, outer: 6.5, color: 'rgba(255, 255, 255, 0.8)', type: 'detailed' } },
    { name: 'Neptune', radius: 3.4, distance: 150, speed: 0.0025, texFn: Textures.createNeptuneTexture, color: 0x1565C0, shininess: 30, roughness: 0.3, atmosphere: '#1565C0' },
    { name: 'Pluto', radius: 0.8, distance: 170, speed: 0.002, texFn: Textures.createPlutoTexture, color: 0xFFAB91, shininess: 5, roughness: 0.8, orbitTilt: 17, bumpScale: 0.06 }
];
