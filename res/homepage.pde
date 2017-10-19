/*
 * Force-Directed Node-Link Physics Engine
 * 
 * Ben Machlin & Dani Kupfer
 * October 2017
 *
 */


final float KH = 50000;
final float KC_RESET = 89875.517873681764;
final float FDAMPING = 0.01;
final float VDAMPING = 0.92;
final int WALL_MASS = 10;
final int MOUSE_MASS = 10;
final float ATTRACT_DIST = width/5.0;
final float TICK = 1.0/60;

int nodesSize = 8;
Node[] nodes = new Node[nodesSize];
color highlightColor = color(111);
Node clickedNode = null;
boolean dragging = false;
float KC = KC_RESET;

float totalEnergy = 0;


/* 
 * Node class
 *
 * Represents a Node in a treemap
 * 
 * Ben Machlin & Dani Kupfer
 * September 2017
 */
 


void setup() {
  size(1200,600);

  nodes[0] = new Node(0, (int)random(5,15));
  nodes[1] = new Node(1, (int)random(5,15));
  nodes[2] = new Node(2, (int)random(5,15));
  nodes[3] = new Node(3, (int)random(5,15));
  nodes[4] = new Node(4, (int)random(5,15));
  nodes[5] = new Node(5, (int)random(5,15));
  nodes[6] = new Node(6, (int)random(5,15));
  nodes[7] = new Node(7, (int)random(5,15));

  
  //set node radii
  for(int i = 0; i < nodesSize; i++) {
    Node n = nodes[i];
    n.radius = (int) (12*sqrt(n.mass/PI));
  }
  
}

//int test = 0;
void draw() {
  background(240);
  
  //render nodes
  for(int i = 0; i < nodesSize; i++) {
    Node n = nodes[i];
    n.rend(); 
    n.force.x = 0;
    n.force.y = 0;
  }
  
  
  
  applyCoulomb();
  applyWallForce();
  updatePhysicsValues();
}

// apply Coulomb's Law: f = k/d^2
void applyCoulomb() {
  
  for(int i = 0; i < nodesSize; i++) {
    Node n1 = nodes[i];
    for(int j = i+1; j <= nodesSize; j++) {
      Node n2;
      if(j == nodesSize) {
        n2 = new Node(-1, MOUSE_MASS);
        n2.pos.set(mouseX, mouseY, 0);
      } else
        n2 = nodes[j];
      
      PVector unitVector = new PVector(n2.pos.x - n1.pos.x, n2.pos.y - n1.pos.y, 0);
      unitVector.mult(KC * n1.mass * n2.mass / n1.pos.dist(n2.pos) / unitVector.mag());
      
      
      if(n1.attract(n2)) {
        unitVector.mult(-1);
      } else
        unitVector.mult(250);
      n2.force.add(unitVector);
      unitVector.mult(-1);
      n1.force.add(unitVector);
      
    }
  }
  
}

void applyWallForce() {
  for(int i = 0; i < nodesSize; i++) {
    Node n = nodes[i];
    float dL = n.pos.x;
    float dR = width - n.pos.x;
    float dT = n.pos.y;
    float dB = height - n.pos.y;
    
    float FX = KC * n.mass * WALL_MASS / dL - KC * n.mass * WALL_MASS / dR; 
    float FY = KC * n.mass * WALL_MASS / dT - KC * n.mass * WALL_MASS / dB; 
    
    n.force.add(FX,FY,0);
  }
}

//updates the acceleration, velocity and position of the nodes
void updatePhysicsValues() {

  totalEnergy = 0;
  
  //update node values
  for(int i = 0; i < nodesSize; i++) {
    Node n = nodes[i];
    if(!n.equals(clickedNode)) {
     n.force.div(n.mass/FDAMPING);
     n.accel.set(n.force);
     n.accel.mult(TICK);
     n.velo.mult(VDAMPING);
     n.velo.add(n.accel);
     
     // sometimes n.velo.z is NaN, so we calculate magnitude manually
     float mag = sqrt(sq(n.velo.x)+sq(n.velo.y));
     totalEnergy += (mag * mag * 0.5 * n.mass);
     
     PVector position = new PVector(n.velo.x*TICK + 0.5*n.accel.x*TICK*TICK, n.velo.y*TICK + 0.5*n.accel.y*TICK*TICK);
     n.pos.add(position);
    }
  }
}

class Node {
  
  final int RECOLOR = 1000000;
  
  int id = -1;
  float mass = 0;
  int radius = 0;
  color c;
  
  
  PVector pos = new PVector(random(width), random(height));
  PVector velo = new PVector(0,0);
  PVector accel = new PVector(0,0);
  PVector force = new PVector(0,0);
  
  public Node(int id, int val) {
    this.id = id;
    mass = val;
    setColor();
  }
  
  public void rend() {
    // fix position if messed up
    /*if(Float.isNaN(pos.x))
      pos.x = random(width);
    if(Float.isNaN(pos.y))
      pos.y = random(height);*/
    
    // boundary checking
    if(pos.x < radius) {
      pos.x = radius;
      velo.x = 0;
      accel.x = 0;
    }
    if(pos.x > width-radius) {
      pos.x = width-radius;
      velo.x = 0;
      accel.x = 0;
    }
    if(pos.y < radius) {
      pos.y = radius;
      velo.y = 0;
      accel.y = 0;
    }
    if(pos.y > height-radius) {
      pos.y = height-radius;
      velo.y = 0;
      accel.y = 0;
    }
    
    velo.z = 0;
    
    stroke(0);
    strokeWeight(2);
    noStroke();
    fill(c);

    ellipseMode(RADIUS);
    ellipse(pos.x, pos.y, radius, radius);
    
    float energy = 0.5*mass*sq(velo.mag());
    if(energy > RECOLOR)
      setColor();
  }
  
  void reset() {
    velo.set(0,0,0);
    accel.set(0,0,0);
  }
  
  boolean attract(Node other) {
    return (pos.dist(other.pos) >= radius + other.radius - 1);
  }
  
  String toString() {
    return "Id: " + id + ", mass: " + mass;
  }
  
  void setColor() {
    int r = (int) random(256);
    int g = (int) random(256);
    int b = (int) random(256);
    c = color((222+r)/2, (222+g)/2, (222+b)/2);
  }
}