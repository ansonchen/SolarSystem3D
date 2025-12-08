import * as THREE from 'three';

// 动态计算初始相机位置 (适配手机竖屏)
export function getInitialCameraPosition() {
    const aspect = window.innerWidth / window.innerHeight;

    if (aspect < 1) {
        // 竖屏模式优化：高空俯视
        const height = 450 / aspect;
        return new THREE.Vector3(0, height, 50);
    }

    // 横屏模式：侧俯视
    return new THREE.Vector3(0, 140, 260);
}
