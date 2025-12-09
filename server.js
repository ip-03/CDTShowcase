import WebSocket, { WebSocketServer } from 'ws';
import { events, eventsThisTick, applyCollisionCorrections } from './lib/events.js';
import { World } from './lib/world.js';
import { Player } from './lib/player.js';
import * as utils from './lib/utils.js';

const wss = new WebSocketServer({ port: 4040 });
console.log('WebSocket server is running on ws://localhost:4040');

const TICK_RATE = 30;
let lastPlayerId = 0;

export const world = new World(3008, 3008);

function broadcast(msg) {
    const data = JSON.stringify(msg);
    for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    }
}

wss.on('connection', function connection(ws) {
    const playerId = `p${++lastPlayerId}`;
    const player = new Player(playerId, utils.getRandomNumber(500, 1000), utils.getRandomNumber(500, 1000), 0, 0);
    world.addEntity(player);
    ws.playerId = playerId; 

    const initMsg = {
        time: Date.now(),
        type: 'init',
        playerId: playerId,
        worldWidth: world.width,
        worldHeight: world.height,
        entities: world.getEntities().map(e => ({
            id: e.id,
            type: e.type,
            x: e.x,
            y: e.y,
            facing: e.facing ? e.facing : null
        }))
    };
    ws.send(JSON.stringify(initMsg));
    events.emit('player.joined', player);

    ws.on('message', function incoming(message) {
        const data = JSON.parse(message);
        if (data.type === 'kbInput') {
            const p = world.getEntityById(ws.playerId);
            if (p) {
                p.setVelocity(data.dirX, data.dirY);
            }
        } else if (data.type === 'mInput') {
            const p = world.getEntityById(ws.playerId);
            if (p) {
                p.setFacing(data.mouseX);
            }
        }
    });

    ws.on('close', function () {
        world.removeEntity(ws.playerId);
        events.emit('player.left', ws.playerId);
    });
});

setInterval(() => {
    const now = Date.now();
    const dT = 1000 / TICK_RATE;

    const oldPositions = new Map();

    world.forEachEntity(e => {
        if (e.dynamic) {
            oldPositions.set(e.id, { x: e.x, y: e.y });
            e.integrate(dT);
        }
    });
    
    world.collisionHandler.detectCollisions();
    applyCollisionCorrections();

    oldPositions.forEach((pos, id) => {
        const e = world.getEntityById(id);
        if (e.x !== pos.x || e.y !== pos.y) {
            events.emit('entity.moved', {id: e.id, type: e.type, x: e.x, y: e.y, facing: e.facing ? e.facing : null});
        }
    });

    broadcast({
        time: now,
        type: 'tickEvents',
        events: Array.from(eventsThisTick)
    });
    eventsThisTick.clear();
}, 1000 / TICK_RATE);