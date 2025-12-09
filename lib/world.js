import { CollisionHandler } from './collision_handler.js';
import { Barrier } from './barrier.js';

export class World {
    constructor(wWidth, wHeight) {
        this._width = wWidth;
        this._height = wHeight;
        this._entitiesById = new Map();

        this._collisionHandler = new CollisionHandler(this.getEntities());

        this.buildBarrierWalls();
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
    get collisionHandler() {
        return this._collisionHandler;
    }

    addEntity(entity) {
        this._entitiesById.set(entity.id, entity);
        this._collisionHandler.addEntity(entity);
    }
    removeEntity(id) {
        this._entitiesById.delete(id);
        this._collisionHandler.removeEntity(id);
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

    buildBarrierWalls() {
        let barrierCount = 0;
        for (let x = 0; x <= this._width; x += 64) this.addEntity(new Barrier(`b${barrierCount++}`, x, 0));
        for (let y = 64; y <= this._height - 64; y += 64) {
            this.addEntity(new Barrier(`b${barrierCount++}`, 0, y));
            this.addEntity(new Barrier(`b${barrierCount++}`, this._width, y));
        }
        for (let x = 0; x <= this._width; x += 64) this.addEntity(new Barrier(`b${barrierCount++}`, x, this._height));
    }
}