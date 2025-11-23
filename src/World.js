let thisPlayerId = null;
let thisPlayer = null;

const players = {}; // map [id -> Player]
const entityMaps = {}; // map [entityType -> map[id -> Entity]]}
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

    entityMaps['player'] = players;
    for (const type in entityMaps) {
        const map = entityMaps[type];
        for (const id in map) {
            if (!ss0.entityMaps[type][id]) {
                delete map[id];
            }
        }
    }

    
    for (const type in ss0.entityMaps) {
        const map = ss0.entityMaps[type];
        for (const id in map) {
            let e0 = map[id];
            let e1 = ss1.entityMaps[type][id] || e0;

            const newX = lerp(e0.x, e1.x, t);
            const newY = lerp(e0.y, e1.y, t);

            // if (!entityMaps[type][id]) {
            //     if (type === 'player') {
            //         entityMaps[type][id] = new Player(id, newX, newY);
            //         if (!thisPlayer && id === thisPlayerId) {
            //             thisPlayer = entityMaps[type][id];
            //         }
            //     }
            // }           

            let newVx = 0;
            let newVy = 0;
            if (type === 'player') {
                newVx = lerp(e0.vx, e1.vx, t);
                newVy = lerp(e0.vy, e1.vy, t);
                entityMaps[type][id].update(newX, newY, newVx, newVy);
            }

            entityMaps[type][id].draw();
        }
    }
}