/*

Use a grid
Create one or more paths with smartly connected components

1. Create several intersection types
2. Define how they all connect to each other
3. Build a grid that contains one or more paths of connected intersections
4. Fill the rest of the grid with whatever

*/



function randomIType() {
    return Object.keys(ITypes)[Math.floor(Math.random()*Object.keys(ITypes).length)];
}

class Intersection {
    constructor(x, y, c) {
        this.x = x;
        this.y = y;
        this.c = c;
    }

    render(test = false) {
        push();
        translate(this.x * cellWidth, this.y * cellHeight);

        fill(this.c);
        noStroke();

        rect(0, cellHeight*0.4, cellWidth, cellHeight*0.2);
        rect(cellWidth*0.4, 0, cellWidth*0.2, cellHeight);

        pop();
    }
}

class Pattern {
    constructor(x, y, c) {
        this.x = x;
        this.y = y;
        this.c = c;
    }

    render(test = false) {
        push();
        translate(this.x * cellWidth, this.y * cellHeight);

        fill(this.c);
        noStroke();

        ellipse(cellWidth / 2, cellHeight / 2, cellWidth / 2, cellHeight / 2);

        pop();
    }

}

let sketchName = "grid-shapes";
let cnv, rows, cols, cellHeight, cellWidth;
let nextId = 1;
let gridInt, gridPat;

function setup() {
    cnv = createCanvas(500, 500);
    cnv.id(sketchName + "-canvas");
    activate();
}

function activate() {
    gridInt = [];
    gridPat = [];
    rows = Math.floor(getSliderValue(document.querySelector("#rowsInput"), 10));
    cols = Math.floor(getSliderValue(document.querySelector("#colsInput"), 10));
    deform = Math.floor(getSliderValue(document.querySelector("#deformInput"), 2));
    fps = Math.floor(getSliderValue(document.querySelector("#fpsInput"), 2));
    margin = 20;
    padding = 5;
    cellHeight = height / rows;
    cellWidth = width / cols;
    maxDistance = (rows + cols) / 4;
    // maxSize = (rows+cols)/4;
    maxSize = 10000;

    frameRate(fps);
    // noLoop();
}

function reset() { activate(); }

function draw() {
    activate();
    background(75);
    gridInt = [];
    gridPat = [];

    for (let i = 0; i < cols; i++) {
        gridPat[i] = [];
        gridInt[i] = [];
        for (let j = 0; j < rows; j++) {
            let c = color(random(120, 220), random(100, 200), random(30, 90));
            gridPat[i].push(new Pattern(i, j, c));
            gridInt[i].push(new Intersection(i, j, c));
        }
    }

    // for (i = 0; i < cols; i++) {
    //     for (j = 0; j < rows; j++) {
    //         let r = random(1);
    //         if (r < 0.3) {
    //             createShape(i, j);
    //         }
    //     }
    // }

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            gridInt[i][j].render();
            gridPat[i][j].render();
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
    if (!isLooping()) {
        if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height)
            draw();
    }
}