let seed;
let pattern;
let onSym;
let offSym;
let onSound;
let offSound;
let hatSound;
let playing;
const timer = ms => new Promise(res => setTimeout(res, ms))

function setup() {
    createCanvas(500, 100);
    activate();
}

function preload() {
    onSound = loadSound('snare.mp3');
    offSound = loadSound('kick.mp3');
    hatSound = loadSound('hihat.mp3');
}

function activate() {
    seed = random(9999);
    
    playing = false;

    onSym = "X";
    offSym = "O";
    pattern = makePattern(getSliderValue(elemById("lengthInput")));
    background(250);
}

function reset() { activate(); }

function draw() {
    let spacePerSym = width/pattern.length; 
    let symWidth = 10;
    let symHeight = 10;
    textSize(symWidth*1.5);
    for(let i = 0; i < pattern.length; i++) {
        text(pattern[i]?onSym:offSym, i*spacePerSym + spacePerSym/2-symWidth/2, 50);
    }
}

function mouseClicked() {
    if (!playing) {
        if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
            playPattern();
        }
    }
}

function makePattern(length) {
    let p = [];
    for (let i = 0; i < length; i++) {
        p.push(random()<0.5);
    }
    return p;
}

async function playPattern() {
    let bpm = getSliderValue(elemById("bpmInput")) ?? 160;
    playing = true;
    for(let i = 0; i < pattern.length; i++) {
        // print(pattern[i])
        hatSound.stop();
        hatSound.play();
        if (pattern[i]) {
            onSound.stop();
            onSound.play();
        }
        else {
            offSound.stop();
            offSound.play();
        }
        await timer(60000/(bpm*2));
    }
    playing = false;
}