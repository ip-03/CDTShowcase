let thisPlayerId = null;
let thisPlayer = null;

const players = {}; // map [id -> Player]
const worldStateSS = []; // world snapshots (array of { time, players })
let serverTimeOffset = 0; // serverTime - localTime
let offsetReady = false;

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

        // compute simple velocity delta (used for direction & animation)
        const prevX = players[id].x;
        const prevY = players[id].y;

        players[id].update(newX, newY);

        // store a crude velocity (delta per frame) so Player.draw can decide direction
        players[id].vx = newX - prevX;
        players[id].vy = newY - prevY;

        // set sprite playing when the entity is moving
        if (players[id].sprite) {
            const moving = Math.abs(players[id].vx) > 0.001 || Math.abs(players[id].vy) > 0.001;
            players[id].sprite.playing = moving;
        }

        players[id].draw();
    }
}