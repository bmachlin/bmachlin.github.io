let sketchName = "shape-shapes";
let cnv;
let numDots;
let dots;
let margin = 30;
let fps = 10;
let date = new Date();
let seed = date.getTime();
let saveLoop = false;

class Line {
    constructor(m, bx, y) {
        this.m = m;
        this.b = y == null ? bx : y - m * bx;
        this.xint = -this.b / m;
        this.yint = this.b;
    }

    getY(x) {
        return this.m * x + this.b;
    }
    getX(y) {
        return (y - this.b) / this.m;
    }
    inX(x) {
        return x >= 0 && x < width;
    }
    inY(y) {
        return y >= 0 && y < height;
    }
    isect(other) {
        let x = (other.b - this.b) / (this.m - other.m);
        let y = this.getY(x);
        return createVector(x, y);
    }

    render() {
        strokeWeight(1);
        stroke(240);

        let xBeg = -this.b / this.m;           // x when y is 0
        let xEnd = (height - this.b) / this.m; // x when y is height
        let yBeg = this.b;                     // y when x is 0
        let yEnd = this.m * width + this.b;    // y when x is width
        xBeg = round(xBeg, 0);
        xEnd = round(xEnd, 0);
        yBeg = round(yBeg, 0);
        yEnd = round(yEnd, 0);

        let hits = this.inX(xBeg) + this.inX(xEnd) + this.inY(yBeg) + this.inY(yEnd);
        if (hits == 2) {
            let points = []
            if (this.inX(xBeg)) {
                points.push(createVector(xBeg, 0));
            }
            if (this.inX(xEnd)) {
                points.push(createVector(xEnd, height));
            }
            if (this.inY(yBeg)) {
                points.push(createVector(0, yBeg));
            }
            if (this.inY(yEnd)) {
                points.push(createVector(width, yEnd));
            }
            line(points[0].x, points[0].y, points[1].x, points[1].y);
        } else {
            print("line outside canvas");
            print(this);
        }
    }
}

class Cell {

    constructor(id, x, y) {
        this.id = id;
        this.col = color(random(100, 255), random(100, 255), random(100, 255));

        this.x = x;
        this.y = y;
        this.mPoints = [];
        this.mLines = []; // lines orth to midpoint with other dots
        for (let i = 0; i < numDots; i++) {
            this.mLines.push(null);
            this.mPoints.push(null);
        }
        this.closest = [];
    }

    calcClosest(num) {
        // create array of dists matching dot id
        this.closest = [];
        let dists = []
        for (let i = 0; i < numDots; i++) {
            dists.push(dist(this.x, this.y, dots[i].x, dots[i].y));
        }
        dists[this.id] = width * height;
        let distsCopy = [...dists];
        // sort dists and pick ids by their distance
        dists.sort((a, b) => a - b);
        for (let i = 0; i < num; i++) {
            this.closest.push(distsCopy.indexOf(dists[i]));
        }
        this.sortClosest()
    }

    // sort closest like a clock
    sortClosest() {
        if (this.closest.length <= 3)
            return;
        // calc center
        let minx = width, maxx = 0, miny = height, maxy = 0;
        for (let i = 0; i < this.closest.length; i++) {
            let dot = dots[this.closest[i]];
            if (dot.x < minx) minx = dot.x;
            if (dot.x > maxx) maxx = dot.x;
            if (dot.y < miny) miny = dot.y;
            if (dot.y > maxy) maxy = dot.y;
        }
        let center = createVector((maxx + minx) / 2, (maxy + miny) / 2);

        // calc angles
        let angles = []
        for (let i = 0; i < this.closest.length; i++) {
            let dot = dots[this.closest[i]];
            let a = atan2(dot.y - center.y, dot.x - center.x);
            angles.push(a);
        }
        // sort angles
        let anglesCopy = [...angles];
        angles.sort((a, b) => a - b);
        let tempClosest = [];
        // use sorted angles to get orig index of angle in list
        // use index in list to get index of dot in orig closest list. gross
        for (let i = 0; i < angles.length; i++) {
            tempClosest.push(this.closest[anglesCopy.indexOf(angles[i])]);
        }
        this.closest = tempClosest;
    }

    render() {
        stroke(this.col);
        fill(this.col);

        // render cell shape
        if (this.id < 10000) {
            strokeWeight(0);
            beginShape();
            for (let i = 0; i < this.closest.length; i++) {
                if (this.mPoints[this.closest[i]]) {
                    vertex(this.mPoints[this.closest[i]].x, this.mPoints[this.closest[i]].y);
                }
            }
            endShape(CLOSE);
        }

        // render cell location
        // strokeWeight(1);
        // ellipse(this.x, this.y, 10, 10);
        // text(str(this.id), this.x - 5, this.y - 7);
    }

    update() {
        this.x += map(noise(this.x, frameCount), 0, 1, -2, 2);
        this.y += map(noise(this.y, frameCount), 0, 1, -2, 2);
    }
}

function newCell(index) {
    dots[index] = new Cell(index, 0, 0);
    dots[index].x = random(margin, width - margin);
    dots[index].y = random(margin, height - margin);
}

function setup() {
    cnv = createCanvas(500, 500);
    cnv.id(sketchName + "-canvas");
    frameRate(fps);

    activate();
}

function activate() {
    numDots = getSliderValue(document.querySelector("#shapesInput"), 100);
    dots = [];

    // create cells
    for (var i = 0; i < numDots; i++) {
        newCell(i);
    }

    calcMidpoints();
    for (let i = 0; i < numDots; i++) {
        dots[i].calcClosest(random([3, 4, 5]));
    }
}

function reset() { activate(); }

function draw() {
    background(20);
    for (let i = 0; i < numDots; i++) {
        dots[i].render();
        dots[i].update();
    }
    if (saveLoop) {
        saveCanvas('midpoints' + str(seed), 'png');
    }
    calcMidpoints();
}


function closest(x, y) {
    let minDist = width + height;
    let minId = 0;
    for (let i = 0; i < numDots; i++) {
        if (dist(x, y, dots[i].x, dots[i].y) < minDist) {
            minDist = dist(x, y, dots[i].x, dots[i].y);
            minId = i;
        }
    }
    return dots[minId];
}

function calcMidpoints() {
    // calc and add midpoints
    for (i = 0; i < numDots - 1; i++) {
        for (var j = i + 1; j < numDots; j++) {
            let xdif = dots[j].x - dots[i].x;
            let ydif = dots[j].y - dots[i].y;
            let midline = new Line(-xdif / ydif, dots[i].x + xdif / 2, dots[i].y + ydif / 2);
            dots[i].mLines[j] = midline;
            dots[j].mLines[i] = midline;
            dots[i].mPoints[j] = createVector(dots[i].x + xdif / 2, dots[i].y + ydif / 2);
            dots[j].mPoints[i] = createVector(dots[i].x + xdif / 2, dots[i].y + ydif / 2);
            // draw midpoints
            // stroke(240);
            // strokeWeight(10);
            // point(dots[i].x + xdif / 2, dots[i].y + ydif / 2);
        }
    }
}

function mousePressed() {
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height)
        return;
    print("add")
    numDots++;
    newCell(numDots-1);
    dots[numDots-1].x = mouseX;
    dots[numDots-1].y = mouseY;
    for (let i = 0; i < numDots; i++) {
        dots[i].calcClosest(random([3, 4, 5]));
    }
}