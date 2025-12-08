// Perlin Noise / Simplex Noise 简易实现
const Noise = {
    seed: Math.random(),
    fade: function(t) { return t * t * t * (t * (t * 6 - 15) + 10); },
    lerp: function(t, a, b) { return a + t * (b - a); },
    grad: function(hash, x, y) {
        const h = hash & 15;
        const u = h < 8 ? x : y, v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    },
    p: new Uint8Array(512),
    init: function() {
        for(let i=0; i<256; i++) this.p[i] = this.p[i+256] = Math.floor(Math.random()*256);
    },
    perlin: function(x, y) {
        const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
        x -= Math.floor(x); y -= Math.floor(y);
        const u = this.fade(x), v = this.fade(y);
        const A = this.p[X]+Y, B = this.p[X+1]+Y;
        return this.lerp(v, this.lerp(u, this.grad(this.p[A], x, y), this.grad(this.p[B], x-1, y)),
                            this.lerp(u, this.grad(this.p[A+1], x, y-1), this.grad(this.p[B+1], x-1, y-1)));
    },
    fbm: function(x, y, octaves) {
        let val = 0; let freq = 1; let amp = 0.5;
        for(let i=0; i<octaves; i++) { val += this.perlin(x*freq, y*freq) * amp; freq *= 2; amp *= 0.5; }
        return val + 0.5;
    }
};
Noise.init();

export default Noise;
