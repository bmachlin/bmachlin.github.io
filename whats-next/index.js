let DEBUG = true;
let DEBUG2 = true;

document.addEventListener('DOMContentLoaded', ready);

let context;

function ready() {
    if (DEBUG2) console.log("ready");
    context = new Context();
    context.Settings.LoadSettings();
}

function randomizeFreqs() {
    context.Settings.RandomizeFreqs();
}

function zeroFreqs() {
    context.Settings.ZeroFreqs();
}

function equalFreqs() {
    context.Settings.EqualFreqs();
}

function toggle() {
    if (DEBUG2) console.log("toggle");
    context.playing ? pause() : play();
}

function play() {
    if (DEBUG2) console.log("play");
    if (context.playing) return;
    context.playing = true;
    document.querySelector(".playpause").classList.add("paused");
    context.Metronome.Play();
}

function pause() {
    if (DEBUG2) console.log("pause");
    if (!context.playing) return;
    context.playing = false;
    document.querySelector(".playpause").classList.remove("paused");
    context.Metronome.Pause();
}
