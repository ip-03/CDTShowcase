import { Spell } from './spell.js';

export class ProjectileSpell extends Spell {
    constructor(id, name, x = 0, y = 0, casterId, speed, direction, damage, range, cMask = { w: 0, h: 0 }, cMaskOffset = { x: 0, y: 0 }, effect = null) {
        super(id, name, x, y, cMask, cMaskOffset, direction, true, casterId, effect);
        this._speed = speed;
        this._direction = direction; // in radians
        this._damage = damage;
        this._range = range;
        this._distanceTraveled = 0;
        this._effect = effect;
    }

    collideWith(other, collision) {
        
    }

    integrate(dtMs) {
        this._x += Math.cos(this._direction) * this._speed * dtMs / 1000;
        this._y += Math.sin(this._direction) * this._speed * dtMs / 1000;
        this._distanceTraveled += this._speed * dtMs / 1000;
        if (this._distanceTraveled >= this._range) {
            this.destroy();
        }
    }
}