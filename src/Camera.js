class Camera {
    constructor(wWidth, wHeight, x = 0, y = 0, lerpFactor = 0.1) {
        this._x = constrain(x, 0, wWidth - windowWidth);
        this._y = constrain(y, 0, wHeight - windowHeight);
        this._lerpFactor = lerpFactor;
        this._wWidth = wWidth;
        this._wHeight = wHeight;
    }

    getMouseCoords() {
        return { x: this._x + mouseX, y: this._y + mouseY };
    }
    
    update(x, y) {
        //console.log('Camera x:', this._x, 'y:', this._y, 'player x:', x, 'y:', y);
        this._x = lerp(this._x, x - windowWidth/2, this._lerpFactor);
        this._y = lerp(this._y, y - windowHeight/2, this._lerpFactor);
        this._x = constrain(this._x, 0, this._wWidth - windowWidth);
        this._y = constrain(this._y, 0, this._wHeight - windowHeight);

        push();
        translate(-this._x, -this._y);
        world.draw();
        pop();
    }

}