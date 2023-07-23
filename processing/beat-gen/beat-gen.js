let seed;
let pattern;
let onSym;
let offSym;
let onSound;
let offSound;
const timer = ms => new Promise(res => setTimeout(res, ms))

function setup() {
    createCanvas(500, 500);
    activate();
}

function preload() {
    onSound = loadSound('snare.mp3');
    offSound = loadSound('kick.mp3');
}

function activate() {
    seed = random(9999);
    
    onSym = "X";
    offSym = "O";
    pattern = makePattern(8);
    background(250);
    playPattern();
    // onSound.play();

}

function reset() { activate(); }

function draw() {
    let spacePerSym = width/pattern.length; 
    let symWidth = 10;
    textSize(symWidth*1.5);
    for(let i = 0; i < pattern.length; i++) {
        text(pattern[i]?onSym:offSym, i*spacePerSym + spacePerSym/2-symWidth/2, 50);
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
    for(let i = 0; i < pattern.length; i++) {
        print(pattern[i])
        if (pattern[i]) {
            onSound.stop();
            onSound.play();
        }
        else {
            offSound.stop();
            offSound.play();
        }
        await timer(150);
        
    }
}