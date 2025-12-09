let upKey = false, downKey = false, leftKey = false, rightKey = false, mMoved = false;

function keyPressed() {
  // p5 gives key as string; handle both uppercase and lowercase
  if (key === 'w' || key === 'W') upKey = true;
  if (key === 's' || key === 'S') downKey = true;
  if (key === 'a' || key === 'A') leftKey = true;
  if (key === 'd' || key === 'D') rightKey = true;
  sendKBInput();
}

function keyReleased() {
  if (key === 'w' || key === 'W') upKey = false;
  if (key === 's' || key === 'S') downKey = false;
  if (key === 'a' || key === 'A') leftKey = false;
  if (key === 'd' || key === 'D') rightKey = false;
  sendKBInput();
}

function mouseMoved() {
  mMoved = true;
  sendMInput();
}

function sendKBInput() {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  let dirX = 0;
  let dirY = 0;
  if (upKey) dirY -= 1;
  if (downKey) dirY += 1;
  if (leftKey) dirX -= 1;
  if (rightKey) dirX += 1;

  const input = {
    type: 'kbInput',
    dirX: dirX,
    dirY: dirY
  };

  ws.send(JSON.stringify(input));
}

function sendMInput() {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  mMoved = false;

  const input = {
    type: 'mInput',
    mouseX: mouseX,
    mouseY: mouseY
  };

  ws.send(JSON.stringify(input));
}