let thisPlayerId = null;

let serverTimeOffset = 0; // serverTime - localTime
const INTERPOLATION_DELAY = 50; // ms

class WorldState {
    constructor() {
        this._entitiesById = new Map();
        this._entitiesByType = new Map();
    }

    getEntities() {
        return Array.from(this._entitiesById.values());
    }

    addEntity(entity) {
        this._entitiesById.set(entity.id, entity);
        if (!this._entitiesByType.has(entity.type)) {
            this._entitiesByType.set(entity.type, new Set());
        }
        this._entitiesByType.get(entity.type).add(entity);
    }

    removeEntity(id) {
        const entity = this._entitiesById.get(id);
        if (entity) {
            this._entitiesById.delete(id);
            this._entitiesByType.get(entity.type).delete(entity);
        }
    }

    getEntityById(id) {
        return this._entitiesById.get(id) || null;
    }

    getEntitiesByType(type) {
        return this._entitiesByType.get(type) || new Set();
    }
}

class World extends WorldState {
    constructor(wWidth, wHeight) {
        super();
        this._width = wWidth;
        this._height = wHeight;
        this._worldStateSS = new Array();
    }

    get worldStateSS() {
        return this._worldStateSS;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    draw() {
        const now = performance.now();
        if (this._worldStateSS.length < 2) return;
        const renderTime = now - serverTimeOffset - INTERPOLATION_DELAY;

        let ss0 = null, ss1 = null;
        for (let i = this._worldStateSS.length - 1; i >= 0; i--) {
            const s = this._worldStateSS[i];
            if (s.time <= renderTime) {
                ss0 = s;
                ss1 = this._worldStateSS[i + 1] || s;
                break;
            }
        }
        if (!ss0) {
            ss0 = this._worldStateSS[0];
            ss1 = this._worldStateSS[1];
        }

        let t = 0;
        if (ss0 !== ss1) {
            t = (renderTime - ss0.time) / (ss1.time - ss0.time);
            t = constrain(t, 0, 1);
        }
        this._entitiesById.forEach((entity, id) => {
            let e0 = ss0.worldState.getEntityById(id);
            const e1 = ss1.worldState.getEntityById(id) || e0;

            if(!e0){
                return;
            }
            if(e0.removed){
                this.removeEntity(id);
                return;
            }

            const newX = lerp(e0.x, e1.x, t);
            const newY = lerp(e0.y, e1.y, t);

            switch (entity.type) {
                case 'player':
                    entity.update(newX, newY);
                    entity.facing = e1.facing;
                    break;
                case 'spell':
                    entity.update(newX, newY);
                    break;
                default:
                    entity.update(newX, newY);
                    break;
            }

            entity.draw();
        });
    }


}