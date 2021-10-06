const map = [
  'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w',
  'w', '_', '_', '_', '_', 'w', '_', '_', '_', 'w',
  'w', '_', '_', '_', '_', 'w', '_', '_', '_', 'w',
  'w', 'w', 'w', '_', '_', 'w', '_', '_', '_', 'w',
  'w', '_', '_', '_', '_', '_', '_', '_', '_', 'w',
  'w', '_', '_', '_', '_', 'w', '_', '_', '_', 'w',
  'w', '_', '_', '_', '_', '_', '_', '_', '_', 'w',
  'w', '_', '_', '_', '_', '_', '_', '_', '_', 'w',
  'w', '_', '_', '_', '_', '_', '_', '_', '_', 'w',
  'w', 'w', 'w', 'w', 'w', 'w', 'w', 'w', '_', 'w'
]

class Player {
  constructor(pos, dir) {
    this.pos = pos
    this.dir = p5.Vector.normalize(dir)
  }

  draw() {
    fill('red')
    circle(this.pos.x, this.pos.y, 10)
    stroke('red')
    strokeWeight(3)
    line(this.pos.x, this.pos.y, this.pos.x + 20*this.dir.x, this.pos.y + 20*this.dir.y)
  }
}

let player

function index(x, y) {
  return y * 10 + x
}

function updatePlayer() {
  if (keyIsDown(LEFT_ARROW)) {
    player.dir.rotate(-0.1)
  }
  if (keyIsDown(RIGHT_ARROW)) {
    player.dir.rotate(0.1)
  }
  if (keyIsDown(UP_ARROW)) {
    player.pos.add(p5.Vector.mult(player.dir, 2.0))
  }
  if (keyIsDown(DOWN_ARROW)) {
    player.pos.sub(p5.Vector.mult(player.dir, 2.0))
  }
}

function drawMap2D() {
  for (let y=0; y<10; y++) {
    for (let x=0; x<10; x++) {
      let tile = map[index(x, y)]
      if (tile === 'w') {
        fill(255)
      }
      else {
        fill(80)
      }
      stroke('black')
      strokeWeight(1)
      rect(32*x % 320, 32*y, 32, 32)
    }
  }
}

function raycast(pos, dir) {
  // current pos within tile
  let tilePos = createVector(pos.x % 32, pos.y % 32)
  
  let dirX = Math.sign(dir.x)
  let dirY = Math.sign(dir.y)

  // distance from pos within tile to next tile in ray's direction
  let dx = 32.0 - tilePos.x
  let dy = 32.0 - tilePos.y
  if (dirX === -1) dx = tilePos.x
  if (dirY === -1) dy = tilePos.y
  
  // first vertical hitpoint
  let firstVerticalX = pos.x + dirX*dx
  let m = dir.y / dir.x
  let firstVerticalY = pos.y + dirX*m*dx
  let firstVerticalHitpoint = createVector(firstVerticalX, firstVerticalY)

  // first horizontal hitpoint
  let firstHorizontalY = pos.y + dirY*dy
  let mHorizontal = dir.x / dir.y
  let firstHorizontalX = pos.x + dirY*mHorizontal*dy
  let firstHorizontalHitpoint = createVector(firstHorizontalX, firstHorizontalY)

  const MAX_RAY_LENGTH = 1000.0
  let currentLength = 0.0
  
  
  // draw first and subsequent vertical hitpoints
  let i = 0
  while (currentLength < MAX_RAY_LENGTH) {
    console.log(currentLength)
    strokeWeight(0)
    if (firstVerticalHitpoint.mag() < firstHorizontalHitpoint.mag()) {
      fill('orange')
      circle(firstVerticalHitpoint.x, firstVerticalHitpoint.y, 7)
      text(i, firstVerticalHitpoint.x, firstVerticalHitpoint.y)
      firstVerticalHitpoint.x += dirX*32.0
      firstVerticalHitpoint.y += dirX*m*32.0
      currentLength = firstVerticalHitpoint.mag()
    }
    else {
      fill('magenta')
      circle(firstHorizontalHitpoint.x, firstHorizontalHitpoint.y, 7)
      text(i, firstHorizontalHitpoint.x, firstHorizontalHitpoint.y)
      firstHorizontalHitpoint.x += dirY*mHorizontal*32.0
      firstHorizontalHitpoint.y += dirY*32.0
      currentLength = firstHorizontalHitpoint.mag()
    }
    strokeWeight(1)
    stroke('yellow')
    i++
  }
}

function setup() {
  // put setup code here
  frameRate(30)

  createCanvas(640, 600)

  player = new Player(createVector(110.0, 100.0), createVector(1.0, 1.0))
}

function draw() {
  background(0)

  updatePlayer()
  drawMap2D()
  player.draw()
  raycast(player.pos, player.dir)
}