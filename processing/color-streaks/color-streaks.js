
/*
* 0 = grayscale
* 1 = red
* 2 = blue
* 3 = green
* 4 = yellow
* 5 = purple
* 6 = rainbow
*/
let colorPack = 4;

let x, y, lx, ly = 0;
let seed;
let lines;
let points = [];
let pointsColors = [];
let colors = [[], [], [], [], [], []];


function setup() {
    createCanvas(500, 500);
    activate();
}

function activate() {
    seed = random(1000);
    background(0);
    lines = getNumberValue(document.querySelector("#linesInput"), 20);
    colorPack = getNumberValue(document.querySelector("#colorInput"), 0);
    for (let q = 0; q < lines; q++) {
        points[q] = [random(width), random(height * 2)];
        pointsColors[q] = int(random(7));
    }
    setColors();
}

function updateColors() {
    colorPack = getNumberValue(document.querySelector("#colorInput"), 0);
}

function reset() { activate(); }

function draw() {
    for (let i = 0; i < points.length; i++) {
        for (let r = 0; r < 50; r++) {
            //points[i][0] += abs(sin(points[i][0]%360))*random(4)*noise(points[i][0]) + 1;
            if (points[i][0] > width) {
                points[i][0] = 0;
            }

            points[i][1] += 1;
            let py = points[i][1];
            strokeWeight(random(5));
            if (py > 2 * height) {
                points[i][1] = 0;
                pointsColors[i] += 1;
                if (pointsColors[i] >= colors.length)
                    pointsColors[i] = 0;
            }
            if (py > height) {
                py = 2 * height - py;
            }

            ellipse(points[i][0], py, random(3), random(3));
        }

        if (colorPack == 6)
            stroke(colors[(int)(noise(points[i][1]) * colors.length)][pointsColors[i]]);
        else
            stroke(colors[colorPack][pointsColors[i]]);
    }
}

function setColors() {
    //grayscale
    colors[0].push(color("#000000"));
    colors[0].push(color("#666666"));
    colors[0].push(color("#333333"));
    colors[0].push(color("#BBBBBB"));
    colors[0].push(color("#EEEEEE"));
    colors[0].push(color("#999999"));
    colors[0].push(color("#FFFFFF"));

    //red
    colors[1].push(color("#B72A2A"));
    colors[1].push(color("#FA8282"));
    colors[1].push(color("#D44D4D"));
    colors[1].push(color("#FA8282"));
    colors[1].push(color("#6B0000"));
    colors[1].push(color("#951111"));
    colors[1].push(color("#823535"));

    //blue
    colors[2].push(color("#4C67AA"));
    colors[2].push(color("#304F9D"));
    colors[2].push(color("#183888"));
    colors[2].push(color("#3D4B6F"));
    colors[2].push(color("#586585"));
    colors[2].push(color("#061C54"));
    colors[2].push(color("#0D296F"));

    //green
    colors[3].push(color("#51B251"));
    colors[3].push(color("#025C02"));
    colors[3].push(color("#157B15"));
    colors[3].push(color("#417C41"));
    colors[3].push(color("#003A00"));
    colors[3].push(color("#063306"));
    colors[3].push(color("#2D952D"));

    //yellow
    colors[4].push(color("#EDED64"));
    colors[4].push(color("#AFAF1F"));
    colors[4].push(color("#6B6A11"));
    colors[4].push(color("#464500"));
    colors[4].push(color("#898906"));
    colors[4].push(color("#CFCF3C"));
    colors[4].push(color("#FFFF96"));

    //purple
    colors[5].push(color("#530E53"));
    colors[5].push(color("#8A458A"));
    colors[5].push(color("#6F256F"));
    colors[5].push(color("#A66FA6"));
    colors[5].push(color("#390139"));
    colors[5].push(color("#8C488C"));
    colors[5].push(color("#4C224C"));
}