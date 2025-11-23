const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 4040 });
console.log('WebSocket server is running on ws://localhost:4040');

const TICK_RATE = 30;
const world = {};
world.width = 3000;
world.height = 3000;
world.players = {};
let lastPlayerId = 0;

wss.on('connection', function connection(ws) {
    const playerId = `p${++lastPlayerId}`;
    world.players[playerId] = { x: getRandomNumber(200, 600), y: getRandomNumber(150, 450), vx: 0, vy: 0 };
    ws.playerId = playerId;

    const initMsg = {
        type: 'init',
        playerId: playerId,
        worldWidth: world.width,
        worldHeight: world.height
    }
    ws.send(JSON.stringify(initMsg));

    ws.on('message', function incoming(message) {
        const data = JSON.parse(message);
        if (data.type === 'input') {
            const player = world.players[ws.playerId];
            if (player) {
                player.vx = data.vx;
                player.vy = data.vy;
            }
        }
    });
    ws.on('close', function () {
        delete world.players[ws.playerId];
    });
});

setInterval(() => {
    const now = Date.now();
    const dT = 1000 / TICK_RATE;
    for (const playerId in world.players) {
        const player = world.players[playerId];
        player.x += player.vx * dT / 1000;
        player.y += player.vy * dT / 1000;
    }

    const worldState = { 
        type: 'worldState',
        time: now, 
        entities: Object.entries(world.players).map(([id, e]) => ({ 
            id,
            type: 'player',
            x: e.x, 
            y: e.y,
            vx: e.vx, 
            vy: e.vy
        })) 
    };
    const msg = JSON.stringify(worldState);
    for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    }
}, 1000 / TICK_RATE);

const getRandomNumber = (min, max) => {
  return Math.random() * (max - min) + min
}