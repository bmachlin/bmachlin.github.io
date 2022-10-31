/*

Use a grid, rows, cols, divided etc.
Create irregular shapes that traverse, stopping with greater prob.
  as it strays from its origin
Do this until the whole grid is filled or some other stopping point
Draw the rects that make up the shapes irregularly somehow

*/

class Cell {

    constructor(x, y, id) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.c = color(random(150, 190));

        let posx = margin + x * cellWidth + (x - 1) * padding;
        let posy = margin + y * cellHeight + (y - 1) * padding;

        // define corners with some random variance
        this.tl = new p5.Vector(posx + random(-deform, deform),
            posy + random(-deform, deform));
        this.tr = new p5.Vector(posx + cellWidth + random(-deform, deform),
            posy + random(-deform, deform));
        this.bl = new p5.Vector(posx + random(-deform, deform),
            posy + cellHeight + random(-deform, deform));
        this.br = new p5.Vector(posx + cellWidth + random(-deform, deform),
            posy + cellHeight + random(-deform, deform));
    }

    render(test = false) {
        strokeWeight(1);

        if (test) {
            noFill();
            stroke(200);
            quad(this.tl.x, this.tl.y,
                this.tr.x, this.tr.y,
                this.br.x, this.br.y,
                this.bl.x, this.bl.y);
            return;
        }

        // // don't draw empty cells
        // if(this.id == 0)
        //   return;

        fill(this.c);
        noStroke();
        quad(this.tl.x, this.tl.y,
            this.tr.x, this.tr.y,
            this.br.x, this.br.y,
            this.bl.x, this.bl.y);
    }
}

let sketchName = "grid-shapes";
let cnv, rows, cols, cellHeight, cellWidth, padding, margin, deform, maxDistance, maxSize;
let nextId = 1;
let grid;

function setup() {
    cnv = createCanvas(500, 500);
    cnv.id(sketchName + "-canvas");
    activate();
}

function activate() {
    grid = [];
    rows = Math.floor(getSliderValue(document.querySelector("#rowsInput"), 10));
    cols = Math.floor(getSliderValue(document.querySelector("#colsInput"), 10));
    deform = Math.floor(getSliderValue(document.querySelector("#deformInput"), 2));
    fps = Math.floor(getSliderValue(document.querySelector("#fpsInput"), 2));
    margin = 20;
    padding = 5;
    cellHeight = (height - (margin * 2) - ((rows - 2) * padding)) / rows;
    cellWidth = (width - (margin * 2) - ((cols - 2) * padding)) / cols;
    maxDistance = (rows + cols) / 4;
    // maxSize = (rows+cols)/4;
    maxSize = 10000;

    frameRate(fps);
}

function reset() { activate(); }

function draw() {
    activate();
    background(175, 153, 131);
    grid = [];

    for (let i = 0; i < cols; i++) {
        grid[i] = [];
        for (let j = 0; j < rows; j++) {
            grid[i].push(new Cell(i, j, 0));
        }
    }

    for (i = 0; i < cols; i++) {
        for (j = 0; j < rows; j++) {
            let r = random(1);
            if (r < 0.3) {
                createShape(i, j);
            }
        }
    }

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j].render();
        }
    }
}

///////////////////////

function createShape(x, y) {
    // print("create shape", x , y, nextId);
    let origin = grid[x][y];

    if (origin.id != 0)
        return;

    origin.id = nextId++;
    origin.c = color(random(100, 150), random(255), random(30, 40));
    spread(x, y, origin, 1);
}

function spread(x, y, origin, count) {
    let cell = grid[x][y];

    // copy origin properties and align with neighbors
    cell.id = origin.id;
    cell.c = origin.c;
    attachCorners(cell);

    if (count >= maxSize) {
        return;
    }

    let moves = [];
    // decide what direction to explore
    if (inBounds(x, y - 1) && grid[x][y - 1].id == 0)
        moves.push(grid[x][y - 1]);
    if (inBounds(x, y + 1) && grid[x][y + 1].id == 0)
        moves.push(grid[x][y + 1]);
    if (inBounds(x - 1, y) && grid[x - 1][y].id == 0)
        moves.push(grid[x - 1][y]);
    if (inBounds(x + 1, y) && grid[x + 1][y].id == 0)
        moves.push(grid[x + 1][y]);

    if (moves.length == 0)
        return;

    let m = random(moves);
    let distance = pow(m.x - origin.x, 2) + pow(m.y - origin.y, 2);
    let explore = map(distance, 0, maxDistance, 0, 1, true);

    if (distance > 0 && !(m.x == x && m.y == y) && random(1) > explore) { // explore!
        spread(m.x, m.y, origin, count + 1);
    }
}

function attachCorners(cell) {
    let x = cell.x;
    let y = cell.y;

    if (inBounds(x, y - 1) && grid[x][y - 1].id == cell.id) {
        let up = grid[x][y - 1];
        cell.tl.x = up.bl.x;
        cell.tr.x = up.br.x;
        cell.tl.y = up.bl.y;// + padding;
        cell.tr.y = up.br.y;// + padding;
    }

    if (inBounds(x, y + 1) && grid[x][y + 1].id == cell.id) {
        let down = grid[x][y + 1];
        cell.bl.x = down.tl.x;
        cell.br.x = down.tr.x;
        cell.bl.y = down.tl.y;// - padding;
        cell.br.y = down.tr.y;// - padding;
    }

    if (inBounds(x - 1, y) && grid[x - 1][y].id == cell.id) {
        let left = grid[x - 1][y];
        cell.tl.x = left.tr.x;// + padding;
        cell.bl.x = left.br.x;// + padding;
        cell.tl.y = left.tr.y;
        cell.bl.y = left.br.y;
    }

    if (inBounds(x + 1, y) && grid[x + 1][y].id == cell.id) {
        let right = grid[x + 1][y];
        cell.tr.x = right.tl.x;// - padding;
        cell.br.x = right.bl.x;// - padding;
        cell.tr.y = right.tl.y;
        cell.br.y = right.bl.y;
    }
}


/* HELPERS */

function inBounds(x, y) {
    return (x < cols && x >= 0 && y < rows && y >= 0);
}

function keyPressed() {
    if (key == 'g') {
        print(grid);
    }
}

function mouseReleased() {
    if(!isLooping()) {
        if (mouseX >= 0 && mouseX <= width && mouseY >=0 && mouseY <= height)
            draw();
    }
}