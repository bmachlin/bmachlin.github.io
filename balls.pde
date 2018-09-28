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
final float VDAMPING = 0.92;
final int WALL_MASS = 10;
final float TICK = 1.0/90;

int nodesSize = 8;
Node[] nodes = new Node[nodesSize];

void setup() {
  size(screen.width,screen.height);

  int nodesSize = 8;
  for(int i = 0; i < nodesSize; i++) {
    nodes[i] = new Node(0, (int)random(5,15));
    nodes[i].radius = (int) (12*sqrt(nodes[i].mass/PI));
  }
  
}

void draw() {
  //background(backgroundColor());
  background(220,255,235);
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
        break;
        //n2 = new Node(-1, MOUSE_MASS);
        //n2.pos.set(mouseX, mouseY, 0);
      } else
        n2 = nodes[j];
      
      PVector unitVector = new PVector(n2.pos.x - n1.pos.x, n2.pos.y - n1.pos.y, 0);
      unitVector.mult(KC * n1.mass * n2.mass / n1.pos.dist(n2.pos) / unitVector.mag());
      
      if(!n2.equals(nearest(n1)))
        unitVector.mult(0.01);
      
      if(n1.attract(n2)) {
        unitVector.mult(-1);
      } else {
        unitVector.mult(250);
        n2.setColor();
        n1.setColor();
      }
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
  
  //update node values
  for(int i = 0; i < nodesSize; i++) {
    Node n = nodes[i];
     n.force.div(n.mass/FDAMPING);
     n.accel.set(n.force);
     n.accel.mult(TICK);
     n.velo.mult(VDAMPING);
     n.velo.add(n.accel);
     
     // sometimes n.velo.z is NaN, so we calculate magnitude manually
     float mag = sqrt(sq(n.velo.x)+sq(n.velo.y));
     
     PVector position = new PVector(n.velo.x*TICK + 0.5*n.accel.x*TICK*TICK, 
                                    n.velo.y*TICK + 0.5*n.accel.y*TICK*TICK);
     n.pos.add(position);
  
  }
}

Node nearest(Node n) {
  float dist = width+height;
  Node near = null;
  for(Node other : nodes) {
    if(!n.equals(other)) {
       if(n.pos.dist(other.pos) < dist) {
         dist = n.pos.dist(other.pos);
         near = other;
       } 
    }
  }
  return near;
}

color backgroundColor() {
  int r = 0;
  int b = 0;
  int g = 0;
  for(Node n : nodes) {
    r += red(n.c);
    g += green(n.c);
    b += blue(n.c);
  }
  int cr = 255*b/(r+b+g);
  int cg = 255*r/(r+b+g);
  int cb = 255*g/(r+g+b);
  
  return color(cr,cg,cb);
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
    
    noStroke();
    fill(c);

    ellipseMode(RADIUS);
    ellipse(pos.x, pos.y, radius, radius);
    
    float energy = 0.5*mass*sq(velo.mag());
    //if(energy > RECOLOR)
    //  setColor();
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