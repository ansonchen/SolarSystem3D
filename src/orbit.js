/**
 * 公转模拟模块
 * 定义各行星在动画中的公转周期（秒）
 */

// 设定的公转周期（单位：秒）
const orbitalPeriods = {
    Mercury: 7.23,
    Venus: 18.45,
    Earth: 30.00,
    Mars: 56.43,
    Jupiter: 355.83,
    Saturn: 883.02,
    Uranus: 2519.17,
    Neptune: 4943.89,
    Pluto: 7441.32
};

/**
 * 计算公转角速度（弧度/秒）
 * @param {string} planetName - 行星名称
 * @returns {number} 每秒移动的轨道角度（弧度）
 */
export function getOrbitalSpeed(planetName) {
    const period = orbitalPeriods[planetName];
    if (!period) {
        console.warn(`Unknown planet for orbit: ${planetName}, using default speed.`);
        return 0.01;
    }

    // 角速度 = 2π / 周期
    return (2 * Math.PI) / period;
}

/**
 * 获取公转周期数据（用于调试）
 */
export function getOrbitalPeriod(planetName) {
    return orbitalPeriods[planetName];
}
