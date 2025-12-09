import { Entity } from './entity.js';
import { events } from './events.js';

export class Player extends Entity {
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

        let oldX = this._x;
        let oldY = this._y;

        this._x += (this._vx || 0) * dtMs / 1000;
        this._y += (this._vy || 0) * dtMs / 1000;

        if (this._x !== oldX || this._y !== oldY) {
            events.emit('player.moved', { id: this.id, x: this._x, y: this._y, facing: this._facing });
        }
    }

    collideWith(collisions) {
        if (!Array.isArray(collisions) || collisions.length === 0) return;

        // Sum MTVs for barrier contacts
        let shiftX = 0;
        let shiftY = 0;
        let hadBarrier = false;
        for (const c of collisions) {
            if (!c || !c.normal || typeof c.penetration !== 'number') continue;
            const other = c.other || { type: 'unknown' };
            if (other.type === 'barrier') {
                // per-contact shift for THIS entity is -normal * penetration
                shiftX += -c.normal.x * c.penetration;
                shiftY += -c.normal.y * c.penetration;
                hadBarrier = true;
            }
            // other entity types may be handled later
        }

        if (hadBarrier) {
            // apply a single combined translation
            this._x += shiftX;
            this._y += shiftY;

            // compute combined normal and remove inward velocity component so we don't re-penetrate
            const mag = Math.hypot(shiftX, shiftY);
            if (mag > 0) {
                const nx = shiftX / mag;
                const ny = shiftY / mag;
                const velAlong = this._vx * nx + this._vy * ny;
                // velAlong < 0 means velocity has a component into the correction direction (moving into barriers)
                if (velAlong < 0) {
                    this._vx -= velAlong * nx;
                    this._vy -= velAlong * ny;
                }
            }

            events.emit('player.moved', { id: this.id, x: this._x, y: this._y, facing: this._facing });
        }

        // If you want to handle non-barrier collisions (pushable objects, triggers), iterate collisions and react per-contact.
    }
}