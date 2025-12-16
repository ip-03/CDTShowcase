import { Entity } from './entity.js';
import { world } from '../server.js';
import { events } from './events.js';

export class Spell extends Entity {
    constructor(id, name, x = 0, y = 0, cMask = { w: 0, h: 0 }, cMaskOffset = { x: 0, y: 0 }, angle = 0, dynamic, casterId, effect = null) {
        super(id, x, y, 'spell', cMask, cMaskOffset, angle, dynamic);
        this._name = name;
        this._casterId = casterId;
        this._effect = effect;
    }

    get name() {
        return this._name;
    }
    get casterId() {
        return this._casterId;
    }
    get effect() {
        return this._effect;
    }

    destroy() {
        world.removeEntity(this.id);
        events.emit('entity.removed', this.id);
    }
}