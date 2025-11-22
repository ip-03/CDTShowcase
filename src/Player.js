class Player {
  constructor(id, x = 0, y = 0) {
    this._id = id;
    this._x = x;
    this._y = y;
    this._baseSpeed = 200.0; // px/s
    this._vx = 0;
    this._vy = 0;
    this._sprite = new Sprite('assets/player_walking_spritesheet.png', 29, 8, 4, 20, true, false, 6, 28, 130, 232);
    this._direction = 'right';
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

  get baseSpeed() {
    return this._baseSpeed;
  }

  get vx() {
    return this._vx;
  }
  set vx(value) {
    this._vx = value;
  }

  get vy() {
    return this._vy;
  }
  set vy(value) {
    this._vy = value;
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

  update(x, y, vx = 0, vy = 0) {
    this._x = x;
    this._y = y;
    this._vx = vx;
    this._vy = vy;
  }
}