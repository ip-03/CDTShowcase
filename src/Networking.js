let ws = null;
let connected = false;

function setupNetworking(timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
        let resolved = false;

        //ws = new WebSocket('ws://143.179.181.40:4040');
        ws = new WebSocket('ws://127.0.0.1:4040');

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
                let firstState = new WorldState();
                json.entities.forEach(e => {
                    if (e.type === 'player') {
                        const p = new Player(e.id, e.x, e.y);
                        p.facing = e.facing;
                        world.addEntity(p);
                        firstState.addEntity({ id: e.id, type: 'player', x: e.x, y: e.y, facing: e.facing });
                    }
                    if (e.type === 'barrier') {
                        world.addEntity(new Barrier(e.id, e.x, e.y, 64, 64));
                        firstState.addEntity({ id: e.id, type: 'barrier', x: e.x, y: e.y, width: 64, height: 64 });
                    }
                });
                world.worldStateSS.push({ time: json.time, worldState: firstState });
            }

            if (type === 'tickEvents') {
                let ssCount = world.worldStateSS.length;
                if (ssCount === 0) return;
                serverTimeOffset = performance.now() - json.time;

                const prevEntities = world.worldStateSS[ssCount - 1].worldState.getEntities();
                const newState = new WorldState();
                prevEntities.forEach(e => {
                    newState.addEntity({ ...e });
                });

                json.events.forEach(ev => {
                    switch (ev.event) {
                        case 'player.joined': {
                            const p = new Player(ev.id, ev.x, ev.y);
                            newState.addEntity({ id: ev.id, type: 'player', x: ev.x, y: ev.y, facing: ev.facing });
                            world.addEntity(p);
                            break;
                        }
                        case 'player.left': {
                            newState.removeEntity(ev.id);
                            break;
                        }
                        case 'entity.moved': {
                            const e = newState.getEntityById(ev.id);
                            if (e) {
                                e.x = ev.x;
                                e.y = ev.y;
                                if(e.facing !== undefined) e.facing = ev.facing;
                            }
                            break;
                        }
                        case 'entity.attribute.changed': {
                            const e = newState.getEntityById(ev.id);
                            if (e) {
                                e[ev.attribute] = ev.value;
                            }
                            break;
                        }
                    }
                });

                world.worldStateSS.push({ time: json.time, worldState: newState });
                if (world.worldStateSS.length > 50) {
                    world.worldStateSS.shift();
                }
                finish();
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