class ManaBolt extends Spell {
    constructor(id, x, y, angle) {
        super(id, x, y, 'spell', angle);
    }
    
    draw() {
        push();
        //rotate(this._angle);
        fill(0, 0, 255);
        ellipse(this._x, this._y, 10, 10);
        pop();
    }
}