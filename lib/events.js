import { EventEmitter } from 'events';
import { world } from '../server.js';

export const events = new EventEmitter();
export const eventsThisTick = new Set();

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

events.on('entity.spawned', (e) => {
    eventsThisTick.add({
        event: 'entity.spawned',
        id: e.id,
        type: e.type,
        name: e.type === 'spell' ? e.name : undefined,
        x: e.x,
        y: e.y,
        angle: e.angle
    });
    console.log('Spawned entity:', e);
});

events.on('entity.removed', (entityId) => {
    eventsThisTick.add({
        event: 'entity.removed',
        id: entityId
    });
});

events.on('entity.moved', (e) => {
    eventsThisTick.add({
        event: 'entity.moved',
        id: e.id,
        type: e.type,
        x: e.x,
        y: e.y,
        facing: e.facing
    });
});

const collisionCorrections = new Map();

function accumulateCorrection(entity, dx, dy) {
    const magNew = Math.hypot(dx, dy);
    if (magNew === 0) return;

    const nNew = { x: dx / magNew, y: dy / magNew };
    let entry = collisionCorrections.get(entity.id);

    if (!entry) {
        entry = {
            entity,
            primary: { dx, dy, normal: nNew, mag: magNew },
            secondary: null
        };
        collisionCorrections.set(entity.id, entry);
        return;
    }

    const THRESH = 0.8; 
    const { primary, secondary } = entry;

    const dot = (a, b) => a.x * b.x + a.y * b.y;

    if (!primary) {
        entry.primary = { dx, dy, normal: nNew, mag: magNew };
        return;
    }

    const d1 = Math.abs(dot(nNew, primary.normal));

    if (d1 > THRESH) {
        if (magNew > primary.mag) {
            entry.primary = { dx, dy, normal: nNew, mag: magNew };
        }
        return;
    }

    if (!secondary) {
        entry.secondary = { dx, dy, normal: nNew, mag: magNew };
        return;
    }

    const d2 = Math.abs(dot(nNew, secondary.normal));

    if (d2 > THRESH) {
        if (magNew > secondary.mag) {
            entry.secondary = { dx, dy, normal: nNew, mag: magNew };
        }
    } else {
        const weakerIsPrimary = primary.mag < secondary.mag;
        if (magNew > (weakerIsPrimary ? primary.mag : secondary.mag)) {
            if (weakerIsPrimary) {
                entry.primary = { dx, dy, normal: nNew, mag: magNew };
            } else {
                entry.secondary = { dx, dy, normal: nNew, mag: magNew };
            }
        }
    }
}

export function applyCollisionCorrections() {
    for (const { entity, primary, secondary } of collisionCorrections.values()) {
        let dx = 0, dy = 0;
        if (primary) {
            dx += primary.dx;
            dy += primary.dy;
        }
        if (secondary) {
            dx += secondary.dx;
            dy += secondary.dy;
        }
        entity._x += dx;
        entity._y += dy;
    }
    collisionCorrections.clear();
}

events.on('collisions', (payload) => {
    const { idA, idB, normal, penetration, contactPoint } = payload;
    const entityA = world.getEntityById(idA);
    const entityB = world.getEntityById(idB);
    if (!entityA || !entityB) return;

    if (entityA.type === 'player' && entityB.dynamic === false) {
        accumulateCorrection(entityA,
            -normal.x * penetration,
            -normal.y * penetration
        );
        return;
    }
    if (entityB.type === 'player' && entityA.dynamic === false) {
        accumulateCorrection(entityB,
            normal.x * penetration,
            normal.y * penetration
        );
        return;
    }

    if (typeof entityA.collideWith === 'function') {
        entityA.collideWith(entityB, { normal, penetration, contactPoint });
    }
    if (typeof entityB.collideWith === 'function') {
        entityB.collideWith(entityA, { normal: { x: -normal.x, y: -normal.y }, penetration, contactPoint });
    }
});

events.on('entity.attribute.changed', (entityId, attribute, value) => {
    eventsThisTick.add({
        event: 'entity.attribute.changed',
        id: entityId,
        attribute,
        value
    });
});