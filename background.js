let canvas, agents, overlap, rows, cols, rowSize, colSize;

class Agent {

  constructor(x, y, l, w) {
    this.l = l;
    this.w = w;
    this.c = randomColor();
    this.x = x;
    this.y = y;
    this.vel = new p5.Vector(0, 0, 0);
    this.acc = new p5.Vector(0, 0, 0);
  }

  render() {
    fill(red(this.c), green(this.c), blue(this.c), 20)
    noStroke();
    
    rect(this.x - overlap, this.y - overlap, this.w + overlap*2, this.l + overlap*2);
  }
  
  update() {
    let r = red(this.c) + this.vel.x;
    let g = green(this.c) + this.vel.y;
    let b = blue(this.c) + this.vel.z;
    this.c = color(r,g,b);
    
    this.vel.add(this.acc);
    this.acc.x += random(-5, 5);
    this.acc.y += random(-5, 5);
    this.acc.z += random(-5, 5);
  }

}

function setup() {
  canvas = createCanvas((displayWidth+100), (displayHeight+100));
  canvas.position(0,0);
  canvas.style("display", "block");
  canvas.style("z-index", "-1");
  overlap = 0;
  
  rows = 5;
  cols = 5;
  rowSize = (height) / rows;
  colSize = (width) / cols;
  
  agents = [];
  for (let r = 0; r < rows*cols; r++) {
    agents.push(new Agent(0,0,0,0));
  }
  resizeAgents();
  
  frameRate(10);
}

function draw() {
  background(200, 200);

  for (let a of agents) {
    a.render();
    a.update();
  }

}


function randomColor() {
  let colors = [
    color(12, 67, 200),
    color(56, 134, 155),
    color(100, 40, 140)
  ];
  
  return colors[floor(random(colors.length))];
}


function windowResized() {
  resizeCanvas((displayWidth+100), (displayHeight+100));
  rowSize = (displayHeight+100) / rows;
  colSize = (displayWidth+100) / cols;
  resizeAgents();
}

function resizeAgents() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let a = agents[r*cols + c];
      a.x = r*colSize;
      a.y = c*rowSize;
      a.w = colSize;
      a.l = rowSize;
    }
  }
}