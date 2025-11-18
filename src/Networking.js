let ws = null;
let connected = false;

function setupNetworking() {
    // connect websocket
    ws = new WebSocket('ws://143.179.181.40:4040');

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
        if (!thisPlayerId && type === 'assignId') {
            thisPlayerId = json.playerId;
            return;
        }

        if (type === 'worldState') {
            if (!offsetReady) {
                serverTimeOffset = performance.now() - json.time;
                offsetReady = true;
            }

            const playersMap = {};
            json.players.forEach(p => {
                playersMap[p.id] = { x: p.x, y: p.y };
                if (!players[p.id]) {
                    players[p.id] = new Player(p.id, p.x, p.y);
                }
                if (!thisPlayer && p.id === thisPlayerId) {
                    thisPlayer = players[p.id];
                }
            });
            // store a snapshot object: { time, players }
            worldStateSS.push({ time: json.time, players: playersMap });
        }
    };

    ws.onclose = (evt) => {
        console.log('Closed:', evt.reason || evt);
        connected = false;
    };

    ws.onerror = (err) => {
        console.error('WebSocket error', err);
    };
}