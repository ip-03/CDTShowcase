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

  thisPlayer.vx = 0;
  thisPlayer.vy = 0;

  if (upKey) thisPlayer.vy -= thisPlayer.baseSpeed;
  if (downKey) thisPlayer.vy += thisPlayer.baseSpeed;
  if (leftKey) thisPlayer.vx -= thisPlayer.baseSpeed;
  if (rightKey) thisPlayer.vx += thisPlayer.baseSpeed;
  

  const input = {
    type: 'input',
    vx: thisPlayer.vx,
    vy: thisPlayer.vy
  };

  ws.send(JSON.stringify(input));
}