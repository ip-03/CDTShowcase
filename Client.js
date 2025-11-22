function setup() {
  createCanvas(windowWidth, windowHeight);
  setupNetworking();
}

function draw() {
  background(200);
  updateWorld();
}
