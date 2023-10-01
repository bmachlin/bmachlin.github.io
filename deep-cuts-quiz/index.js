// Copyleft benmachlin.com, 2023
let DEBUG = true;
let DEBUG2 = false;

let Spot;

function test() {
    Spot.SearchSpotify("pink", null, (data) => { console.log("works", data) });
}

function setup() {
    Spot = new Spotify(config.client, config.redirectRoot + "index.html", localStorage);
    processArgs();
}

function auth() {
    if (Spot.HasRefreshToken()) {
        Spot.RefreshAccess(
            (data) => { start(); },
            (error) => { Spot.AuthorizePKCE(); });
    } else {
        Spot.AuthorizePKCE();
    }
}

function start() {
    if (Spot.NeedsAuth()) {
        auth();
    } else {
        window.location = "selection.html";
    }
    
}

async function processArgs() {
    if (DEBUG) console.log("processing args");
    let urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get('code');
    if (Spot.NeedsAuth() && code) {
        Spot.AuthorizePKCE2(code);
    }
}