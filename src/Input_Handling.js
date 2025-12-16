let upKey = false, downKey = false, leftKey = false, rightKey = false, mMoved = false, mLeftKey = false;

function keyPressed() {
  // p5 gives key as string; handle both uppercase and lowercase
  if (key === 'w' || key === 'W') upKey = true;
  if (key === 's' || key === 'S') downKey = true;
  if (key === 'a' || key === 'A') leftKey = true;
  if (key === 'd' || key === 'D') rightKey = true;
  sendInput();
}

function keyReleased() {
  if (key === 'w' || key === 'W') upKey = false;
  if (key === 's' || key === 'S') downKey = false;
  if (key === 'a' || key === 'A') leftKey = false;
  if (key === 'd' || key === 'D') rightKey = false;
  sendInput();
}

function mouseMoved() {
  mMoved = true;
  sendInput();
}

function mouseClicked() {
  if (mouseButton === LEFT) {
    mLeftKey = true;
  }
  sendInput();
  mLeftKey = false;
}

function sendInput() {
  if (!ws || ws.readyState !== WebSocket.OPEN || !camera) return;

  let dirX = 0;
  let dirY = 0;
  mMoved = false;

  if (upKey) dirY -= 1;
  if (downKey) dirY += 1;
  if (leftKey) dirX -= 1;
  if (rightKey) dirX += 1;

  const mouseCoords = camera.getMouseCoords();

  const input = {
    type: 'input',
    dirX: dirX,
    dirY: dirY,
    mouseX: mouseCoords.x,
    mouseY: mouseCoords.y,
    mouseLeft: mLeftKey
  };

  ws.send(JSON.stringify(input));
}