
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
final float TICK = 1.0/150;

int numBalls = 10;
Node[] balls = new Node[numBalls];

void setup() {
  size(screen.width, screen.height);
  for(int i = 0; i < numBalls; i++) {
    balls[i] = new Node(i, (int)random(5,15));
    balls[i].radius = (int) (12*sqrt(balls[i].mass/PI));
  }
  
}

void draw() {
  //background(backgroundColor());
  background(220,255,235);
  //render balls
  for(int i = 0; i < numBalls; i++) {
    Node n = balls[i];
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
  
  for(int i = 0; i < numBalls; i++) {
    Node b1 = balls[i];
    for(int j = i+1; j <= numBalls; j++) {
      Node b2;
      if(j == numBalls) {
        break;
        //b2 = new Node(-1, MOUSE_MASS);
        //b2.pos.set(mouseX, mouseY, 0);
      } else
        b2 = balls[j];
      
      PVector unitVector = new PVector(b2.pos.x - b1.pos.x, b2.pos.y - b1.pos.y, 0);
      unitVector.mult(KC * b1.mass * b2.mass / b1.pos.dist(b2.pos) / unitVector.mag());
      
      if(!b1.touching(b2)) {
        if (!b1.lastTouched.equals(b2))
          unitVector.mult(-1);
        else
          unitVector.mult(2);
      } else {
        unitVector.mult(1000);
        b1.lastTouched = b2;
        b2.lastTouched = b1;
        b2.setColor();
        b1.setColor();
      }
      b2.force.add(unitVector);
      unitVector.mult(-1);
      b1.force.add(unitVector);
      
    }
  }
  
}

void applyWallForce() {
  for(int i = 0; i < numBalls; i++) {
    Node b = balls[i];
    float dL = b.pos.x;
    float dR = width - b.pos.x;
    float dT = b.pos.y;
    float dB = height - b.pos.y;
    
    float FX = KC * b.mass * WALL_MASS / dL - KC * b.mass * WALL_MASS / dR; 
    float FY = KC * b.mass * WALL_MASS / dT - KC * b.mass * WALL_MASS / dB; 
    
    b.force.add(FX,FY,0);
  }
}

//updates the acceleration, velocity and position of the balls
void updatePhysicsValues() {
  
  //update node values
  for(int i = 0; i < numBalls; i++) {
    Node b = balls[i];
     b.force.div(b.mass/FDAMPING);
     b.accel.set(b.force);
     b.accel.mult(TICK);
     b.velo.mult(VDAMPING);
     b.velo.add(b.accel);
     
     // sometimes b.velo.z is NaN, so we calculate magnitude manually
     float mag = sqrt(sq(b.velo.x)+sq(b.velo.y));
     
     PVector position = new PVector(b.velo.x*TICK + 0.5*b.accel.x*TICK*TICK, 
                                    b.velo.y*TICK + 0.5*b.accel.y*TICK*TICK);
     b.pos.add(position);
  
  }
}

Node nearest(Node b) {
  float dist = width+height;
  Node near = null;
  for(Node other : balls) {
    if(!b.equals(other)) {
       if(b.pos.dist(other.pos) < dist) {
         dist = b.pos.dist(other.pos);
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
  for(Node ball : balls) {
    r += red(ball.c);
    g += green(ball.c);
    b += blue(ball.c);
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
  Node lastTouched;
  
  
  PVector pos = new PVector(random(width), random(height));
  PVector velo = new PVector(0,0);
  PVector accel = new PVector(0,0);
  PVector force = new PVector(0,0);
  
  public Node(int id, int val) {
    this.id = id;
    mass = val;
    lastTouched = this;
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
    fill(0);
    
    //float energy = 0.5*mass*sq(velo.mag());
    //if(energy > RECOLOR)
    //  setColor();
  }
  
  void reset() {
    velo.set(0,0,0);
    accel.set(0,0,0);
  }
  
  boolean touching(Node other) {
    return (pos.dist(other.pos) < radius + other.radius - 1);
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