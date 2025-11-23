class Entity {
    constructor(id, x, y, type, visible = false) {
        if(new.target === Entity) {
            throw new TypeError("Cannot construct Entity instances directly");
        }

        this._id = id;
        this._type = type;
        this._x = x;
        this._y = y;
        this._visible = visible;
    }

    get id() {
        return this._id;
    }

    get type() {
        return this._type;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get visible() {
        return this._visible;
    }

    set visible(value) {
        this._visible = value;
    }

    update(x, y) {
        this._x = x;
        this._y = y;
    }

    draw() {
        throw new Error("Method 'draw()' must be implemented.");
    }
}