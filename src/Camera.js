class Camera {
    constructor(x = 0, y = 0, lerpFactor = 0.1) {
        this._x = constrain(x, 0, worldWidth - windowWidth);
        this._y = constrain(y, 0, worldHeight - windowHeight);
        this._lerpFactor = lerpFactor;
    }
    
    update(x, y) {
        this._x = lerp(this._x, x - windowWidth/2, this._lerpFactor);
        this._y = lerp(this._y, y - windowHeight/2, this._lerpFactor);
        this._x = constrain(this._x, 0, worldWidth - windowWidth);
        this._y = constrain(this._y, 0, worldHeight - windowHeight);

        push();
        translate(-this._x, -this._y);
        updateWorld();
        pop();
    }

}