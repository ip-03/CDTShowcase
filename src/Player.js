class Player {
  constructor(id, x = 0, y = 0) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.baseSpeed = 200.0; // px/s
    this.vx = 0;
    this.vy = 0;
  }

  draw() {
    fill(255, 0, 0);
    ellipse(this.x, this.y, 50, 50);
  }

  update(x, y) {
    this.x = x;
    this.y = y;
  }
}