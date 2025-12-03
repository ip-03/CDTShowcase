class Player extends Entity {
  constructor(id, x = 0, y = 0) {
    super(id, x, y, 'player', false);

    this._sprite = new Sprite('assets/player_walking_spritesheet.png', 29, 8, 4, 20, true, false, 6, 28, 130, 242, 3.5, -7);
    this._facing = 'right';
  }

  get facing() {
    return this._facing;
  }
  set facing(value) {
    this._facing = value;
  }

  draw() {
    this._sprite.draw(this._x, this._y, this._facing, 0.36, 0.3);
    fill(0);
    noStroke();
    ellipse(this._x, this._y, 5, 5);
    stroke(0);
    fill(0, 255, 255, 77);
    rect(this._x - 10, this._y - 24, 20, 48);
  }

  update(x, y) {
    let oldX = this._x;
    let oldY = this._y;
    super.update(x, y);
    if (this._x !== oldX || this._y !== oldY) {
      this._sprite.playing = true;
    } else {
      this._sprite.playing = false;
    }
  }
}