import { Entity } from './entity.js';

export class Barrier extends Entity {
    constructor(id, x = 0, y = 0) {
        super(id, x, y, 'barrier', { w: 64, h: 64 }, { x: 0, y: 0 }, 0);
    }
}