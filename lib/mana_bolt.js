import { events } from "./events.js";
import { ProjectileSpell } from "./projectile_spell.js";

export class ManaBolt extends ProjectileSpell {
    constructor(id, x, y, casterId, direction) {
        super(id, 'mana_bolt', x, y, casterId, 300, direction, 10, 1000, { w: 10, h: 10 }, { x: 0, y: 0 }, null);
    }

    collideWith(other, collision) {
        if (other.id !== this.casterId && other.type === 'player') {
            this.destroy();
            // Here you could also apply damage to the other player
        }else if (other.type === 'barrier') {
            this.destroy();
        }
    }
}