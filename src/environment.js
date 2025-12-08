import * as THREE from 'three';

export function createBackground(scene) {
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = 2048;
    bgCanvas.height = 2048;
    const bgCtx = bgCanvas.getContext('2d');

    const w = 2048, h = 2048;

    // 基础底色：极深蓝紫
    bgCtx.fillStyle = '#020408';
    bgCtx.fillRect(0, 0, w, h);

    function drawAmbientLight(x, y, r, color, opacity) {
        const g = bgCtx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        bgCtx.globalAlpha = opacity;
        bgCtx.globalCompositeOperation = 'screen';
        bgCtx.fillStyle = g;
        bgCtx.beginPath();
        bgCtx.arc(x, y, r, 0, Math.PI * 2);
        bgCtx.fill();
    }

    drawAmbientLight(w*0.2, h*0.2, 1200, '#1a0b2e', 0.2);
    drawAmbientLight(w*0.8, h*0.8, 1200, '#0b1a3e', 0.2);
    drawAmbientLight(w*0.5, h*0.5, 1000, '#002233', 0.15);
    drawAmbientLight(w*0.8, h*0.2, 900, '#2e0b1a', 0.1);

    function drawNebula(x, y, radius, color) {
        const g = bgCtx.createRadialGradient(x, y, 0, x, y, radius);
        g.addColorStop(0, color);
        g.addColorStop(0.6, color.replace(')', ', 0.2)').replace('rgb', 'rgba'));
        g.addColorStop(1, 'rgba(0,0,0,0)');

        bgCtx.fillStyle = g;
        bgCtx.globalCompositeOperation = 'lighter';
        bgCtx.globalAlpha = 0.1;

        bgCtx.save();
        bgCtx.translate(x, y);
        bgCtx.scale(Math.random() * 0.4 + 0.8, Math.random() * 0.4 + 0.8);
        bgCtx.rotate(Math.random() * Math.PI * 2);
        for(let i=0; i<5; i++) {
            bgCtx.beginPath();
            bgCtx.arc(Math.random()*100-50, Math.random()*100-50, radius * (Math.random()*0.5+0.5), 0, Math.PI * 2);
            bgCtx.fill();
        }
        bgCtx.restore();
    }

    for (let i = 0; i < 12; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * 300 + 200;
        const colors = ['#4a1a4a', '#1a3a5a', '#0a4a4a', '#3a1a5a', '#5a2a1a'];
        drawNebula(x, y, r, colors[Math.floor(Math.random() * colors.length)]);
    }

    bgCtx.globalCompositeOperation = 'source-over';
    bgCtx.globalAlpha = 1.0;

    scene.background = new THREE.CanvasTexture(bgCanvas);
}

export function createStars(scene) {
    const starGeo = new THREE.BufferGeometry();
    const starCount = 6000;
    const posArray = new Float32Array(starCount * 3);
    const colorArray = new Float32Array(starCount * 3);
    for(let i=0; i<starCount*3; i+=3) {
        posArray[i] = (Math.random() - 0.5) * 3000;
        posArray[i+1] = (Math.random() - 0.5) * 3000;
        posArray[i+2] = (Math.random() - 0.5) * 3000;
        const colorType = Math.random();
        if (colorType > 0.8) {
            colorArray[i] = 0.7; colorArray[i+1] = 0.8; colorArray[i+2] = 1.0;
        } else if (colorType > 0.5) {
            colorArray[i] = 1.0; colorArray[i+1] = 0.9; colorArray[i+2] = 0.7;
        } else {
            colorArray[i] = 1.0; colorArray[i+1] = 1.0; colorArray[i+2] = 1.0;
        }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.9, vertexColors: true, transparent: true, opacity: 0.9 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
}
