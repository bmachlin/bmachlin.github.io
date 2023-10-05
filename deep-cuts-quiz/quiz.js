// Copyleft benmachlin.com, 2023
let DEBUG = true;
let DEBUG2 = false;

let context;
let iframe;

function setup() {
    context = new Context();
    context.Storage = new Storage();
    context.Spotify = new Spotify(config.client, config.redirectRoot + "index.html", context.Storage);
    context.Settings = new Settings(context.Storage);
    context.Settings.LoadSettings();
    context.Game = new Game();
    context.GameActions = new GameActions(context);
    context.Renderer = new Renderer(context);

    context.Spotify = new Spotify(config.client, config.redirectRoot + "index.html", localStorage);
    if (context.Spotify.NeedsAuth()) {
        if (context.Spotify.HasRefreshToken()) {
            context.Spotify.RefreshAccess(
                (data) => { processArgs(); },
                (error) => { window.location = "index.html"; });
        } else {
            window.location = "index.html";
        }
    } else {
        processArgs();
    }
}

function initialRender() {
    context.Renderer.RenderHighScore();
}

async function processArgs() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (DEBUG2) console.log(urlParams);

    if (!urlParams.has("id")) {
        // window.location = "selection.html";
        alert("no artist selected");
        return;
    }

    context.Renderer.RenderLoading();
    context.Game.artist.id = urlParams.get("id");
    let data = loadArtistDataFromCache(urlParams.get("id"));
    if (data) {
        context.Game.artist.LoadFromCache(data);
        readyGame();
    }
    else {
        context.Game.artist.Load(context.Spotify, urlParams.get("id"), (done) => {
            if (!done) {
                alert("could not get artists data for id", urlParams.get("id"));
            } else {
                cacheArtistData();
                readyGame();
            }
        });
    }
}

function readyGame() {
    context.Renderer.RenderStart();
}

function startGame() {
    context.GameActions.MakeQuestion();
    context.Renderer.RenderChoiceQuestion(context.Game.currentQuestion, (selection) => {
        context.GameActions.ProcessAnswer(selection);
        context.Renderer.RevealChoiceQuestion(context.Game.currentQuestion.correctAnswer);
    });
}

function nextQuestion() {
    context.GameActions.NextQuestion();
}

function loadArtistDataFromCache(id) {
    if (!context.Storage.getItem(id)) {
        console.log("no valid cached artist data")
        return null;
    }

    if(!context.Storage.getItem(id + "_expire") || parseInt(context.Storage.getItem(id + "_expire")) < new Date().getTime()) {
        context.Storage.removeItem(id);
        context.Storage.removeItem(id + "_expire");
    }

    return JSON.parse(context.Storage.getItem(id));
}

function cacheArtistData() {
    context.Storage.setItem(context.Game.artist.id, JSON.stringify(context.Game.artist));
    context.Storage.setItem(context.Game.artist.id + "_expire", new Date().getTime() + 7200000); // 2 hours from now
}


window.onSpotifyIframeApiReady = (IFrameAPI) => {
    const element = document.getElementById('iframe-container');
    const options = {
        uri: 'spotify:track:4cOdK2wGLETKBW3PvgPWqT',
        height: "80"
    };
    const callback = (EmbedController) => {
        iframe = EmbedController;
    };
    IFrameAPI.createController(element, options, callback);
};



////////////////////////////////////////////

function shuffleArray(array) {
    // https://stackoverflow.com/a/12646864
    /* Randomize array in-place using Durstenfeld shuffle algorithm */
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function randomElements(array, elems, condition) {
    let arr = [...array];
    shuffleArray(arr);

    if (condition) {
        arr = arr.filter(condition);
    }
    return arr.slice(0, elems);
}

function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}