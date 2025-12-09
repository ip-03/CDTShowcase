export function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min
}

export function dot(a, b) {
    return a.x * b.x + a.y * b.y;
}

export function normalize(v) {
    const len = Math.hypot(v.x, v.y);
    if (len === 0) return { x: 0, y: 0 };
    return { x: v.x / len, y: v.y / len };
}