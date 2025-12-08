import * as THREE from 'three';

let farGalaxies = []; // 存储所有微型星系对象以便更新

/**
 * 创建河外星系群 (由粒子组成的自旋星系 - 绚丽色彩版)
 * @param {THREE.Scene} scene
 */
export function createFarGalaxies(scene) {
    const parameters = {
        galaxiesCount: 40,
        particlesPerGalaxy: 800, // 稍微增加粒子数以表现色彩细节
        minDist: 15000,
        maxDist: 18000,
        galaxyRadius: 500,      // 稍微加大半径
        // 配色方案：[核心颜色, 边缘颜色]
        colorSchemes: [
            ['#ffddaa', '#1b3984'], // 金黄 -> 深蓝 (经典螺旋星系)
            ['#ffffff', '#ff0055'], // 亮白 -> 紫红 (活跃星系)
            ['#aaffff', '#846fc4'], // 青色 -> 蓝紫 (年轻星系)
            ['#ffaa88', '#9d349b'], // 橙红 -> 深紫 (奇异星系)
        ]
    };

    const group = new THREE.Group();
    scene.add(group);

    // 通用纹理
    const getTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const context = canvas.getContext('2d');
        const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 32, 32);
        return new THREE.CanvasTexture(canvas);
    };
    const texture = getTexture();

    for (let g = 0; g < parameters.galaxiesCount; g++) {
        // 1. 位置
        const dist = Math.random() * (parameters.maxDist - parameters.minDist) + parameters.minDist;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);

        const galaxyPos = new THREE.Vector3(
            dist * Math.sin(phi) * Math.cos(theta),
            dist * Math.sin(phi) * Math.sin(theta),
            dist * Math.cos(phi)
        );

        // 2. 粒子生成
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(parameters.particlesPerGalaxy * 3);
        const colors = new Float32Array(parameters.particlesPerGalaxy * 3);

        // 随机选择配色方案
        const scheme = parameters.colorSchemes[Math.floor(Math.random() * parameters.colorSchemes.length)];
        const colorInside = new THREE.Color(scheme[0]);
        const colorOutside = new THREE.Color(scheme[1]);

        const branches = 3 + Math.floor(Math.random() * 3);
        const spin = 3 + Math.random() * 2; // 增加旋转
        const randomness = 0.6; // 增加随机性，让色彩混合更自然
        const randomnessPower = 3;

        for (let i = 0; i < parameters.particlesPerGalaxy; i++) {
            const i3 = i * 3;
            const radius = Math.random() * parameters.galaxyRadius;
            const spinAngle = radius * spin * 0.005;
            const branchAngle = (i % branches) / branches * Math.PI * 2;

            const randomX = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * radius;
            const randomY = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * radius * 0.5;
            const randomZ = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * radius;

            positions[i3    ] = Math.cos(branchAngle + spinAngle) * radius + randomX;
            positions[i3 + 1] = randomY;
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

            // 颜色混合逻辑优化
            const mixedColor = colorInside.clone();
            mixedColor.lerp(colorOutside, radius / parameters.galaxyRadius);

            // 添加随机色彩扰动 (模拟星云中的丰富色彩)
            if (Math.random() < 0.3) {
                mixedColor.r += (Math.random() - 0.5) * 0.2;
                mixedColor.g += (Math.random() - 0.5) * 0.2;
                mixedColor.b += (Math.random() - 0.5) * 0.2;
            }

            colors[i3    ] = Math.max(0, Math.min(1, mixedColor.r));
            colors[i3 + 1] = Math.max(0, Math.min(1, mixedColor.g));
            colors[i3 + 2] = Math.max(0, Math.min(1, mixedColor.b));
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 40 + Math.random() * 30,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true,
            transparent: true,
            opacity: 0.8, // 提高不透明度以显色
            map: texture,
            alphaMap: texture
        });

        const points = new THREE.Points(geometry, material);
        points.position.copy(galaxyPos);
        points.lookAt(new THREE.Vector3(0,0,0));
        points.rotateZ(Math.random() * Math.PI * 2);
        points.rotateX(Math.random() * Math.PI * 0.5);

        group.add(points);

        farGalaxies.push({
            mesh: points,
            rotationSpeed: (Math.random() - 0.5) * 0.3 // 加快一点自转
        });
    }

    return group;
}

/**
 * 更新河外星系动画
 * @param {number} deltaTime
 */
export function updateFarGalaxies(deltaTime) {
    farGalaxies.forEach(galaxy => {
        galaxy.mesh.rotation.y += galaxy.rotationSpeed * deltaTime;
    });
}
