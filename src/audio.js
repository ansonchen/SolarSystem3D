// 音频管理模块
let isAudioPlaying = false;
let audioContext = null;
let noiseNode = null;
let filterNode = null;
let gainNode = null;

export function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const bufferSize = audioContext.sampleRate * 4;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5;
        }
        noiseNode = audioContext.createBufferSource();
        noiseNode.buffer = buffer;
        noiseNode.loop = true;
        filterNode = audioContext.createBiquadFilter();
        filterNode.type = 'lowpass';
        filterNode.frequency.value = 150;
        gainNode = audioContext.createGain();
        gainNode.gain.value = 0.8;
        noiseNode.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(audioContext.destination);
        noiseNode.start();
        audioContext.suspend();
    }
}

export function toggleAudio(btnElement) {
    initAudio();
    if (isAudioPlaying) {
        audioContext.suspend();
        btnElement.innerHTML = '<span class="icon">♫</span> AUDIO: OFF';
        btnElement.classList.remove('active');
    } else {
        audioContext.resume();
        btnElement.innerHTML = '<span class="icon">♫</span> AUDIO: ON';
        btnElement.classList.add('active');
    }
    isAudioPlaying = !isAudioPlaying;
    return isAudioPlaying;
}

export function setAudioEffect(pitch, filterFreq) {
    if (audioContext && isAudioPlaying) {
        const now = audioContext.currentTime;
        noiseNode.playbackRate.linearRampToValueAtTime(pitch, now + 1);
        filterNode.frequency.linearRampToValueAtTime(filterFreq, now + 1);
    }
}
