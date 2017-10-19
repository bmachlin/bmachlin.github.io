/*
 * Force-Directed Node-Link Physics Engine
 * 
 * Ben Machlin & Dani Kupfer
 * October 2017
 *
 */


final float KH = 50000;
final float KC = 89875.517873681764;
final float FDAMPING = 0.01;
final float VDAMPING = 0.95;
final int WALL_MASS = 10;
final int MOUSE_MASS = 10;
final float RECOLOR = 2000000;
final float TICK = 1.0/2000;

int nodesSize = 5;
int[] nodes = new int[nodesSize];
int[] mass = new int[nodesSize];
int[] radius = new int[nodesSize];
PVector[] pos = new PVector[nodesSize];
PVector[] acc = new PVector[nodesSize];
PVector[] vel = new PVector[nodesSize];
PVector[] frc = new PVector[nodesSize];
color[] col = new color[nodesSize];


float totalEnergy = 0;

void setup() {
  size(1200,600);
  frameRate(60);

  newNode(0, (int)random(5,15));
  newNode(1, (int)random(5,15));
  newNode(2, (int)random(5,15));
  newNode(3, (int)random(5,15));
  newNode(4, (int)random(5,15));
  
}

//int test = 0;
void draw() {
  background(240);
  
  //render nodes
  for(int i = 0; i < nodesSize; i++) {
    
    rend(i); 
    frc[i].x = 0;
    frc[i].y = 0;
  }
  
  
  
  applyCoulomb();
  applyWallForce();
  updatePhysicsValues();
}

// apply Coulomb's Law: f = k/d^2
void applyCoulomb() {
  
  for(int i = 0; i < nodesSize; i++) {
    for(int j = i+1; j < nodesSize; j++) {
      float dis = pos[i].dist(pos[j]);
      PVector unitVector = new PVector(pos[j].x - pos[i].x, pos[j].y - pos[i].y, 0);
      unitVector.mult(KC * mass[i] * mass[j] / dis / unitVector.mag());
      
      
      if(dis > radius[i]+radius[j]) {
        unitVector.mult(-1);
      } else
        unitVector.mult(100);
      frc[j].add(unitVector);
      unitVector.mult(-1);
      frc[i].add(unitVector);
      
    }
  }
  
}

void applyWallForce() {
  for(int i = 0; i < nodesSize; i++) {
    
    float dL = pos[i].x;
    float dR = width - pos[i].x;
    float dT = pos[i].y;
    float dB = height - pos[i].y;
    
    float FX = KC * mass[i] * WALL_MASS / dL - KC * mass[i] * WALL_MASS / dR; 
    float FY = KC * mass[i] * WALL_MASS / dT - KC * mass[i] * WALL_MASS / dB; 
    
    frc[i].add(FX,FY,0);
  }
}

//updates the acceleration, velocity and position of the nodes
void updatePhysicsValues() {

  totalEnergy = 0;
  
  //update node values
  for(int i = 0; i < nodesSize; i++) {
    frc[i].mult(FDAMPING/mass[i]);
    acc[i].set(frc[i]);
    vel[i].mult(VDAMPING);
    acc[i].mult(TICK)
    vel[i].add(acc[i]);
    
    // sometimes vel[i].z is NaN, so we calculate magnitude manually
    float mag = sqrt(sq(vel[i].x)+sq(vel[i].y));
    totalEnergy += (mag * mag * 0.5 * mass[i]);
    
    PVector position = new PVector(vel[i].x*TICK + 0.5*acc[i].x*TICK*TICK, vel[i].y*TICK + 0.5*acc[i].y*TICK*TICK);
    pos[i].add(position);
  }
}

color setColor() {
  int r = (int) random(256);
  int g = (int) random(256);
  int b = (int) random(256);
  return color((255+r)/2, (255+g)/2, (255+b)/2);
}
 
void newNode(int id, int val) {
  nodes[id] = 1;
  mass[id] = val;
  radius[id] = (int) (12*sqrt(val/PI));
  pos[id] = new PVector(random(width), random(height),0);
  vel[id] = new PVector(0,0,0);
  acc[id] = new PVector(0,0,0);
  frc[id] = new PVector(0,0,0);
  col[id] = setColor();
}

void rend(int i) {
  // fix position if messed up
  /*if(Float.isNaN(pos[i].x))
    pos[i].x = random(width);
  if(Float.isNaN(pos[i].y))
    pos[i].y = random(height);*/
  
  // boundary checking
  if(pos[i].x < radius[i]) {
    pos[i].x = radius[i];
    vel[i].x = 0;
    acc[i].x = 0;
  }
  if(pos[i].x > width-radius[i]) {
    pos[i].x = width-radius[i];
    vel[i].x = 0;
    acc[i].x = 0;
  }
  if(pos[i].y < radius[i]) {
    pos[i].y = radius[i];
    vel[i].y = 0;
    acc[i].y = 0;
  }
  if(pos[i].y > height-radius[i]) {
    pos[i].y = height-radius[i];
    vel[i].y = 0;
    acc[i].y = 0;
  }
  
  vel[i].z = 0;
  
  stroke(0);
  strokeWeight(2);
  noStroke();
  fill(col[i]);

  ellipseMode(RADIUS);
  ellipse(pos[i].x, pos[i].y, radius[i], radius[i]);
  
  float energy = 0.5*mass[i]*sq(vel[i].mag());
  if(energy > RECOLOR)
    setColor();
}
