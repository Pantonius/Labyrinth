var canvas = document.querySelector('canvas');
canvas.width = 400;
canvas.height = 400;

var ctx = canvas.getContext('2d');

var grid = [];
var rows, columns;
var cellSize = 20;

var stack = [];

function toIndex(x, y) {
  if(x < 0 || y < 0 || x > columns-1 || y > rows-1) {
    return -1;
  }

  return x + y * columns;
}

class Wall {
  constructor(x, y, w, h) {
    this.visible = true;
    this.originX = x;
    this.originY = y;
    this.destX = w;
    this.destY = h;
  }

  draw() {
    if(this.visible) {
      ctx.beginPath();
      ctx.moveTo(this.originX, this.originY);
      ctx.lineTo(this.destX, this.destY);
      ctx.stroke();
    }
  }
}

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = cellSize;
    
    this.screenX = this.x * this.size;
    this.screenY = this.y * this.size;

    this.visited = false;

    this.walls = {
      top: new Wall(
        this.screenX,
        this.screenY,
        this.screenX + this.size,
        this.screenY
      ),
      right: new Wall(
        this.screenX + this.size,
        this.screenY,
        this.screenX + this.size,
        this.screenY + this.size
      ),
      bottom: new Wall(
        this.screenX,
        this.screenY + this.size,
        this.screenX + this.size,
        this.screenY + this.size
      ),
      left: new Wall(
        this.screenX,
        this.screenY,
        this.screenX,
        this.screenY + this.size
      )
    };
  }

  draw() {
    if(this.visited)
      ctx.fillStyle = '#9eb2fa'
    else
      ctx.fillStyle = '#424242';

    ctx.beginPath();
    ctx.rect(this.screenX, this.screenY, this.size, this.size);
    ctx.fill();

    ctx.strokeStyle = '#fff';
    this.walls.top.draw();
    this.walls.right.draw();
    this.walls.bottom.draw();
    this.walls.left.draw();
  }

  getNeighbours() {
    let top = grid[toIndex(this.x, this.y - 1)];
    let right = grid[toIndex(this.x + 1, this.y)];
    let bottom = grid[toIndex(this.x, this.y + 1)];
    let left = grid[toIndex(this.x - 1, this.y)];
    
    return [top, right, bottom, left];
  }
}

var current;
function init() {
  rows = Math.floor(canvas.height / cellSize);
  columns = Math.floor(canvas.width / cellSize);

  for(let y = 0; y < rows; y++) {
    for(let x = 0; x < columns; x++) {
      cell = new Cell(x, y);
      grid.push(cell);
    }
  }

  current = grid[0];
}

var drawCycle;
function draw() {
  drawCycle = requestAnimationFrame(draw);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  current.visited = true;
  
  let neighbours = current.getNeighbours();
  let possabilities = [];
  for(let i = 0; i < neighbours.length; i++) {
    if(neighbours[i] && !neighbours[i].visited)
      possabilities.push(neighbours[i]);
  }

  // IF CAN MOVE
  if(possabilities.length > 0) {
    let next = possabilities[Math.floor(Math.random() * possabilities.length)];
    
    // REMOVING WALLS
    let dX = current.x - next.x;
    if(dX > 0) {
      current.walls.left.visible = false;
      next.walls.right.visible = false;
    } else if(dX < 0) {
      current.walls.right.visible = false;
      next.walls.left.visible = false;
    }

    let dY = current.y - next.y;
    if(dY > 0) {
      current.walls.top.visible = false;
      next.walls.bottom.visible = false;
    } else if(dY < 0) {
      current.walls.bottom.visible = false;
      next.walls.top.visible = false;
    }

    // STEP
    current = next;
    stack.push(current);
  } else if(stack.length > 1) {
    stack.pop();
    current = stack[stack.length - 1];
  } else {
    window.cancelAnimationFrame(drawCycle);
  }

  for(let i = 0; i < grid.length; i++) {
    grid[i].draw();
  }
}

init();
draw();