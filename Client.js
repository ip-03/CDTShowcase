let camera;
let world;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  smooth();
  try {
    await setupNetworking();
  } catch (err) {
    console.error('Failed to setup networking:', err);
  }
  camera = new Camera();
}

function draw() {
  background(190);
  if (!camera) return;
  camera.update(world.getEntityById(thisPlayerId).x, world.getEntityById(thisPlayerId).y);
  text('fps: ' + nf(frameRate(), 2, 2), 10, 20);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}