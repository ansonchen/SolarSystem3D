import * as THREE from 'three';

const sunVertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const sunFragmentShader = `
uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

// Simplex 3D Noise
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 1.0/7.0;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}

void main() {
    // 1. 基础噪声：模拟表面沸腾
    float noiseVal = snoise(vPosition * 0.2 + vec3(time * 0.1));

    // 2. 细节噪声：增加颗粒感
    float detailNoise = snoise(vPosition * 0.8 - vec3(time * 0.2));

    float combined = noiseVal * 0.6 + detailNoise * 0.4;

    // 3. 颜色定义 (HDR 高动态范围，增强辉光)
    vec3 darkRed = vec3(2.0, 0.1, 0.0);      // 耀斑/暗部 (增强红光)
    vec3 brightOrange = vec3(4.0, 1.5, 0.2); // 过渡 (高亮橙色)
    vec3 sunYellow = vec3(6.0, 4.5, 1.0);    // 主体 (超亮黄)
    vec3 hotWhite = vec3(10.0, 10.0, 8.0);   // 核心 (极亮白)

    // 4. 颜色混合
    // 调整混合阈值，让黄色区域更大
    vec3 color = mix(darkRed, brightOrange, smoothstep(-0.3, 0.1, combined));
    color = mix(color, sunYellow, smoothstep(0.1, 0.5, combined));
    color = mix(color, hotWhite, smoothstep(0.5, 0.9, combined));

    // 5. 边缘变暗 (Limb Darkening)
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float viewDot = dot(viewDir, vNormal);
    float limb = smoothstep(0.0, 1.0, viewDot);

    // 边缘稍微偏橙，但保持明亮
    color = mix(vec3(3.0, 1.0, 0.0), color, limb * 0.7 + 0.3);

    gl_FragColor = vec4(color, 1.0);
}
`;

const coronaFragmentShader = `
uniform float time;
varying vec3 vPosition;
varying vec2 vUv;

// 复用 snoise (为了确保独立运行，再次包含核心算法)
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 1.0/7.0;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}

void main() {
    vec3 pos = vPosition;

    // 1. 动态坐标：让噪声向外辐射
    vec3 noisePos = pos * 0.4 - vec3(time * 0.3);

    // 2. 脊状噪声 (Ridged Noise)
    float n = snoise(noisePos);
    float ridges = 1.0 - abs(n);
    ridges = pow(ridges, 3.0); // 降低指数，让线条变粗一点，看起来更多

    // 3. 第二层高频噪声，增加丝状细节
    // 增加频率，让火舌更密
    float n2 = snoise(pos * 2.5 + vec3(time * 0.6));
    float ridges2 = 1.0 - abs(n2);
    ridges2 = pow(ridges2, 2.0);

    // 混合两层噪声，提高高频细节的权重
    float fire = ridges * 0.6 + ridges2 * 0.4;

    // 4. 遮罩 (Masking)
    // 降低遮罩的阈值，让更多区域显示火舌
    float mask = snoise(pos * 0.2 + vec3(time * 0.15));
    fire *= smoothstep(0.0, 0.5, mask); // 阈值从 0.2 降到 0.0，火舌覆盖面更广

    // 5. 边缘衰减
    vec3 viewDir = normalize(cameraPosition - vPosition);
    vec3 normal = normalize(vPosition);
    float viewDot = dot(viewDir, normal);

    float rim = pow(1.0 - abs(viewDot), 1.5); // 稍微减弱边缘衰减，让火舌看起来更实

    float intensity = fire * rim * 3.0; // 增强整体强度

    // 6. 颜色：更黄、更亮 (HDR)
    vec3 fireRed = vec3(3.0, 0.8, 0.1);    // 偏橙红
    vec3 fireYellow = vec3(5.0, 3.0, 0.5); // 明黄
    vec3 finalColor = mix(fireRed, fireYellow, fire + 0.2); // 整体偏黄

    // 7. Alpha 混合
    float alpha = smoothstep(0.05, 0.4, intensity); // 降低 Alpha 阈值，让微弱的火舌也能显示

    gl_FragColor = vec4(finalColor, alpha);
}
`;

export function createSun(scene) {
    const sunUniforms = {
        time: { value: 0 }
    };

    const sunGeo = new THREE.SphereGeometry(10, 64, 64);
    const sunMat = new THREE.ShaderMaterial({
        uniforms: sunUniforms,
        vertexShader: sunVertexShader,
        fragmentShader: sunFragmentShader
    });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.castShadow = false;
    sun.receiveShadow = false;
    scene.add(sun);

    // 添加日冕/火舌层
    const coronaGeo = new THREE.SphereGeometry(11.5, 64, 64);
    const coronaMat = new THREE.ShaderMaterial({
        uniforms: sunUniforms,
        vertexShader: sunVertexShader,
        fragmentShader: coronaFragmentShader,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
    });
    const corona = new THREE.Mesh(coronaGeo, coronaMat);
    sun.add(corona);

    return { sun, sunUniforms };
}
