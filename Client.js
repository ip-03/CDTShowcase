let camera;

function setup() {
  createCanvas(windowWidth, windowHeight);
  smooth();
  setupNetworking();
  camera = new Camera();
}

function draw() {
  background(190);
  if (!thisPlayer) return;
  camera.update(thisPlayer.x, thisPlayer.y);
}
