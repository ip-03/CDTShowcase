export class Entity {
    constructor(id, x, y, type = 'entity', cMask = { w: 0, h: 0 }, cMaskOffset = { x: 0, y: 0 }, angle = 0, dynamic) {
        this._id = id;
        this._x = x;
        this._y = y;
        this._type = type;
        this._angle = angle;
        this._dynamic = dynamic;

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
    set x(value) {
        this._x = value;
    }
    get y() {
        return this._y;
    }
    set y(value) {
        this._y = value;
    }
    get type() {
        return this._type;
    }
    get dynamic() {
        return this._dynamic;
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