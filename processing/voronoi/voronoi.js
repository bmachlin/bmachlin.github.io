let cnv;
let sketchName = "voronoi";
let numDots;
let dots;
let margin;
let perfImprove;
let perfImprove2;
// let start = performance.now();

class Dot {

    constructor(x, y) {
        this.init(x, y);
    }

    init(x, y) {
        this.red = random(100, 255);
        this.green = random(100, 255);
        this.blue = random(100, 255);
        this.x = x;
        this.y = y;
    }

    render() {
        push();
        translate(this.x, this.y);
        stroke(255);
        strokeWeight(2);
        noFill();
        ellipse(0, 0, 10, 10);
        strokeWeight(1);
        pop();
    }
}

function reset() { activate(); }

function setup() {
    cnv = createCanvas(400, 400);
    cnv.id(sketchName + "-canvas");
    frameRate(1);
    pixelDensity(1);
    activate();
}

function activate() {
    background(0);
    perfImprove = document.querySelector("#perfInput").checked;
    perfImprove2 = document.querySelector("#perfInput2").checked;
    numDots = Math.floor(getSliderValue(document.querySelector("#dotsInput"), 6));
    margin = Math.floor(getSliderValue(document.querySelector("#marginInput"), 10));
    dots = [];
    for (var i = 0; i < numDots; i++) {
        dots[i] = new Dot(i, 0, 0);
        placeDot(i);
    }
    draw();
}

function placeDot(index) {
    let space = false;
    let x = 0;
    let y = 0;
    let tries = 1000;
    do {
        x = random(margin, width - margin);
        y = random(margin, height - margin);
        space = true;
        for (let dot of dots) {
            if (dist(x, y, dot.x, dot.y) < margin) {
                space = false;
                break;
            }
        }
        tries--;
    } while (!space && tries > 0);
    dots[index].x = x;
    dots[index].y = y;
}

function draw() {
    background(0);
    // for each location, find the closest cell and 
    // color the pixel with the color of that cell
    // use black for borders
    // let drawStart = performance.now();
    // console.log("draw started at ", (drawStart - start) / 1000);
    loadPixels();
    for (let i = 0; i < width * height; i++) {
        let closest = closestDot(i % width, floor(i / width));
        let index = (i % width + floor(i / width) * width) * 4;
        if (closest > -1) {
            pixels[index + 0] = dots[closest].red;
            pixels[index + 1] = dots[closest].green;
            pixels[index + 2] = dots[closest].blue;
            pixels[index + 3] = 255;
        } else {
            pixels[index + 0] = 0;
            pixels[index + 1] = 0;
            pixels[index + 2] = 0;
            pixels[index + 3] = 255;
        }
        if (perfImprove && (i%17==0 || i%13==0 || i%7==0 || i%5==0 || i%3==0)) i++;
        if (perfImprove2 && (i%4==0 || i%6==0)) i+=2;
    }
    // let stuffTime = (performance.now() - drawStart);
    // console.log("stuff took ", stuffTime / 1000);
    // console.log("thats", Math.round(stuffTime / (height * width) * 10000) / 10000, "ms/pixel");
    updatePixels();

    for (var dot of dots) {
        dot.render();
    }
    noLoop();
}

function closestDot(x, y, useMargin = true) {
    let minDist = width + height;
    let secondMin = width + height;
    let minIndex = 0;
    for (let i = 0; i < dots.length; i++) {
        let distance = dist(x, y, dots[i].x, dots[i].y);
        if (distance < minDist) {
            secondMin = minDist;
            minDist = distance;
            minIndex = i;
        } else if (distance < secondMin) {
            secondMin = distance;
        }
    }
    // for larger boundaries/interesting results
    // change this number     VV
    if (useMargin && secondMin - minDist < margin) {
        return -1;
    }
    return minIndex;
}

function mouseReleased() {
    if (mouseX <= 0 || mouseX >= width - 0 || mouseY <= 0 || mouseY >= height - 0)
        return;

    let closest = closestDot(mouseX, mouseY, false);
    if (dist(mouseX, mouseY, dots[closest].x, dots[closest].y) < 10) {
        dots.splice(closest, 1);
    }
    else {
        dots[dots.length] = new Dot(mouseX, mouseY);
    }

    draw();
}

document.querySelector("#marginInput").addEventListener('input', e => {
    document.querySelector("#marginValue").innerText = e.target.value;
    margin = e.target.value;
    draw();
});

document.querySelector("#perfInput").addEventListener('input', e => {
    perfImprove = e.target.checked;
    draw();
});

document.querySelector("#perfInput2").addEventListener('input', e => {
    perfImprove2 = e.target.checked;
    draw();
});