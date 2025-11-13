Player player;

void setup() {
  size(800, 600);
  player = new Player();
  player.x = width / 2;
  player.y = height / 2;
}

void draw() {
  background(255);
  player.draw();
  float dT = 1.0 / frameRate;
  player.update(dT);
}

class Player {
  String id;
  float x;
  float y;
  float baseSpeed = 200.0; // px/s
  float vx;
  float vy;

  void draw() {
    fill(255, 0, 0);
    ellipse(x, y, 50, 50);
  }

  void update(float deltaTime) {
    x += vx * deltaTime;
    y += vy * deltaTime;
  }
}

void keyPressed() {
  if (key == 'w') {
    player.vy = -player.baseSpeed;
  } else if (key == 's') {
    player.vy = player.baseSpeed;
  } else if (key == 'a') {
    player.vx = -player.baseSpeed;
  } else if (key == 'd') {
    player.vx = player.baseSpeed;
  }
}

void keyReleased() {
  if (key == 'w' || key == 's') {
    player.vy = 0;
  } else if (key == 'a' || key == 'd') {
    player.vx = 0;
  }
}