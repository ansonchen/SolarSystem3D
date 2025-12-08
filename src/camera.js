export function initCamera(renderer) {
    // 创建容器
    const container = document.createElement('div');
    container.id = 'camera-container';
    // 样式已移至 style.css

    // 创建按钮
    const btn = document.createElement('button');
    btn.id = 'camera-btn';
    btn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
        </svg>
    `;

    // 悬停效果 (通过 CSS 处理)
    // 点击截图
    btn.onclick = () => {
        playShutterSound(); // 播放音效
        takeScreenshot(renderer);
    };

    container.appendChild(btn);
    document.body.appendChild(container);
}

// --- 音效生成 ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playShutterSound() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const t = audioCtx.currentTime;

    // 1. 高频“咔”声 (模拟机械快门开启)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1500, t);
    osc1.frequency.exponentialRampToValueAtTime(100, t + 0.05);

    gain1.gain.setValueAtTime(0.5, t);
    gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);

    osc1.start(t);
    osc1.stop(t + 0.05);

    // 2. 低频“嚓”声 (模拟快门闭合)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(800, t + 0.06);
    osc2.frequency.exponentialRampToValueAtTime(100, t + 0.15);

    gain2.gain.setValueAtTime(0.5, t + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);

    osc2.start(t + 0.06);
    osc2.stop(t + 0.15);

    // 3. 白噪声 (增加机械质感)
    const bufferSize = audioCtx.sampleRate * 0.1; // 0.1秒
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = audioCtx.createGain();

    noiseGain.gain.setValueAtTime(0.3, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    noise.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    noise.start(t);
}

function takeScreenshot(renderer) {
    try {
        // 1. 获取 Canvas 数据
        // 注意：WebGLRenderer 需要设置 preserveDrawingBuffer: true 才能在任意时刻截图，
        // 否则可能截取到黑屏。如果未设置，建议在 render 循环后立即调用，或者强制 render 一次。
        // 这里假设 script.js 会开启该配置，或者我们尝试直接截取。
        const strMime = "image/png";
        const imgData = renderer.domElement.toDataURL(strMime);

        // 2. 创建下载链接
        const link = document.createElement('a');
        link.download = `solar-system-${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.png`;
        link.href = imgData;

        // 3. 触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 4. 简单的视觉反馈 (闪光)
        flashEffect();

    } catch (e) {
        console.error("Screenshot failed:", e);
        alert("截图失败，请检查浏览器权限或配置。");
    }
}

function flashEffect() {
    const flash = document.createElement('div');
    Object.assign(flash.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: '#fff',
        opacity: '0.8',
        zIndex: '9999',
        pointerEvents: 'none',
        transition: 'opacity 0.5s ease-out'
    });
    document.body.appendChild(flash);

    // 强制重绘
    requestAnimationFrame(() => {
        flash.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(flash);
        }, 500);
    });
}
