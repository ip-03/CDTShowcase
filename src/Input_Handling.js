let upKey = false, downKey = false, leftKey = false, rightKey = false;

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

function sendInput() {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  if (!thisPlayer) return;

  thisPlayer.update(thisPlayer.x, thisPlayer.y, 0, 0);
  thisPlayer.update(thisPlayer.x, thisPlayer.y, 0, 0);

  let dirX = 0;
  let dirY = 0;
  if (upKey) dirY -= 1;
  if (downKey) dirY += 1;
  if (leftKey) dirX -= 1;
  if (rightKey) dirX += 1;
  if (dirX !== 0 || dirY !== 0) {
    const length = Math.hypot(dirX, dirY);
    dirX /= length;
    dirY /= length;
    thisPlayer.update(thisPlayer.x, thisPlayer.y, dirX * thisPlayer.baseSpeed, dirY * thisPlayer.baseSpeed);
  }
  

  const input = {
    type: 'input',
    vx: thisPlayer.vx,
    vy: thisPlayer.vy
  };

  ws.send(JSON.stringify(input));
}