class Player extends Entity {
  constructor(id, x = 0, y = 0, vx = 0, vy = 0) {
    super(id, x, y, false);
    this._vx = vx;
    this._vy = vy;
    this._baseSpeed = 200.0; // px/s
    this._sprite = new Sprite('assets/player_walking_spritesheet.png', 29, 8, 4, 20, true, false, 6, 28, 130, 232);
    this._direction = 'right';
  }


  get baseSpeed() {
    return this._baseSpeed;
  }

  get vx() {
    return this._vx;
  }

  get vy() {
    return this._vy;
  }

  get direction() {
    return this._direction;
  }

  draw() {
    if (this._vy !== 0 || this._vx !== 0) {
      if (this._vx < 0) {
        this._direction = 'left';
      } else if (this._vx > 0) {
        this._direction = 'right';
      }
      this._sprite.playing = true;
    }else {
      this._sprite.playing = false;
    }
    this._sprite.draw(this._x, this._y, this._direction, 0.04, 0.09);
  }

  update(x, y, vx, vy) {
    super.update(x, y);
    this._vx = vx;
    this._vy = vy;
  }
}