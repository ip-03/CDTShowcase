export class Entity {
    constructor(id, x = 0, y = 0, type = 'entity', cMask = { w: 0, h: 0 }, cMaskOffset = { x: 0, y: 0 }, angle = 0) {
        this._id = id;
        this._x = x;
        this._y = y;
        this._type = type;
        this._angle = angle;

        this._cMask = cMask;
        this._cMaskOffset = cMaskOffset;
        //this._angle = angle;
    }

    get id() {
        return this._id;
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    get type() {
        return this._type;
    }

    getAABB() {
        let hw = this._cMask.w / 2;
        let hh = this._cMask.h / 2;
        return {
            minX: this._x - hw + this._cMaskOffset.x,
            minY: this._y - hh + this._cMaskOffset.y,
            maxX: this._x + hw + this._cMaskOffset.x,
            maxY: this._y + hh + this._cMaskOffset.y
        }
    }

    getOBB() {
        const cosA = Math.cos(this._angle);
        const sinA = Math.sin(this._angle);

        const rotatedOffsetX = this._cMaskOffset.x * cosA - this._cMaskOffset.y * sinA;
        const rotatedOffsetY = this._cMaskOffset.x * sinA + this._cMaskOffset.y * cosA;
        const centerX = this._x + rotatedOffsetX;
        const centerY = this._y + rotatedOffsetY;

        const axisX = { x: cosA,  y: sinA  };
        const axisY = { x: -sinA, y: cosA };

        return {
            center: { x: centerX, y: centerY },
            halfWidth: this._cMask.w / 2,
            halfHeight: this._cMask.h / 2,
            axisX: axisX,
            axisY: axisY
        };
    }
}