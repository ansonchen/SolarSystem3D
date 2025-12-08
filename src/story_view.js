import * as THREE from 'three';

export class StoryView {
    constructor(camera, controls, planetMeshes, sun) {
        this.camera = camera;
        this.controls = controls;
        this.planetMeshes = planetMeshes;
        this.sun = sun;

        this.isActive = false;
        this.targets = [];
        this.currentIndex = 0;

        // 状态: 'IDLE', 'MOVING', 'ORBITING'
        this.state = 'IDLE';
        this.timer = 0;

        // 动画参数
        this.transitionDuration = 3.0; // 移动耗时 (秒)
        this.orbitDuration = 5.0;      // 环绕耗时 (秒)
        this.startPos = new THREE.Vector3();
        this.endPos = new THREE.Vector3();
        this.startLookAt = new THREE.Vector3();
        this.endLookAt = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3(); // 当前关注点

        this.initUI();
    }

    initUI() {
        const btn = document.createElement('button');
        btn.id = 'story-view-btn';
        btn.innerHTML = `
            <span style="font-size: 20px; margin-right: 8px;">🎬</span>
            <span>大片模式 (Story Mode)</span>
        `;

        // 注入响应式样式
        const style = document.createElement('style');
        style.innerHTML = `
            #story-view-btn {
                bottom: 20px;
                left: 240px;
            }
            @media (max-width: 768px) {
                #story-view-btn {
                    left: 10px !important;
                    bottom: 70px !important;
                    padding: 8px 16px !important;
                    font-size: 13px !important;
                }
                #story-view-btn span:first-child {
                    font-size: 16px !important;
                    margin-right: 4px !important;
                }
            }
        `;
        document.head.appendChild(style);

        // 样式
        Object.assign(btn.style, {
            position: 'absolute',
            // bottom: '20px',  <-- 移至 CSS 控制
            // left: '240px',   <-- 移至 CSS 控制
            padding: '12px 24px',
            background: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '30px',
            color: '#fff',
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            cursor: 'pointer',
            backdropFilter: 'blur(5px)',
            transition: 'all 0.3s ease',
            zIndex: '1000',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 0 15px rgba(0, 150, 255, 0.3)'
        });

        btn.onmouseover = () => {
            btn.style.background = 'rgba(0, 150, 255, 0.4)';
            btn.style.boxShadow = '0 0 25px rgba(0, 150, 255, 0.6)';
            btn.style.transform = 'scale(1.05)';
        };
        btn.onmouseout = () => {
            btn.style.background = 'rgba(0, 0, 0, 0.6)';
            btn.style.boxShadow = '0 0 15px rgba(0, 150, 255, 0.3)';
            btn.style.transform = 'scale(1)';
        };

        btn.onclick = () => {
            if (this.isActive) {
                this.stop();
            } else {
                this.start();
            }
        };

        document.body.appendChild(btn);
        this.btn = btn;
    }

    start() {
        if (this.isActive) return;

        this.isActive = true;
        this.btn.innerHTML = `<span style="font-size: 20px; margin-right: 8px;">⏹</span> 停止巡游 (Stop)`;
        this.btn.style.background = 'rgba(255, 50, 50, 0.5)';

        // 禁用默认控制器
        this.controls.enabled = false;

        // 准备目标列表: 太阳 -> 水星 -> 金星 ...
        // 对 planetMeshes 按距离排序 (虽然通常已经是排序的，但保险起见)
        const sortedPlanets = [...this.planetMeshes].sort((a, b) => a.data.distance - b.data.distance);

        this.targets = [
            { mesh: this.sun, data: { name: 'Sun', radius: 15 } }, // 太阳手动构造数据
            ...sortedPlanets
        ];

        this.currentIndex = 0;
        this.prepareMoveToTarget(0);
    }

    stop() {
        this.isActive = false;
        this.btn.innerHTML = `<span style="font-size: 20px; margin-right: 8px;">🎬</span> 大片模式 (Story Mode)`;
        this.btn.style.background = 'rgba(0, 0, 0, 0.6)';

        // 恢复控制器
        this.controls.enabled = true;
        this.controls.target.copy(this.currentLookAt); // 保持当前视角中心
        this.controls.update();
    }

    prepareMoveToTarget(index) {
        if (index >= this.targets.length) {
            this.stop(); // 结束
            return;
        }

        const target = this.targets[index];
        this.state = 'MOVING';
        this.timer = 0;

        // 起点
        this.startPos.copy(this.camera.position);
        this.startLookAt.copy(this.controls.target); // 使用控制器的 target 作为当前的 lookAt 点

        // 终点计算
        // 我们希望相机停在目标的一侧，稍微俯视
        const targetWorldPos = new THREE.Vector3();
        target.mesh.getWorldPosition(targetWorldPos);

        // 计算一个理想的观测位置
        // 距离取决于天体半径
        const viewDistance = target.data.radius * 4.0 + 10;

        // 随机选一个角度，增加趣味性
        const angle = Math.random() * Math.PI * 2;
        const height = viewDistance * 0.5; // 稍微俯视

        this.endPos.set(
            targetWorldPos.x + Math.cos(angle) * viewDistance,
            targetWorldPos.y + height,
            targetWorldPos.z + Math.sin(angle) * viewDistance
        );

        this.endLookAt.copy(targetWorldPos);

        // 根据距离动态调整移动时间，避免远距离飞太慢或近距离飞太快
        const dist = this.startPos.distanceTo(this.endPos);
        this.transitionDuration = Math.max(2.0, Math.min(5.0, dist / 100)); // 2s - 5s
    }

    update(deltaTime) {
        if (!this.isActive) return;

        const target = this.targets[this.currentIndex];
        const targetWorldPos = new THREE.Vector3();
        target.mesh.getWorldPosition(targetWorldPos);

        if (this.state === 'MOVING') {
            this.timer += deltaTime;
            const progress = Math.min(this.timer / this.transitionDuration, 1.0);

            // 使用 EaseInOutQuad 插值
            const t = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

            this.camera.position.lerpVectors(this.startPos, this.endPos, t);
            this.currentLookAt.lerpVectors(this.startLookAt, this.endLookAt, t);
            this.camera.lookAt(this.currentLookAt);

            if (progress >= 1.0) {
                this.state = 'ORBITING';
                this.timer = 0;
            }
        }
        else if (this.state === 'ORBITING') {
            this.timer += deltaTime;

            // 环绕逻辑：保持看向目标，同时相机围绕目标旋转
            // 简单的实现：让相机位置围绕 targetWorldPos 旋转
            const speed = 0.2; // 环绕速度

            // 计算相对于目标的当前向量
            const relativePos = new THREE.Vector3().subVectors(this.camera.position, targetWorldPos);

            // 绕 Y 轴旋转
            const x = relativePos.x * Math.cos(speed * deltaTime) - relativePos.z * Math.sin(speed * deltaTime);
            const z = relativePos.x * Math.sin(speed * deltaTime) + relativePos.z * Math.cos(speed * deltaTime);

            this.camera.position.set(targetWorldPos.x + x, this.camera.position.y, targetWorldPos.z + z);
            this.camera.lookAt(targetWorldPos);
            this.currentLookAt.copy(targetWorldPos); // 更新当前的关注点

            if (this.timer >= this.orbitDuration) {
                this.currentIndex++;
                this.prepareMoveToTarget(this.currentIndex);
            }
        }
    }
}
