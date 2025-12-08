import * as THREE from 'three';
import Noise from './noise.js';

function createBumpMap(canvas) {
    const width = canvas.width; const height = canvas.height; const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, width, height); const data = imgData.data;
    const bumpCanvas = document.createElement('canvas'); bumpCanvas.width = width; bumpCanvas.height = height;
    const bumpCtx = bumpCanvas.getContext('2d'); const bumpImgData = bumpCtx.createImageData(width, height); const bumpData = bumpImgData.data;
    for (let i = 0; i < data.length; i += 4) {
        const brightness = 0.34 * data[i] + 0.5 * data[i+1] + 0.16 * data[i+2];
        bumpData[i] = brightness; bumpData[i+1] = brightness; bumpData[i+2] = brightness; bumpData[i+3] = 255;
    }
    bumpCtx.putImageData(bumpImgData, 0, 0);
    return new THREE.CanvasTexture(bumpCanvas);
}

// 地球
export function createEarthTextures() {
    const size = 1024; const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size; const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(size, size); const data = imgData.data;
    const specCanvas = document.createElement('canvas'); specCanvas.width = size; specCanvas.height = size; const specCtx = specCanvas.getContext('2d');
    const specImgData = specCtx.createImageData(size, size); const specData = specImgData.data;

    const deepOcean = {r:16, g:78, b:139}; const shallowOcean = {r:30, g:136, b:229}; const beach = {r:210, g:180, b:140};
    const landGreen = {r:34, g:139, b:34}; const landBrown = {r:139, g:69, b:19}; const snow = {r:255, g:255, b:255};

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const nx = x / size * 4; const ny = y / size * 4;
            let h = Noise.fbm(nx, ny, 6);
            const distToPole = Math.min(y, size - y) / (size * 0.15);
            if (distToPole < 1.0) h += (1.0 - distToPole) * 0.6;

            const idx = (y * size + x) * 4;
            let r, g, b, spec;

            if (h < 0.45) { r = deepOcean.r; g = deepOcean.g; b = deepOcean.b; spec = 150; }
            else if (h < 0.5) { const t = (h - 0.45) / 0.05; r = deepOcean.r + (shallowOcean.r - deepOcean.r)*t; g = deepOcean.g + (shallowOcean.g - deepOcean.g)*t; b = deepOcean.b + (shallowOcean.b - deepOcean.b)*t; spec = 150; }
            else if (h < 0.52) { r = beach.r; g = beach.g; b = beach.b; spec = 20; }
            else if (h < 0.7) { const t = (h - 0.52) / 0.18; r = landGreen.r + (landBrown.r - landGreen.r)*t; g = landGreen.g + (landBrown.g - landGreen.g)*t; b = landGreen.b + (landBrown.b - landGreen.b)*t; spec = 0; }
            else if (h < 0.85) { r = landBrown.r; g = landBrown.g; b = landBrown.b; spec = 0; }
            else { r = snow.r; g = snow.g; b = snow.b; spec = 50; }

            data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = 255;
            specData[idx] = spec; specData[idx+1] = spec; specData[idx+2] = spec; specData[idx+3] = 255;
        }
    }
    ctx.putImageData(imgData, 0, 0); specCtx.putImageData(specImgData, 0, 0);
    return { texture: new THREE.CanvasTexture(canvas), specularMap: new THREE.CanvasTexture(specCanvas), bumpMap: createBumpMap(canvas) };
}

export function createEarthCloudTexture() {
    const size = 1024; const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size; const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(size, size); const data = imgData.data;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const nx = x / size * 6; const ny = y / size * 6;
            let n = Noise.fbm(nx + 10, ny + 10, 5);
            const idx = (y * size + x) * 4;
            let alpha = 0; if (n > 0.6) { alpha = (n - 0.6) * 2.5 * 255; }
            data[idx] = 255; data[idx+1] = 255; data[idx+2] = 255; data[idx+3] = alpha;
        }
    }
    ctx.putImageData(imgData, 0, 0); return new THREE.CanvasTexture(canvas);
}

// 其他行星
export function createMercuryTexture() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load('./textures/mercury_texture_generated.png');
    return { texture: texture, bumpMap: texture };
}
export function createVenusTexture() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load('./textures/venus_texture_generated.png');
    return { texture: texture, bumpMap: texture };
}
export function createMarsTexture() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load('./textures/mars_texture_generated.png');
    return { texture: texture, bumpMap: texture };
}
export function createJupiterTexture() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load('./textures/jupiter_texture_generated.png');
    return { texture: texture };
}
export function createSaturnTexture() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load('./textures/saturn_texture_generated.png');
    return { texture: texture };
}
export function createUranusTexture() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load('./textures/uranus_texture_generated.png');
    return { texture: texture };
}
export function createNeptuneTexture() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load('./textures/neptune_texture_generated.png');
    return { texture: texture };
}
export function createPlutoTexture() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load('./textures/pluto_texture_generated.png');
    // 使用加载的纹理作为颜色贴图，同时也作为简易的凹凸贴图
    return { texture: texture, bumpMap: texture };
}

// 碎石光环纹理 (用于土星)
export function createParticleRingTexture(color) {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    const cx = size/2, cy = size/2;

    const gradient = ctx.createRadialGradient(cx, cy, size/4, cx, cy, size/2);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.2, color);
    gradient.addColorStop(0.4, 'rgba(0,0,0,0.05)');
    gradient.addColorStop(0.45, color);
    gradient.addColorStop(0.7, color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,size,size);

    for(let i=0; i<15000; i++) {
        const r = (Math.random() * 0.25 + 0.25) * size;
        const angle = Math.random() * Math.PI * 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        const dotSize = Math.random() * 1.5 + 0.5;
        ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.5 + 0.2})`;
        ctx.beginPath(); ctx.arc(x, y, dotSize, 0, Math.PI*2); ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
}

export function createRingTexture(color, isDetailed = false) {
    const size = 1024; const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size; const ctx = canvas.getContext('2d');
    const cx = size/2, cy = size/2;

    if (isDetailed) {
        // 绘制多条细线组成的环 (用于天王星)
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        const radiusStart = size * 0.25;
        const radiusEnd = size * 0.5;

        // 主环
        for (let r = radiusStart; r < radiusEnd; r += 4) {
            // 随机透明度模拟环的疏密
            ctx.globalAlpha = Math.random() * 0.4 + 0.1;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
        }
        // 几条明显的亮环
        ctx.globalAlpha = 0.8;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, radiusEnd - 10, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, radiusEnd - 40, 0, Math.PI * 2); ctx.stroke();

    } else {
        // 默认的渐变环
        const gradient = ctx.createRadialGradient(cx, cy, size/4, cx, cy, size/2);
        gradient.addColorStop(0, 'rgba(0,0,0,0)'); gradient.addColorStop(0.2, color); gradient.addColorStop(0.4, 'rgba(0,0,0,0.05)'); gradient.addColorStop(0.45, color); gradient.addColorStop(0.7, color); gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient; ctx.fillRect(0,0,size,size);
    }
    return new THREE.CanvasTexture(canvas);
}
