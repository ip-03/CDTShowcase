import { Entity } from './entity.js';
import { events } from './events.js';

export class Player extends Entity {
    constructor(id, x = 0, y = 0, vx = 0, vy = 0) {
        super(id, x, y, 'player', { w: 20, h: 48 }, { x: 0, y: 0 }, 0, true);
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
        this._x += (this._vx || 0) * dtMs / 1000;
        this._y += (this._vy || 0) * dtMs / 1000;
    }

    collideWith(other, collision) {
        
    }

    setFacing(mouseX) {
        const oldFacing = this._facing;
        if (mouseX < this._x) {
            this._facing = 'left';
        } else {
            this._facing = 'right';
        }
        if (oldFacing !== this._facing) {
            events.emit('entity.attribute.changed', this.id, 'facing', this._facing);
        }
    }
}