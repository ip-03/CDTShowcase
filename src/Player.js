class Player {
  constructor(id, x = 0, y = 0) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.baseSpeed = 200.0; // px/s
    this.vx = 0;
    this.vy = 0;
    this.sprite = new Sprite('assets/player_walking_spritesheet.png', 29, 8, 4, 20, true, false, 6, 28, 130, 232);
    this.direction = 'right';
  }

  draw() {
    if (this.vy !== 0 || this.vx !== 0) {
      if (this.vx < 0) {
        this.direction = 'left';
      } else if (this.vx > 0) {
        this.direction = 'right';
      }
      this.sprite.playing = true;
    }else {
      this.sprite.playing = false;
    }
    this.sprite.draw(this.x, this.y, this.direction, 0.04, 0.09);
  }

  update(x, y) {
    this.x = x;
    this.y = y;
  }
}