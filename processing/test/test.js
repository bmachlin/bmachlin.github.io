let sketchName = "test"
let cnv, perfont;
let squareSize = 37;
// let squareSize = 35.5;
let tOffset = 6;
let tSize = 50;
let rows = 1;
let cols = 1;

let inv = true;
let shouldDraw = true;
let c = "A";

let letterGrid = [];

let TOP = 0;
let BOT = 1;
let LEFT = 2;
let RIGHT = 3;

// matrix where [x][y] = [1,1,1,1] means y can go on TOP,BOTTOM,LEFT,RIGHT of x
// .5 mean it kinda fits

let PS = {
    "A": {
        "A": [0, 0, 0, 0],
        "J": [0, .5, 0, 0],
        "K": [0, 1, 0, 0],
        "L": [0, .5, 0, 0],
        "M": [0, 1, 0, 0],
        "O": [0, 0, 0, 0],
        "R": [0, 0, 0, 0]
    },
    "J": {
        "A": [.5, 0, 0, 0],
        "J": [.25, .25, .25, .25],
        "K": [.25, 0, .5, .5],
        "L": [0, 0, 1, .25],
        "M": [.5, 0, .25, .25],
        "O": [0, 0, 0, 0],
        "R": [.5, 0, 1, .25]
    },
    "K": {
        "A": [1, 0, 0, 0],
        "J": [0, 0, 0, 0],
        "K": [1, 1, .5, .5],
        "L": [.5, .5, .25, .5],
        "M": [1, 1, 1, .5],
        "O": [0, 0, 0, 0],
        "R": [1, 0, 0, .5]
    },
    "L": {
        "A": [.5, 0, 0, 0],
        "J": [0, 0, 0, 0],
        "K": [1, .5, .5, .25],
        "L": [.5, .5, 1, 1],
        "M": [.5, .5, 1, .25],
        "O": [0, 0, 0, 0],
        "R": [.5, 0, 0, .25]
    },
    "M": {
        "A": [1, 0, 0, 0],
        "J": [0, 0, 0, 0],
        "K": [.5, 1, 1, 1],
        "L": [.5, 1, .25, 1],
        "M": [1, 1, 1, 1],
        "O": [0, 0, 0, 0],
        "R": [1, 0, 0, 1]
    },
    "O": {
        "A": [0, 0, 0, 0],
        "J": [0, 0, 0, 0],
        "K": [0, 0, 0, 0],
        "L": [0, 0, 0, 0],
        "M": [0, 0, 0, 0],
        "O": [0, 0, 0, 0],
        "R": [0, 0, 0, 0]
    },
    "R": {
        "A": [0, 0, 0, 0],
        "J": [0, .5, .25, .5],
        "K": [0, 1, .5, 0],
        "L": [0, .5, .25, 0],
        "M": [0, 1, 1, 0],
        "O": [0, 0, 0, 0],
        "R": [0, 0, 0, 0]
    }
}

function preload() {
    perfont = loadFont('perf-font.otf');
}

function setup() {
    cnv = createCanvas(600, 600);
    cnv.id(sketchName + "-canvas");
    activate();
}

function activate() {
    background(255);

    noStroke();

    cols = floor(width / squareSize);
    rows = floor(height / squareSize);

    for (let i = 0; i < cols; i++) {
        letterGrid.push([]);
        for (let j = 0; j < rows; j++) {
            letterGrid[i].push("");
        }
    }

    textFont(perfont);
    textSize(tSize);

    if (shouldDraw) return;

    let alpha = Object.keys(PS).join("");
    let testcols = floor(width/(squareSize*3.25));
    for (let k = 0; k < alpha.length; k++) {
        let offsetX = floor(1.1*squareSize*3*(k%testcols));
        let offsetY = floor(1.1*squareSize*3*(floor(k/testcols))) + 5;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if ((i == -1 || i == 1) && (j == -1 || j == 1))
                    continue;

                let x = offsetX + squareSize * (i + 1);
                let y = offsetY + squareSize * (j + 2);
                if (i == 0 && j == 0) {
                    text(inv ? alpha[k] : c, x, y)
                } else {
                    text(inv ? c : alpha[k], x, y)
                }
            }
        }
    }
    
}

function getLetter(x, y) {
    if (letterGrid[x][y] != "")
        return letterGrid[x][y];
    let options = Object.keys(PS);
    let maxVal = 0;
    let maxOptions = [];

    let positions = [[-1,0],[1,0],[0,-1],[0,1]];
    let positions2 = [TOP,BOT,LEFT,RIGHT];
    for (let k of options) {
        let total = 0
        for (let i = 0; i < positions.length; i++) {
            let xDif = positions[i][0];
            let yDif = positions[i][1];
            if (x + xDif >= rows || x + xDif < 0 || y + yDif >= cols || y + yDif < 0)
                continue;
            let k2 = letterGrid[x+xDif][y+yDif];
            total += getMatch(k,k2,positions2[i]);
        }
        if (total == maxVal) {
            maxOptions.push(k);
        }
        else if (total > maxVal) {
            maxVal = total;
            maxOptions = [k];
        }
    }

    if (maxOptions.length == 0) maxOptions = ["O"];
    let result = maxOptions[Math.floor(Math.random() * maxOptions.length)];
    letterGrid[x][y] = result;
    return result;
}

function getLetter2(x, y) {
    if (letterGrid[x][y] != "")
        return letterGrid[x][y];
    let options = Object.keys(PS);
    let maxVal = 0;
    let maxOptions = [];

    let positions = [[-1,0],[1,0],[0,-1],[0,1]];
    let positions2 = [TOP,BOT,LEFT,RIGHT];
    for (let k of options) {
        let total = 0
        for (let i = 0; i < positions.length; i++) {
            let xDif = positions[i][0];
            let yDif = positions[i][1];
            if (x + xDif >= rows || x + xDif < 0 || y + yDif >= cols || y + yDif < 0)
                continue;
            let k2 = letterGrid[x+xDif][y+yDif];
            total += getMatch(k,k2,positions2[i]) >= .5 ? 1 : 0;
        }
        if (total == maxVal) {
            maxOptions.push(k);
        }
        else if (total > maxVal) {
            maxVal = total;
            maxOptions = [k];
        }
    }

    if (maxOptions.length == 0) maxOptions = ["O"];
    let result = maxOptions[Math.floor(Math.random() * maxOptions.length)];
    letterGrid[x][y] = result;
    return result;
}

function getMatch(let1, let2, pos) {
    if (let1 == "" || let2 == "")
        return 0;
    return PS[let1][let2][pos];
}

function reset() { activate(); }

async function draw() {
    if (!shouldDraw) return;

    let spots = [...Array(rows * cols).keys()];
    shuffleArray(spots);

    for (let i = 0; i < spots.length; i++) {
        // let x = squareSize * i - tOffset;
        // let y = squareSize * j;
        // text(getLetter(i, j), x, y);
        let x = floor(spots[i] % cols);
        let y = floor(spots[i] / cols);
        let xPos = x * squareSize - tOffset;
        let yPos = y * squareSize;
        let letter = getLetter2(x, y);
        text(letter, xPos, yPos + squareSize);
        await new Promise(r => setTimeout(r, 500));
    }
    noLoop();
}


// https://stackoverflow.com/a/12646864
/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}