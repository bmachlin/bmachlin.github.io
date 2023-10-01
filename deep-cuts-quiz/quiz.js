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

    processArgs();
}

function initialRender() {
    context.Renderer.RenderHighScore();
}


function auth() {
    context.Spotify.AuthorizeUserImplicit();
}

function test() {
    context.Spotify.SearchSpotify("pink", null, () => { console.log("works") });
}

async function processArgs() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (DEBUG) console.log(urlParams);

    if (!urlParams.has("id")) {
        // window.location = "selection.html";
        alert("no artist selected");
        return;
    }

    context.Renderer.RenderLoading();

    let res = await context.Game.artist.Load(context.Spotify, urlParams.get("id"));
    console.log(res)
    if (!res) {
        alert("could not get artists data for id", urlParams.get("id"));
    } else {
        readyGame();
    }
}

function readyGame() {
    context.Renderer.RenderStart();
}

function startGame() {

}





window.onSpotifyIframeApiReady = (IFrameAPI) => {
    const element = document.getElementById('iframe-container');
    const options = {
        uri: 'spotify:track:3xKsf9qdS1CyvXSMEid6g8',
        height: "80"
    };
    const callback = (EmbedController) => {
        iframe = EmbedController;
    };
    IFrameAPI.createController(element, options, callback);
};