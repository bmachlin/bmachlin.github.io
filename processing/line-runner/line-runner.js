let cnv;
let sketchName = "line-runner";
let sideLength = 500;
let backgroundColor = 50; // in gray value
let lineThickness = 2;

let covered; // covered positions
let runners; // agents
let numRunners;
let initialCircleRadius;
let randomTurnProbability;

function setup() {
    cnv = createCanvas(sideLength, sideLength);
    cnv.id(sketchName + "-canvas");
    activate();
}

function activate() {
    setParams();
    background(backgroundColor);
    strokeWeight(lineThickness);
    angleMode(DEGREES);

    covered = new Map();
    runners = [];

    for (var i = 0; i < numRunners; i++) {
        let a = random(0, 360);
        let x = int(initialCircleRadius * cos(a) + sideLength / 2);
        let y = int(initialCircleRadius * sin(a) + sideLength / 2);
        let c = color(random(100, 255), random(100, 255), random(100, 255));
        runners.push(new Runner(x, y, 3, random([true, false]), random([true, false]), c));
    }

}

function setParams() {
    console.log("set params")
    numRunners = Math.floor(getSliderValue(document.querySelector("#runnersInput"), 200));
    randomTurnProbability = getSliderValue(document.querySelector("#turnProbInput"), 0.05);
    initialCircleRadius = getSliderValue(document.querySelector("#radiusInput"), 0.25) * sideLength;
    console.log(numRunners, randomTurnProbability, initialCircleRadius, "set params2")
}

function draw() {
    loadPixels();
    for (let runner of runners) {
        if (runner.isAlive) {
            runner.render();
            runner.move();
        }
    }
}

function reset() {
    clear();
    activate();
}

let above = 0;
let below = 0;

class Runner {
    constructor(x, y, size, rightBias, upBias, col) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.xOrder = rightBias ? [1, 0, -1] : [-1, 0, 1];
        this.yOrder = upBias ? [1, 0, -1] : [-1, 0, 1];
        this.color = col;
        this.directionX = random([-1, 1]);
        this.directionY = random([-1, 0, 1]);
        this.isAlive = true;
    }

    updateDirection() {
        // if current direction is clear, continue
        if (this.isDirectionClear(this.directionX, this.directionY)) {
            if (noise(this.x, this.y) > randomTurnProbability) {
                above += 1;
                // console.log("above", above);
                return;
            }
            else {
                below += 1;
                console.log("below", below);
            }
        }
        // else, look for a new direction
        for (let x of this.xOrder) {
            for (let y of this.yOrder) {
                if (x == 0 && y == 0) continue;
                if (this.isDirectionClear(x, y)) {
                    this.directionX = x;
                    this.directionY = y;
                    return;
                }
            }
        }

        this.kill();
    }

    isDirectionClear(xd, yd) {
        let key = `${this.x + xd},${this.y + yd}`;
        return !covered.has(key) || !covered.get(key);
    }

    checkBounds() {
        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height)
            this.kill();
    }

    kill() {
        this.isAlive = false;
        // print("died")
    }

    render() {
        if (!this.isAlive) return;

        stroke(this.color);
        point(this.x, this.y);
        covered.set(`${this.x},${this.y}`, true);
    }

    move() {
        this.updateDirection();

        if (!this.isAlive) return;

        this.x += this.directionX;
        this.y += this.directionY;

        this.checkBounds();
    }
}