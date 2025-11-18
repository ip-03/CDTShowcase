function setup() {
  createCanvas(windowWidth, windowHeight);
  setupNetworking();
}

function draw() {
  background(255);
  updateWorld();
}
