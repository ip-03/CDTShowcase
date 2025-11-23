let ws = null;
let connected = false;

function setupNetworking(timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
        let resolved = false;

        ws = new WebSocket('ws://143.179.181.40:4040');

        const finish = () => {
            if (resolved) return;
            resolved = true;
            clearTimeout(timer);
            resolve();
        };
        const fail = (err) => {
            if (resolved) return;
            resolved = true;
            clearTimeout(timer);
            reject(err);
        };

        const timer = setTimeout(() => {
            fail(new Error('setupNetworking timeout'));
        }, timeoutMs);

        ws.onopen = () => {
            console.log('Connected!');
            connected = true;
        };

        ws.onmessage = (evt) => {
            //console.log('Received:', evt.data);
            let json;
            try {
                json = JSON.parse(evt.data);
            } catch (e) {
                console.warn('Warning: failed to parse incoming message as JSON');
                return;
            }

            const type = json.type;
            if (!thisPlayerId && type === 'init') {
                thisPlayerId = json.playerId;
                world = new World(json.worldWidth, json.worldHeight);
                return;
            }

            if (type === 'worldState') {
                if (!offsetReady) {
                    serverTimeOffset = performance.now() - json.time;
                    offsetReady = true;
                }

                    const worldState = new WorldState();
                    json.entities.forEach(e => {
                        if (e.type === 'player') {
                            const snap = { id: e.id, type: 'player', x: e.x, y: e.y, vx: e.vx, vy: e.vy };
                            worldState.addEntity(snap);

                            if (!world.getEntityById(e.id)) {
                                const p = new Player(e.id, e.x, e.y, e.vx, e.vy);
                                world.addEntity(p);
                                if (!thisPlayer && e.id === thisPlayerId) {
                                    thisPlayer = world.getEntityById(thisPlayerId);
                                }
                            } else {
                                if (!thisPlayer && e.id === thisPlayerId) {
                                    thisPlayer = world.getEntityById(thisPlayerId);
                                }
                            }
                        }
                    });
                world.worldStateSS.push({ time: json.time, worldState: worldState });
                if (world.worldStateSS.length > 50) {
                    world.worldStateSS.shift();
                }
                if (thisPlayer && offsetReady) {
                    finish();
                }
            }
        };

        ws.onclose = (evt) => {
            console.log('Closed:', evt.reason || evt);
            connected = false;
        };

        ws.onerror = (err) => {
            console.error('WebSocket error', err);
            fail(err);
        };
    });
}