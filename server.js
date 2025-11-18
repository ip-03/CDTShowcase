const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 4040 });
console.log('WebSocket server is running on ws://localhost:4040');

const TICK_RATE = 30;

const players = {};
let lastPlayerId = 0;

wss.on('connection', function connection(ws) {
    const playerId = `p${++lastPlayerId}`;
    players[playerId] = { x: getRandomNumber(200, 600), y: getRandomNumber(150, 450), vx: 0, vy: 0 };
    ws.playerId = playerId;
    ws.send(JSON.stringify({ type: 'assignId', playerId }));

    ws.on('message', function incoming(message) {
        const data = JSON.parse(message);
        if (data.type === 'input') {
            const player = players[ws.playerId];
            if (player) {
                player.vx = data.vx;
                player.vy = data.vy;
            }
        }
    });
    ws.on('close', function () {
        delete players[ws.playerId];
    });
});

setInterval(() => {
    const now = Date.now();
    const dT = 1000 / TICK_RATE;
    for (const playerId in players) {
        const player = players[playerId];
        player.x += player.vx * dT / 1000;
        player.y += player.vy * dT / 1000;
    }

    const worldState = { 
        type: 'worldState',
        time: now, 
        players: Object.entries(players).map(([id, p]) => ({ 
            id, 
            x: p.x, 
            y: p.y 
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