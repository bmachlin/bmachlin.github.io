final float KH = 50000;
final float KC_RESET = 89875.517873681764;
final float FDAMPING = 0.01;
final float VDAMPING = 0.95;
final int WALL_MASS = 10;
final int MOUSE_MASS = 10;
final float ATTRACT_DIST = width/5.0;
final float TICK = 1.0/60;

int nodesSize = 5;
Node[] nodes = new Node[10];
color highlightColor = color(111);
Node clickedNode = null;
boolean dragging = false;
float KC = KC_RESET;

float totalEnergy = 0;

// Runs on initial load
void setup()
{
	size(500, 500);
	nodes[0] = new Node(0, (int)random(5,15));
	nodes[1] = new Node(1, (int)random(5,15));
	nodes[2] = new Node(2, (int)random(5,15));
	nodes[3] = new Node(3, (int)random(5,15));
	nodes[4] = new Node(4, (int)random(5,15));

	//set node radii
	for(int i = 0; i < nodesSize; i++) {
		Node n = nodes[i];
		n.radius = (int) (12*sqrt(n.mass/PI));
	}
}

// Runs repeatedly until exit() is called.
void draw()
{ 
	background(50);
	fill(200);
	rect(50,50,50,50);

	//render nodes
	for(int i = 0; i < nodesSize; i++) {
		Node n = nodes[i];
		n.render(); 
		n.force.x = 0;
		n.force.y = 0;
	}
}

// Class and constructor for the ball.
class Ball {
	int x, y;
	int yV;
	int gravity;

	Ball(int initX, int initY) {
		x = initX;
		y = initY;
		yV = 1;
		gravity = 1;
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
  
  public void render() {
    // fix position if messed up
    if(Float.isNaN(pos.x))
      pos.x = random(width);
    if(Float.isNaN(pos.y))
      pos.y = random(height);
    
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
	rect(pos.x, pos.y, radius, radius);
    
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
    c = color((255+r)/2, (255+g)/2, (255+b)/2);
  }
}