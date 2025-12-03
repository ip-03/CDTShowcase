const WebSocket = require('ws');
const EventEmitter = require('events');
const { time } = require('console');

const wss = new WebSocket.Server({ port: 4040 });
console.log('WebSocket server is running on ws://localhost:4040');

const events = new EventEmitter();

const TICK_RATE = 30;
let lastPlayerId = 0;

const getRandomNumber = (min, max) => {
    return Math.random() * (max - min) + min
}

class Entity {
    constructor(id, x = 0, y = 0, type = 'entity', cMask = { w: 0, h: 0 }, cMaskOffset = { x: 0, y: 0 }, angle = 0) {
        this._id = id;
        this._x = x;
        this._y = y;
        this._type = type;

        this._cMask = cMask;
        this._cMaskOffset = cMaskOffset;
        this._angle = angle;
    }

    get id() {
        return this._id;
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    get type() {
        return this._type;
    }
    get facing() {
        return this._facing;
    }


    getOBB() {
        const cosA = Math.cos(this._angle);
        const sinA = Math.sin(this._angle);

        const rotatedOffsetX = this._cMaskOffset.x * cosA - this._cMaskOffset.y * sinA;
        const rotatedOffsetY = this._cMaskOffset.x * sinA + this._cMaskOffset.y * cosA;
        const centerX = this._x + rotatedOffsetX;
        const centerY = this._y + rotatedOffsetY;

        const axisX = createVector(cosA, sinA);
        const axisY = createVector(-sinA, cosA);

        return {
            center: { x: centerX, y: centerY },
            halfWidth: this._cMask.w / 2,
            halfHeight: this._cMask.h / 2,
            axisX: axisX,
            axisY: axisY
        };
    }
}

class Player extends Entity {
    constructor(id, x = 0, y = 0, vx = 0, vy = 0) {
        super(id, x, y, 'player', { w: 20, h: 48 }, { x: 0, y: 0 }, 0);
        this._vx = vx;
        this._vy = vy;
        this._facing = 'right';
    }

    get vx() {
        return this._vx;
    }
    set vx(value) {
        this._vx = value;
    }

    get vy() {
        return this._vy;
    }
    set vy(value) {
        this._vy = value;
    }

    get facing() {
        return this._facing;
    }

    setVelocity(dirX, dirY) {
        const length = Math.hypot(dirX, dirY);
        if (length > 0) {
            dirX /= length;
            dirY /= length;
        }
        this._vx = dirX * 200;
        this._vy = dirY * 200;
    }

    integrate(dtMs) {
        if (this._vx < 0) {
            this._facing = 'left';
        } else if (this._vx > 0) {
            this._facing = 'right';
        }

        this._x += (this._vx || 0) * dtMs / 1000;
        this._y += (this._vy || 0) * dtMs / 1000;
    }
}

class World {
    constructor(wWidth, wHeight) {
        this._width = wWidth;
        this._height = wHeight;
        this._entitiesById = new Map();
    }

    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    get entitiesById() {
        return this._entitiesById;
    }

    addEntity(entity) {
        this._entitiesById.set(entity.id, entity);
    }
    removeEntity(id) {
        this._entitiesById.delete(id);
    }

    forEachEntity(cb) {
        for (const entity of this._entitiesById.values()) {
            cb(entity);
        }
    }

    getEntities() {
        return Array.from(this._entitiesById.values());
    }

    getEntityById(id) {
        return this._entitiesById.get(id);
    }
}

const world = new World(3000, 3000);

function broadcast(msg) {
    const data = JSON.stringify(msg);
    for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    }
}

const eventsThisTick = new Set();

events.on('player.joined', (p) => {
    eventsThisTick.add({
        event: 'player.joined',
        id: p.id,
        x: p.x,
        y: p.y,
        facing: p.facing
    });
});

events.on('player.left', (playerId) => {
    eventsThisTick.add({
        event: 'player.left',
        id: playerId
    });
});

events.on('player.moved', (p) => {
    eventsThisTick.add({
        event: 'player.moved',
        id: p.id,
        x: p.x,
        y: p.y,
        facing: p.facing
    });
});

wss.on('connection', function connection(ws) {
    const playerId = `p${++lastPlayerId}`;
    const player = new Player(playerId, getRandomNumber(500, 1000), getRandomNumber(500, 1000), 0, 0);
    world.addEntity(player);
    ws.playerId = playerId;

    const initMsg = {
        type: 'init',
        playerId: playerId,
        worldWidth: world.width,
        worldHeight: world.height,
        entities: world.getEntities().map(e => ({
            time: Date.now(),
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
        if (data.type === 'input') {
            const p = world.getEntityById(ws.playerId);
            if (p) {
                p.setVelocity(data.dirX, data.dirY);
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

    world.forEachEntity(e => {
        if (typeof e.integrate === 'function') {
            let oldX = e.x;
            let oldY = e.y;
            e.integrate(dT);

            if (e.type === 'player' && (Math.abs(oldX - e.x) > 1e-3 || Math.abs(oldY - e.y) > 1e-3)) {
                events.emit('player.moved', { time: now, id: e.id, x: e.x, y: e.y, facing: e.facing });
            }
        }
    });

    broadcast({
        time: now,
        type: 'tickEvents',
        events: Array.from(eventsThisTick)
    });
    eventsThisTick.clear();
}, 1000 / TICK_RATE);