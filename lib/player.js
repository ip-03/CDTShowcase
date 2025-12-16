import { world } from '../server.js';
import { Entity } from './entity.js';
import { events } from './events.js';
import { ManaBolt } from './mana_bolt.js';
import crypto from 'crypto';

export class Player extends Entity {
    constructor(id, x = 0, y = 0, vx = 0, vy = 0) {
        super(id, x, y, 'player', { w: 20, h: 48 }, { x: 0, y: 0 }, 0, true);
        this._vx = vx;
        this._vy = vy;
        this._facing = 'right';
        this._attackSpell = ManaBolt;
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

    castAttackSpell(mouseX, mouseY) {
        const originX = this._x + (this._facing === 'right' ? 8 : -8);
        const originY = this._y - 4;
        const spell = new this._attackSpell(
            `s${crypto.randomUUID()}`,
            originX,
            originY,
            this._id,
            Math.atan2(mouseY - originY, mouseX - originX)
        );
        world.addEntity(spell);
        events.emit('entity.spawned', spell);
        console.log(`Player ${this._id} cast spell ${spell.id} toward (${mouseX}, ${mouseY})`);
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