import * as THREE from 'three';

/**
 * 创建小行星带系统
 */
export class BeltSystem {
    constructor(scene) {
        this.scene = scene;
        this.belts = []; // 存储生成的带对象 { mesh, hitbox, name }
    }

    /**
     * 生成小行星带 (InstancedMesh)
     * @param {string} name - 标识符 ('AsteroidBelt' | 'KuiperBelt')
     * @param {number} count - 小行星数量
     * @param {number} innerRadius - 内径
     * @param {number} outerRadius - 外径
     * @param {number} size - 单个小行星平均大小
     * @param {number} color - 颜色
     * @param {boolean} isIcy - 是否是冰质 (柯伊伯带)
     */
    createBelt(name, count, innerRadius, outerRadius, size, color, isIcy = false) {
        // 1. 几何体与材质
        // 使用十二面体模拟不规则岩石，面数少性能好
        const geometry = new THREE.DodecahedronGeometry(size, 0);

        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 1.0, // 完全粗糙，减少高光闪烁
            metalness: 0.0, // 无金属感
            flatShading: true,
            emissive: 0x000000, // 关闭自发光
            emissiveIntensity: 0.0
        });

        const mesh = new THREE.InstancedMesh(geometry, material, count);
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // 如果需要动，设为动态

        const dummy = new THREE.Object3D();
        const center = new THREE.Vector3();

        // 2. 分布逻辑
        for (let i = 0; i < count; i++) {
            // 随机角度
            const angle = Math.random() * Math.PI * 2;
            // 随机半径 (均匀分布)
            const r = Math.sqrt(Math.random() * (outerRadius**2 - innerRadius**2) + innerRadius**2);

            // 随机高度 (垂直分布)
            // 柯伊伯带更厚一些
            const heightSpread = isIcy ? 4.0 : 1.5;
            const y = (Math.random() - 0.5) * heightSpread;

            // 坐标
            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;

            dummy.position.set(x, y, z);

            // 随机旋转
            dummy.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            // 随机缩放
            const scale = Math.random() * 0.5 + 0.5;
            dummy.scale.set(scale, scale, scale);

            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
        }

        mesh.castShadow = false; // 关闭投射阴影
        mesh.receiveShadow = false; // 关闭接收阴影
        this.scene.add(mesh);

        // 3. 创建交互碰撞体 (Hitbox)
        // 使用 TorusGeometry 创建一个不可见的环
        const ringRadius = (innerRadius + outerRadius) / 2;
        const tubeRadius = (outerRadius - innerRadius) / 2;

        const hitboxGeo = new THREE.TorusGeometry(ringRadius, tubeRadius, 8, 64);
        const hitboxMat = new THREE.MeshBasicMaterial({
            visible: false, // 不可见
            color: 0xff0000,
            wireframe: true
        });
        const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
        hitbox.rotation.x = Math.PI / 2; // 躺平
        // 根据带的厚度调整碰撞体
        // 柯伊伯带很厚(接近圆管)，小行星带很扁
        hitbox.scale.z = isIcy ? 0.8 : 0.1;

        this.scene.add(hitbox);

        // 存储引用
        const beltObj = {
            name: name,
            mesh: mesh,     // 可视网格
            hitbox: hitbox, // 交互网格
            rotationSpeed: isIcy ? 0.0005 : 0.001 // 整体自转速度
        };

        this.belts.push(beltObj);
        return beltObj;
    }

    /**
     * 动画更新
     */
    update() {
        this.belts.forEach(belt => {
            // 让整个带缓慢旋转
            belt.mesh.rotation.y += belt.rotationSpeed;
            // Hitbox 也要跟着转 (虽然它是圆环转不转没区别，但为了逻辑一致)
            belt.hitbox.rotation.z -= belt.rotationSpeed; // Torus 是躺着的，所以转 Z 轴
        });
    }
}
