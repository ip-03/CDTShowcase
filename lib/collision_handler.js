import { events } from './events.js';
import * as utils from './utils.js';

export class CollisionHandler {
    constructor(entities) {
        this._entities = new Set(entities) || new Set();
    }

    addEntity(entity) {
        this._entities.add(entity);
    }

    removeEntity(id) {
        const entity = Array.from(this._entities).find(e => e.id === id);
        if (entity) this._entities.delete(entity);
    }

    buildGrid() {
        const cellSize = 64;
        const grid = new Map();

        for (const entity of this._entities) {
            let aabb = entity.getAABB();
            const minCellX = Math.floor(aabb.minX / cellSize);
            const maxCellX = Math.floor(aabb.maxX / cellSize);
            const minCellY = Math.floor(aabb.minY / cellSize);
            const maxCellY = Math.floor(aabb.maxY / cellSize);

            for (let cx = minCellX; cx <= maxCellX; cx++) {
                for (let cy = minCellY; cy <= maxCellY; cy++) {
                    const key = `${cx},${cy}`;
                    let cell = grid.get(key);
                    if (!cell) {
                        cell = [];
                        grid.set(key, cell);
                    }
                    //if (!entity.id.startsWith('b')) console.log(`Adding entity ${entity.id} to cell ${key}`);
                    cell.push({ id: entity.id, obb: entity.getOBB() });
                }
            }
        }
        return grid;
    }

    broadPhase() {
        const grid = this.buildGrid();
        //console.log(grid.get("0,0"));
        const potentialCollisions = [];

        const checked = new Set();

        for (const cell of grid.values()) {
            if (cell.length < 2) continue;
            for (let i = 0; i < cell.length; i++) {
                for (let j = i + 1; j < cell.length; j++) {
                    const idA = cell[i].id;
                    const idB = cell[j].id;
                    const pairKey = idA < idB ? `${idA},${idB}` : `${idB},${idA}`;
                    if (!checked.has(pairKey)) {
                        if (!idA.startsWith('b') || !idB.startsWith('b')) potentialCollisions.push([cell[i], cell[j]]);
                        checked.add(pairKey);
                    }
                }
            }
        }
        return potentialCollisions;
    }

    projectRadius(obb, axis) {
        const halfWidth = obb.halfWidth;
        const halfHeight = obb.halfHeight;

        const dotX = utils.dot(obb.axisX, axis);
        const dotY = utils.dot(obb.axisY, axis);

        return halfWidth * Math.abs(dotX) + halfHeight * Math.abs(dotY);
    }

    detectCollisions() {
        const potentialCollisions = this.broadPhase();
        if (potentialCollisions.length === 0) return;

        const collisions = [];
        
        outerPairLoop:
        for (const [entityA, entityB] of potentialCollisions) {
            const axes = [
                entityA.obb.axisX,
                entityA.obb.axisY,
                entityB.obb.axisX,
                entityB.obb.axisY
            ];

            let minOverlap = Infinity;
            let smallestAxis = null;
            let axisSign = 1;

            for(let i = 0; i < axes.length; i++) {
                const axis = utils.normalize(axes[i]);

                const centerA = utils.dot(entityA.obb.center, axis);
                const centerB = utils.dot(entityB.obb.center, axis);
                const radiusA = this.projectRadius(entityA.obb, axis);
                const radiusB = this.projectRadius(entityB.obb, axis);

                const distance = centerB - centerA;
                const absDistance = Math.abs(distance);
                const overlap = radiusA + radiusB - absDistance;

                if (overlap <= 0) {
                    continue outerPairLoop; // No collision on this axis
                }

                if (overlap < minOverlap) {
                    minOverlap = overlap;
                    smallestAxis = axis;
                    axisSign = distance < 0 ? -1 : 1;
                }
            }

            const normal = {
                x: smallestAxis.x * axisSign,
                y: smallestAxis.y * axisSign
            };

            const radiusA = this.projectRadius(entityA.obb, normal);
            const radiusB = this.projectRadius(entityB.obb, normal);

            const pointA = {
                x: entityA.obb.center.x + normal.x * radiusA,
                y: entityA.obb.center.y + normal.y * radiusA
            };

            const pointB = {
                x: entityB.obb.center.x - normal.x * radiusB,
                y: entityB.obb.center.y - normal.y * radiusB
            };

            const contactPoint = {
                x: (pointA.x + pointB.x) / 2,
                y: (pointA.y + pointB.y) / 2
            };

            collisions.push({
                idA: entityA.id,
                idB: entityB.id,
                normal: normal,
                penetration: minOverlap,
                contactPoint: contactPoint
            });
                    
        }
        for (const c of collisions) {
            events.emit('collisions', c);
        }
    }
}