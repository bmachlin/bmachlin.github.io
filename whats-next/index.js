
document.addEventListener('DOMContentLoaded', () => {
    let pp = document.getElementsByClassName("playpause")[0];
    pp.onclick = (e) => { pp.classList.toggle("paused"); };
    ready();
});

let beats = 4;
let nextBeats;
let metronome;
let measureDisplay;
let beatFrequencies = [];
let bpm;

function ready() {
    measureDisplay = new MeasureDisplay(document.querySelector(".measure"), 4);
}

function randomizeFreqs() {
    let freqList = document.querySelector(".beat-frequencies");
    for (let bf of freqList.children) {
        bf.children[1].value = Math.floor(Math.random() * 10);
    }
}

function zeroFreqs() {
    let freqList = document.querySelector(".beat-frequencies");
    for (let bf of freqList.children) {
        bf.children[1].value = 0;
    }
}


function getBeatFrequencies() {
    let freqList = document.querySelector(".beat-frequencies");
    let beatFreq = [];
    for (let bf of freqList.children) {
        let beat = parseInt(bf.children[0].innerText);
        let freq = parseInt(bf.children[1].value);
        beatFreq = beatFreq.concat(new Array(freq).fill(beat));
    }
    return beatFreq;
}

function makeNextMeasure() {
    let freqs = getBeatFrequencies();
    if (!freqs.length) freqs = [4];
    let beats = freqs[Math.floor(Math.random() * freqs.length)];
    
    this.nextBeats = beats;
    document.querySelector(".next-beats").innerText = beats;
}

