class Intersection {
    constructor(x, y, id) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.itype = 0;
        this.c = color(random(255), 0, random(255));
    }

    render(basic = false) {

        push();
        translate(this.x * colSize, this.y * rowSize);


        fill(this.c);
        noStroke();

        if (basic) {
            rect(0, 0, colSize, rowSize);
            this.itype = 0;
        } else {
            this.itype = pickType(this.x, this.y);
        }

        switch (this.itype) {
            case 0:
                rect(0, 0, colSize, rowSize);
                break;
            case 1:
                triangle(colSize, 0, 0, rowSize, 0, 0);
                break;
            case 2:
                triangle(colSize, 0, 0, rowSize, colSize, rowSize);
                break;
            case 3:
                triangle(0, 0, colSize, rowSize, colSize, 0);
                break;
            case 4:
                triangle(0, 0, colSize, rowSize, 0, rowSize);
                break;
            case 5:
                ellipse(colSize / 2, rowSize / 2, colSize / 2, rowSize / 2);
                break;
        }
        pop();
    }

    getNeighborTypes() {

    }
}

let sketchName = "purple-intersections";
let rows, cols, rowSize, colSize, fps, cnv;
let numTypes = 6;
let isecs;

function setup() {
    cnv = createCanvas(500, 500);
    cnv.id(sketchName + "-canvas");
    angleMode(DEGREES);
    activate();
}

function activate() {
    rows = Math.floor(getSliderValue(document.querySelector("#rowsInput"), 10));
    cols = Math.floor(getSliderValue(document.querySelector("#colsInput"), 10));
    fps = Math.floor(getSliderValue(document.querySelector("#fpsInput"), 2));
    isecs = [];
    rowSize = height / rows;
    colSize = width / cols;
    numIsecs = rows * cols;

    for (var i = 0; i < numIsecs; i++) {
        isecs.push(new Intersection(Math.floor(i / rows), i % rows, i));
    }
    frameRate(fps);
    background(220);
}

function reset() { activate(); }

function draw() {
    activate();
    background(220);
    for (let sec of isecs) {
        sec.render();
    }
}

function getI(x, y) {
    return isecs[x * cols + y];
}

function getInd(x, y) {
    return x * cols + y;
}

function inBounds(x, y) {
    return (x < cols && x >= 0 && y < rows && y >= 0);
}

function pickType(x, y) {
    return Math.floor(random(0, numTypes));
}

function mouseReleased() {
    if(!isLooping()) {
        if (mouseX >= 0 && mouseX <= width && mouseY >=0 && mouseY <= height)
            draw();
    }
}