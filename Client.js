let camera;
let world;

window.addEventListener('load', () => {
  setupNetworking().catch(err => {
    console.error('Failed to setup networking:', err);
  });
});

async function setup() {
  createCanvas(windowWidth, windowHeight);
  smooth();
}

function draw() {
  background(190);
  if (!camera || !world || !world.getEntityById(thisPlayerId)) return;
  camera.update(world.getEntityById(thisPlayerId).x, world.getEntityById(thisPlayerId).y);
  text('fps: ' + nf(frameRate(), 2, 2), 10, 20);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}