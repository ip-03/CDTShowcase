// p5.js rewrite of Client/main.pde
// Assumptions:
// - Server behavior is the same: websocket at ws://localhost:4000 sends JSON messages
//   with types: "assignId" { playerId } and "state" { players: [ {id,x,y}, ... ] }
// - We create/update players from server state; inputs are sent as {type: 'input', vx, vy}

let thisPlayer = null;
let thisPlayerId = null;
const players = {}; // map id -> Player
let ws = null;
let connected = false;

let up = false, down = false, leftKey = false, rightKey = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  // connect websocket
  ws = new WebSocket('ws://localhost:4040');

  ws.onopen = () => {
    console.log('Connected!');
    connected = true;
  };

  ws.onmessage = (evt) => {
    console.log('Received:', evt.data);
    let json;
    try {
      json = JSON.parse(evt.data);
    } catch (e) {
      console.warn('Warning: failed to parse incoming message as JSON');
      return;
    }

    const type = json.type;
    if (!thisPlayerId && type === 'assignId') {
      thisPlayerId = json.playerId;
      return;
    }

    if (type === 'state') {
      const playersJson = json.players || [];
      // replace players map with new Player objects (mirrors Processing sketch behavior)
      for (let i = 0; i < playersJson.length; i++) {
        const pJson = playersJson[i];
        const id = pJson.id;
        const x = pJson.x;
        const y = pJson.y;

        // create or update
        if (!players[id]) {
          players[id] = new Player(id, x, y);
        } else {
          players[id].x = x;
          players[id].y = y;
        }

        if (id === thisPlayerId) {
          // keep a reference to the player representing this client
          thisPlayer = players[id];
        }
      }

      // remove any players not present in state
      const idsInState = new Set(playersJson.map(p => p.id));
      for (const id in players) {
        if (!idsInState.has(id)) delete players[id];
      }
    }
  };

  ws.onclose = (evt) => {
    console.log('Closed:', evt.reason || evt);
    connected = false;
  };

  ws.onerror = (err) => {
    console.error('WebSocket error', err);
  };
}

function draw() {
  background(255);
  const dt = deltaTime / 1000.0; // p5 deltaTime is ms
  for (const id in players) {
    players[id].draw(dt);
  }
}

class Player {
  constructor(id, x = 0, y = 0) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.baseSpeed = 200.0; // px/s
    this.vx = 0;
    this.vy = 0;
  }

  draw(dt) {
    fill(255, 0, 0);
    ellipse(this.x, this.y, 50, 50);
    this.update(dt);
  }

  update(deltaTime) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
  }
}

function keyPressed() {
  // p5 gives key as string; handle both uppercase and lowercase
  if (key === 'w' || key === 'W') up = true;
  if (key === 's' || key === 'S') down = true;
  if (key === 'a' || key === 'A') leftKey = true;
  if (key === 'd' || key === 'D') rightKey = true;
  sendInput();
}

function keyReleased() {
  if (key === 'w' || key === 'W') up = false;
  if (key === 's' || key === 'S') down = false;
  if (key === 'a' || key === 'A') leftKey = false;
  if (key === 'd' || key === 'D') rightKey = false;
  sendInput();
}

function sendInput() {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  if (!thisPlayer) return; // no local player yet

  thisPlayer.vx = 0;
  thisPlayer.vy = 0;

  if (up) thisPlayer.vy -= thisPlayer.baseSpeed;
  if (down) thisPlayer.vy += thisPlayer.baseSpeed;
  if (leftKey) thisPlayer.vx -= thisPlayer.baseSpeed;
  if (rightKey) thisPlayer.vx += thisPlayer.baseSpeed;

  const input = {
    type: 'input',
    vx: thisPlayer.vx,
    vy: thisPlayer.vy
  };

  ws.send(JSON.stringify(input));
}
