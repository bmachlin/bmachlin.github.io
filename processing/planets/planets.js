let sketchName = "planets";
let cnv;
let numPlanets;
let stars;
let inputElem;
let starsAngle = 0;
let fps = 30;


class Moon {

  constructor(planet, id) {
    this.id = id;
    this.infront = random(1) < 0.5;
    this.intransit = true;
    this.planet = planet;

    this.R = random(this.planet.R / 20, this.planet.R / 5); // base radius
    this.r = this.R;

    this.min = -planet.r - this.r;
    this.max = planet.r + this.r;

    this.pos = int(random(this.min + 1, this.max));
    this.vel = random(6/fps, 30/fps);

    this.col = color(random(0, 255), random(50, 255), random(255));
  }

  render() {
    noStroke();
    fill(this.col);
    ellipse(int(this.pos), 0, this.r, this.r);
  }

  update() {
    let mult = this.infront ? 1 : -1;

    if ((this.pos <= this.min || this.pos >= this.max) && this.intransit) {
      this.intransit = false;
      this.infront = !this.infront;
    } else if (this.pos > this.min && this.pos < this.max) {
      this.intransit = true;
    }

    this.pos += mult * this.vel;

    // scale radius to match moon's 'distance'
    if (this.infront)
      this.r = this.R * map(abs(this.pos), 0, (this.max - this.min) / 2, 1.2, 1);
    else
      this.r = this.R * map(abs(this.pos), 0, (this.max - this.min) / 2, 0.8, 1);
  }

}

class Planet {
  constructor(id, radius, x, y, numMoons) {
    this.init(id, radius, x, y, numMoons);
  }

  init(id, radius, x, y, numMoons) {
    this.id = id;
    this.numMoons = numMoons;
    this.R = radius;
    this.r = radius;
    this.col = color(random(0, 255), random(50, 255), random(255));

    this.x = x;
    this.y = y;
    this.xvel = random(-50 / fps, 50 / fps);
    this.yvel = random(-50 / fps, 50 / fps);

    this.moonAngle = random(0, TAU);
    this.moonAngleVel = random(-TAU / fps / 10, TAU / fps / 10);
    this.moons = [];
    for (let i = 0; i < numMoons; i++) {
      this.moons.push(new Moon(this, i));
    }
  }

  render() {
    push();
    translate(this.x, this.y);
    
    // shadow
    rotate(starsAngle);
    noStroke();
    fill(0, 100);
    ellipse(this.r * 1.2, this.r * 1.2, this.r, this.r);
    rotate(-starsAngle);
    
    rotate(this.moonAngle);

    // moons behind
    this.moons.forEach((m) => { if(!m.infront) m.render(); });

    // planet
    noStroke();
    fill(this.col);
    ellipse(0, 0, this.r, this.r);
    
    // moons in front
    this.moons.forEach((m) => { if(m.infront) m.render(); });


    pop();
  }

  update() {
    this.x += this.xvel;
    this.y += this.yvel;

    if (random(1) < 1 / fps) {
      this.moonAngle += this.moonAngleVel;
    }

    this.moons.forEach((m) => m.update());

    if (this.outOfBounds())
      this.reset();
  }

  reset() {
    let x = 0;
    let y = 0;
    let side = int(random(4));
    switch(int(random(4))) {
      case 0: //top
        x = random(width);
        y = -this.R * 2;
        break;
      case 1: //right
        x = width + this.R * 2;
        y = random(height);
        break;
      case 2: //bottom
        x = random(width);
        y = height + this.R * 2;
        break;
      case 3: //left
        x = -this.R * 2;
        y = random(height);
        break;
    }
    this.init(this.id, this.R, x, y, int(random(1, 8)));
  }

  outOfBounds() {
    return (this.x + this.r * 2.5 < 0 ||
      this.x - this.r * 2.5 > width ||
      this.y + this.r * 2.5 < 0 ||
      this.y - this.r * 2.5 > height);
  }
}

function NewPlanet(id) {
  return new Planet(id, random(width / 50, width / 20),
  random(0, width), random(0, height),
  int(random(1, 8)));
}

function setup() {
  cnv = createCanvas(500, 500);
  cnv.id(sketchName + "-canvas");
  ellipseMode(RADIUS);
  frameRate(fps);
  activate();
}

function activate() {
  inputElem = document.querySelector("#planetsInput");
  planets = [];
  stars = [];
  numPlanets = getSliderValue(inputElem, 10);

  for (let i = 0; i < numPlanets; i++) {
    planets.push(NewPlanet(i));
  }
  
  for(let x = -width*1.5; x < width*1.5; x += width/50) {
    for(let y = -height*1.5; y < height*1.5; y += height/50) {
      if (random(1) < 0.1) {
        stars.push(new p5.Vector(x+random(-10,10), y+random(-10,10)));
        stars.push(new p5.Vector(random(1,2), random(1,2)));
        stars.push(color(random(175,255), random(175,255), random(175,255)));
      }
    }
  }
}

function reset() { activate(); }

function draw() {
  background(0);
  
  push();
  rotate(starsAngle);
  starsAngle += 1/fps/TAU/10;
  for(let i = 0; i < stars.length-2; i+= 3) {
    fill(stars[i+2]);
    ellipse(stars[i].x, stars[i].y, stars[i+1].x, stars[i+1].y);
  }
  pop();

  numPlanets = getSliderValue(inputElem, 10);
  adjustPlanetPopulation();
  for (let p of planets) {
    p.render();
    p.update();
  }
}

function adjustPlanetPopulation() {
  if (numPlanets == planets.length) return;
  if (numPlanets < 0) numPlanets = 0;

  if (numPlanets > planets.length) {
    while (numPlanets > planets.length) {
      planets.push(NewPlanet(planets.length));
    }
  }
  else if (numPlanets < planets.length) {
    while (numPlanets < planets.length) {
      planets.splice(Math.floor(Math.random()*planets.length), 1);
    }
  }
}