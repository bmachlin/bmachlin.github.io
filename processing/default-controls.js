// Default saving controls for p5.js sketches
// Must have an active p5 canvas running for this to work

function toggle(e) {
    isLooping() ? stopSketch() : startSketch();
}

function startSketch() {
    loop();
    document.querySelector(".btn-start-stop").innerHTML = "Stop";
}

function stopSketch() {
    noLoop();
    document.querySelector(".btn-start-stop").innerHTML = "Start";
}


function saveFrame(e) {
    saveCanvas(cnv, sketchName + '-' + str(Date.now()), 'png');
}

const recBtn = document.querySelector('.btn-record');
let chunks = [];

function record() {
    chunks = [];
    chunks.length = 0;
    let stream = document.querySelector("#" + sketchName + "-canvas").captureStream(30),
        recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => {
        if (e.data.size) {
            chunks.push(e.data);
        }
    };
    recorder.onstop = exportVideo;
    recBtn.onclick = e => {
        recorder.stop();
        recBtn.textContent = 'Start Recording';
        recBtn.onclick = record;
    };
    recorder.start();
    recBtn.textContent = 'Stop Recording';
}

function exportVideo(e) {
    var blob = new Blob(chunks);
    var vid = document.createElement('video');
    vid.controls = true;
    vid.src = URL.createObjectURL(blob);
    document.querySelector("main").appendChild(vid);
    // vid.play();
}
recBtn.onclick = record;

// function keyPressed() {
//     if (key == 'p')
//         stopSketch();
//     if (key == 'o')
//         startSketch();
// }