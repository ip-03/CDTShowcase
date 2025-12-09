class Barrier extends Entity {
    constructor(id, x, y, width, height, visible = true) {
        super(id, x, y, 'barrier', visible);
        this._width = width;
        this._height = height;
    }

    draw() {
        if (!this._visible) return;
        push();
        rectMode(CENTER);
        strokeJoin(ROUND);

        // outer border
        stroke(20);
        strokeWeight(3);
        noFill();
        rect(this._x, this._y, this._width, this._height, 6);

        // main body
        noStroke();
        fill(40); // dark grey barrier
        rect(this._x, this._y, this._width - 6, this._height - 6, 4);

        // subtle top highlight
        noStroke();
        fill(255, 255, 255, 30);
        rect(this._x, this._y - this._height * 0.12, this._width - 12, this._height * 0.4, 4);

        // subtle bottom shadow
        fill(0, 60);
        rect(this._x, this._y + this._height * 0.12, this._width - 12, this._height * 0.4, 4);

        pop();
    }
}