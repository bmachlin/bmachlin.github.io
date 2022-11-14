
let sketchName = "square-splitter"
let cnv;
let seed;
let sCount;
let queue;
let sizeThreshold;

function setup() {
    cnv = createCanvas(500, 500);
    cnv.id(sketchName + "-canvas");
    rectMode(CORNERS);
    ellipseMode(CORNERS);
    activate();
}

function activate() {
    seed = random(99999999);
    background(23);
    stroke(200);
    strokeWeight(2);
    noFill();
    sCount = 0;
    queue = null;
    sizeThreshold = 5;
    queue = [];
    queue.push(new Square(9, 1,1, width-1,height-1)); // add first square, whole canvas size
}

function reset() { activate(); }

function draw() {
    if (queue.length > 0) {
        var next = queue.shift();
        next.render();
        Array.prototype.push.apply(queue, next.split());
    }
    else {
        print("DONE");
    }
}

class Square {

    depth = 1;
    tlx;
    tly;
    brx;
    bry;
    c;

    constructor(d, tlx, tly, brx, bry) {
        this.tlx = tlx;
        this.tly = tly;
        this.brx = brx;
        this.bry = bry;
        this.depth = d;
        this.setcolor(this.depth);
    }

    setcolor(depth) {
        if (depth % 3 == 0) {
            this.c = color(random(20, 40), map(this.tlx, 0, width, 75, 250), map(this.tly, 0, height, 75, 250));
        } else if (depth % 3 == 1) {
            this.c = color(map(this.tlx, 0, width, 75, 250), random(20, 40), map(this.tly, 0, height, 75, 250));
        } else {
            this.c = color(map(this.tlx, 0, width, 75, 250), map(this.tly, 0, height, 75, 250), random(20, 40));
        }
    }

    render() {
        stroke(this.c);
        // strokeWeight(this.depth);
        rect(this.tlx, this.tly, this.brx, this.bry);
    }

    split() {
        // determine split lines
        if (this.depth <= 1) return [];
        var splitCoords = this.generateSplits();
        if (splitCoords == null) return [];
        return this.createSquares(splitCoords);
    }

    createSquares(coords) {
        var squares = [];
        for (var i = 0; i < coords.length; i++) {
            squares.push(new Square(this.depth - 1, 
                coords[i][0] + 1, coords[i][1] + 1, coords[i][2] - 1, coords[i][3] - 1));
        }
        return squares;
    }

    generateSplits() {
        let coords = [];

        var squareWidth = this.brx - this.tlx;
        var squareHeight = this.bry - this.tly;
        
        // can't split a tiny square
        if (squareWidth < sizeThreshold*2 || squareHeight < sizeThreshold*2)
            return null;

        let maxVertSplits = floor(squareWidth/sizeThreshold);
        let maxHoriSplits = floor(squareHeight/sizeThreshold);
        
        var vertSplit = maxVertSplits >= maxHoriSplits; // should the splits cut vertically? (else horizontally)

        var splitCount = int(random(1, min(5, max(maxHoriSplits, maxVertSplits))));
        if (splitCount < 1) return null;

        let splitSizes = [];
        let size = vertSplit ? squareWidth : squareHeight;
        let totalUsed = 0;
        for (let s = 0; s <= splitCount; s++) {
            let remainingSize = size - totalUsed;
            let maxSize = remainingSize - (sizeThreshold*(splitCount-s));
            let newSize = remainingSize;
            if (splitCount-s != 0) {
                newSize = int(random(sizeThreshold, maxSize)); 
            }
            splitSizes.push(newSize);
            totalUsed += newSize;
        }

        totalUsed = 0;
        for (let s = 0; s < splitSizes.length; s++) {
            if (vertSplit) {
                coords.push([
                    this.tlx + totalUsed, this.tly, this.tlx + totalUsed + splitSizes[s], this.bry
                ]);
            }
            else {
                coords.push([
                    this.tlx, this.tly + totalUsed, this.brx, this.tly + totalUsed + splitSizes[s]
                ]);
            }
            totalUsed += splitSizes[s];
        }

        return coords;
    }

}

function mouseReleased() {
    draw();
}
