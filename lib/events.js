import { EventEmitter } from 'events';
import { world } from '../server.js';

export const events = new EventEmitter();
export const eventsThisTick = new Set();
const collisionsThisTick = new Map();

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

events.on('collision', (col) => {
    const entityA = world.getEntityById(col.idA);
    const entityB = world.getEntityById(col.idB);

    const entryA = collisionsThisTick.get(col.idA) || [];
    entryA.push({
        other: entityB || { type: 'unknown' },
        normal: { x: col.normal.x, y: col.normal.y }, // from A -> B
        penetration: col.penetration,
        contactPoint: col.contactPoint
    });
    collisionsThisTick.set(col.idA, entryA);

    const entryB = collisionsThisTick.get(col.idB) || [];
    entryB.push({
        other: entityA || { type: 'unknown' },
        normal: { x: -col.normal.x, y: -col.normal.y }, // from B -> A
        penetration: col.penetration,
        contactPoint: col.contactPoint
    });
    collisionsThisTick.set(col.idB, entryB);
});

/**
 * Call once per tick after detectCollisions()
 * Calls entity.collideWith(collisionsArray) exactly once per entity that had collisions.
 */
export function processCollisions() {
    for (const [entityId, contacts] of collisionsThisTick.entries()) {
        const entity = world.getEntityById(entityId);
        if (!entity || typeof entity.collideWith !== 'function') continue;

        // pass the array of collisions straight to the entity
        // each element: { other, normal, penetration, contactPoint }
        try {
            entity.collideWith(contacts);
        } catch (err) {
            console.error('collideWith error for', entityId, err);
        }
    }

    collisionsThisTick.clear();
}