/**
 * 物理引擎模块
 * 基于真实天文数据，计算行星自转和公转的动画参数
 */

// ===========================
// 1. 时间系统配置
// ===========================

/**
 * 动画时间基准：地球自转一圈的时间（秒）
 * 调整此值可改变整体动画速度
 */
export const EARTH_ROTATION_PERIOD = 30; // 秒

/**
 * 真实物理数据：地球自转周期
 */
const REAL_EARTH_DAY = 1; // 天 (恒星日)

/**
 * 时间缩放因子
 * 用于将真实时间映射到动画时间
 */
const TIME_SCALE = EARTH_ROTATION_PERIOD / REAL_EARTH_DAY;

// ===========================
// 2. 真实物理数据库
// ===========================

/**
 * 各行星的真实天文数据
 * rotationPeriod: 自转周期（单位：地球日）
 * orbitalPeriod: 公转周期（单位：地球年）
 * rotationDirection: 自转方向（1 = 正常，-1 = 逆向）
 */
const realPhysicsData = {
    Mercury: {
        rotationPeriod: 58.633,    // 1759s / 30
        orbitalPeriod: 0.241,
        rotationDirection: 1       // 正
    },
    Venus: {
        rotationPeriod: 243.067,   // 7292s / 30
        orbitalPeriod: 0.615,
        rotationDirection: -1      // 反
    },
    Earth: {
        rotationPeriod: 1.0,       // 30s / 30
        orbitalPeriod: 1.0,
        rotationDirection: 1       // 正
    },
    Mars: {
        rotationPeriod: 1.027,     // 30.8s / 30
        orbitalPeriod: 1.88,
        rotationDirection: 1       // 正
    },
    Jupiter: {
        rotationPeriod: 0.413,     // 12.4s / 30
        orbitalPeriod: 11.86,
        rotationDirection: 1       // 正
    },
    Saturn: {
        rotationPeriod: 0.443,     // 13.3s / 30
        orbitalPeriod: 29.46,
        rotationDirection: 1       // 正
    },
    Uranus: {
        rotationPeriod: 0.717,     // 21.5s / 30
        orbitalPeriod: 84.01,
        rotationDirection: -1      // 反 (按要求设定为逆向)
    },
    Neptune: {
        rotationPeriod: 0.670,     // 20.1s / 30
        orbitalPeriod: 164.79,
        rotationDirection: 1       // 正
    },
    Pluto: {
        rotationPeriod: 6.390,     // 191.7s / 30
        orbitalPeriod: 248.09,
        rotationDirection: 1       // 正
    }
};

// ===========================
// 3. 动画参数计算
// ===========================

/**
 * 计算自转角速度（弧度/秒）
 * @param {string} planetName - 行星名称
 * @returns {number} 每秒旋转的弧度数
 */
export function getRotationSpeed(planetName) {
    const data = realPhysicsData[planetName];
    if (!data) {
        console.warn(`Unknown planet: ${planetName}, using default rotation.`);
        return 0.005; // 默认值
    }

    // 动画中该行星自转一圈需要多少秒
    const animRotationPeriod = data.rotationPeriod * TIME_SCALE;

    // 角速度 = 2π / 周期 (弧度/秒)
    const angularVelocity = (2 * Math.PI) / animRotationPeriod;

    // 应用自转方向
    return angularVelocity * data.rotationDirection;
}

/**
 * 获取所有行星的物理参数（用于调试/展示）
 * @returns {Object} 包含动画周期的数据
 */
export function getAllPhysicsData() {
    const result = {};
    for (const planet in realPhysicsData) {
        result[planet] = {
            real: realPhysicsData[planet],
            animation: {
                rotationPeriod: realPhysicsData[planet].rotationPeriod * TIME_SCALE,
                rotationSpeed: getRotationSpeed(planet)
            }
        };
    }
    return result;
}
