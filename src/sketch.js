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

function screenspaceToTilespace(pos) {
  // let tileX = pos.x / 32.0
  // tileX = tileX - Math.floor(tileX)
  // tileX *= 32.0
  // let tileY = pos.y / 32.0
  // tileY = tileY - Math.floor(tileY)
  // tileY *= 32.0

  return { x: pos.x % 32.0, y: pos.y % 32.0 }
}

// Converts a pixel position to a tilenumber
function screenspaceToTilenumber(pos) {
  let tileX = Math.floor(pos.x / 32.0)
  let tileY = Math.floor(pos.y / 32.0)

  return { x: tileX, y: tileY }
}

function raycast(pos, dir) {
  // current pos within tile
  let tilePos = screenspaceToTilespace(pos)

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
  let closestHitpoint = createVector(0.0, 0.0)
  let testTile = screenspaceToTilenumber(pos)

  // draw first and subsequent vertical hitpoints
  let i = 0
  while (p5.Vector.sub(closestHitpoint, pos).mag() < MAX_RAY_LENGTH) {

    strokeWeight(0)
    fill('orange')

    if (p5.Vector.sub(firstVerticalHitpoint, pos).mag() < p5.Vector.sub(firstHorizontalHitpoint, pos).mag()) {
      // fill('orange')
      // circle(firstVerticalHitpoint.x, firstVerticalHitpoint.y, 7)
      // text(i, firstVerticalHitpoint.x, firstVerticalHitpoint.y)
      closestHitpoint = createVector(firstVerticalHitpoint.x, firstVerticalHitpoint.y)
      firstVerticalHitpoint.x += dirX*32.0
      firstVerticalHitpoint.y += dirX*m*32.0
      testTile.x += dirX
    }
    else {
      // fill('magenta')
      // circle(firstHorizontalHitpoint.x, firstHorizontalHitpoint.y, 7)
      // text(i, firstHorizontalHitpoint.x, firstHorizontalHitpoint.y)
      closestHitpoint = createVector(firstHorizontalHitpoint.x, firstHorizontalHitpoint.y)
      firstHorizontalHitpoint.x += dirY*mHorizontal*32.0
      firstHorizontalHitpoint.y += dirY*32.0
      testTile.y += dirY
    }

    // fill('cyan')
    // circle(closestHitpoint.x, closestHitpoint.y, 4)

    // check if wall is hit
    
    if (map[index(testTile.x, testTile.y)] === 'w') {
      fill('red')
      // rect(32*testTile.x % 320, 32*testTile.y, 32, 32)
      return closestHitpoint
    }

    // fill('cyan')
    // text(i, closestHitpoint.x, closestHitpoint.y)
    
    // strokeWeight(1)
    // stroke('yellow')
    i++
  }

  return closestHitpoint
}

function setup() {
  // put setup code here
  frameRate(30)

  createCanvas(640, 600)

  player = new Player(createVector(110.0, 100.0), createVector(1.0, 1.0))
}

function debugRays() {
  let dir = createVector(player.dir.x, player.dir.y).normalize()
  let  i = 0
  for (let a=-50.0; a < 50.0; a += 0.1) {
    let rDir = p5.Vector.rotate(dir, radians(a))
    rDir.normalize()
    let hit = raycast(player.pos, rDir)
    strokeWeight(1)
    stroke('yellow')
    line(player.pos.x, player.pos.y, hit.x, hit.y)
    fill('cyan')
    strokeWeight(0)
    rect(hit.x-2.5, hit.y-2.5, 5, 5)
    i++
  }

  // let hit = raycast(player.pos, dir)
  // strokeWeight(1)
  // stroke('yellow')
  // line(player.pos.x, player.pos.y, hit.x, hit.y)
}

function draw() {
  background(0)

  updatePlayer()
  drawMap2D()
  player.draw()
  // raycast(player.pos, player.dir)
  debugRays()
}