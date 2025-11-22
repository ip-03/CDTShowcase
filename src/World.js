let thisPlayerId = null;
let thisPlayer = null;

const players = {}; // map [id -> Player]
const worldStateSS = []; // world snapshots (array of { time, players })
let serverTimeOffset = 0; // serverTime - localTime
let offsetReady = false;
let worldWidth = 0;
let worldHeight = 0;

const INTERPOLATION_DELAY = 50; // ms

function updateWorld() {
    const now = performance.now();
    if (!offsetReady || worldStateSS.length < 2) return;

    const renderTime = now - serverTimeOffset - INTERPOLATION_DELAY;

    let ss0 = null, ss1 = null;
    for (let i = worldStateSS.length - 1; i >= 0; i--) {
        const s = worldStateSS[i];
        if (s.time <= renderTime) {
            ss0 = s;
            ss1 = worldStateSS[i + 1] || s;
            break;
        }
    }
    if (!ss0) {
        ss0 = worldStateSS[0];
        ss1 = worldStateSS[1];
    }

    let t = 0;
    if (ss0 !== ss1) {
        t = (renderTime - ss0.time) / (ss1.time - ss0.time);
        t = constrain(t, 0, 1);
    }

    for (const id in players) {
        if (!ss0.players[id]) {
            delete players[id];
        }
    }

    for (const id in ss0.players) {
        let p0 = ss0.players[id];
        let p1 = ss1.players[id] || p0;

        const newX = lerp(p0.x, p1.x, t);
        const newY = lerp(p0.y, p1.y, t);
        const newVx = lerp(p0.vx, p1.vx, t);
        const newVy = lerp(p0.vy, p1.vy, t);

        if (!players[id]) {
            players[id] = new Player(id, newX, newY);
            if (!thisPlayer && id === thisPlayerId) {
                thisPlayer = players[id];
            }
        }

        players[id].update(newX, newY, newVx, newVy);

        players[id].draw();
    }
}