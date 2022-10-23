

let sketchName = "breathing-squares";
let fps = 30
let squares;
let buttons;
let squareStroke = 2;

// divide the canvas and make overlapping grids
// using factors of the number of divisions
let divisions; // <-- play with
let factors;

class ToggleButton {
    constructor(x, y, w, h, factor, on) {
        this.on = on;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.f = factor;
        this.set(on);
    }

    toggle() {
        this.on = !this.on;
        this.set(this.on);
    }

    set(on) {
        this.on = on;
        for (let sqr of squares) {
            if (sqr.id.startsWith(str(this.f) + '_')) {
                sqr.on = on;
            }
        }
    }

    render() {
        push();
        translate(this.x, this.y);
        
        let vw = this.w / 100.0; // 1% of width
        stroke(240);
        strokeWeight(1);
        fill(20);

        line(squareStroke, 0, squareStroke, this.h); // draw vertical dividing line
        line(squareStroke, this.h, this.w, this.h); // draw horizontal dividing line
        fill(this.on ? 240 : 20); // fill if toggled on, match background if not
        ellipse(60*vw, 5, 90*vw, this.h - 5); // draw toggle button

        fill(240);
        let txtSize = this.w / 2 / 3; // divide by 2 bc text only takes up half the width, divide by 3 because factors could have up to three digits
        textSize(txtSize);
        text(str(this.f), 10*vw, txtSize + 15); // draw factor number

        pop();
    }

    inBounds(x, y) {
        return x >= this.x + this.w / 2 && x <= this.x + this.w &&
            y >= this.y && y <= this.y + this.h;
    }
}

class BreathingSquare {
    constructor(id, x, y, sideLength, duration, col) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.q = sideLength / 2;
        this.col = col;
        this.t = 0;
        this.frameCycle = duration * fps;
        this.on = true;
        // this.phase = ['0', '2', '4', '6', '8'].includes(id[id.length - 1]) ? 0 : PI;
    }

    render() {
        if (!this.on)
            return;

        stroke(this.col);
        strokeWeight(squareStroke);
        push();
        translate(this.x, this.y);

        // using sine for eased oscillation
        let t = sin(frameCount * 2 / this.frameCycle); // + this.phase);

        // making each side __/\__ and rotating
        for (let i = 0; i < 4; i++) {
            // corners
            line(-this.q, -this.q, -this.q / 2, -this.q);
            line(this.q / 2, -this.q, this.q, -this.q);
            // breathing sides
            line(-this.q / 2, -this.q, 0, -this.q + this.q / 2 * t);
            line(this.q / 2, -this.q, 0, -this.q + this.q / 2 * t);
            rotate(PI / 2);
        }
        pop();
    }
}

function setup() {
    let cnv = createCanvas(600, 500);
    cnv.id(sketchName + "-canvas");
    ellipseMode(CORNERS);
    frameRate(fps);
    activate();
}

function activate() {
    buttons = [];
    squares = [];

    divisions = getNumberValue(document.querySelector('#divisionsInput'), 36);
    factors = getFactors(divisions);
    // create every square
    for (let f of factors) {
        let count = 0;
        for (let r = 0; r < divisions / f; r++) {
            for (let c = 0; c < divisions / f; c++) {
                let s = height / divisions;
                let x = c * f * s + s / 2;
                let y = r * f * s + s / 2;
                let rnoise = noise(x / f, y / f, 1);
                let gnoise = noise(x / f, y / f, 2);
                let bnoise = noise(x / f, y / f, 3);
                let col = color(map(rnoise, 0.2, 0.8, 20, 255),
                    map(gnoise, 0.2, 0.8, 100, 255),
                    map(bnoise, 0.2, 0.8, 20, 255));
                squares.push(new BreathingSquare(str(f) + '_' + str(count),
                    x + s / 2 * (f - 1),
                    y + s / 2 * (f - 1),
                    s * f, 2, col));
                count++;
            }
        }
    }
    // create buttons to toggle factors
    let buttonHeight = Math.min(Math.min(height / factors.length,height/6), (width - height) / 2);
    for (let i = 0; i < factors.length; i++) {
        buttons.push(
            new ToggleButton(
                500 + squareStroke,
                i * buttonHeight, 
                width-height,
                buttonHeight,
                factors[i], 
                divisions / factors[i] < 8 // factors that produce >64 squares start disabled
            ) 
        );
    }
}

function reset() { activate(); }

function draw() {
    background(20, 80);
    for (let sqr of squares) {
        sqr.render();
    }
    stroke(20);
    fill(20);
    rect(height + squareStroke, 0, width, height);
    for (let but of buttons) {
        but.render();
    }
}

function mousePressed() {
    for (let but of buttons) {
        if (but.inBounds(mouseX, mouseY)) {
            but.toggle();
            break;
        }
    }
}

function getFactors(num) {
    let fs = [];
    for (let i = 1; i <= num; i++) {
        if (num % i == 0 &&
            num / i < height/20) // cuts off tiny factors (remove if you want)
            fs.push(i);
    }
    return fs;
}