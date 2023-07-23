// Copyleft benmachlin.com, 2023
let DEBUG = true;
let DEBUG2 = false;

// html ids
// match these with the ids in index.html
let tabId = "tab-text";
let inputTabId = "input-tab";
let settingsId = "settings";
let markerBarId= "marker-bar";
let markerEditorId= "marker-editor";

// globals
let Timer;  // the run cycle controller
let context;
let interval = 100;
let looper;

function setup() {
    context = new Context();
    context.Storage = new Storage();
    context.Settings = new Settings(context.Storage);
    context.Settings.LoadSettings();
    context.Scoring = new Scoring(context.Settings.minWordLength, context.Settings.numLetters);
    context.Game = new Game();
    context.Dict = new Dictionary();
    context.GameActions = new GameActions(context);
    context.Renderer = new Renderer(context);
    context.Dict.LoadWords().then(() => setup2());
}

function setup2() {
    context.GameActions.NewLevel();
    looper = setInterval(updateGame, interval);
    console.log("Done");
}


//#region settings

function saveSettings() {
    let nli = parseInt(document.getElementById("numLettersInput").value);
    let mwl = parseFloat(document.getElementById("minWordLengthInput").value);
    let thm = document.getElementById("themeLight").checked ? "light" : "dark";
    context.Settings.SaveSettings(nli, mwl, thm);
}
function defaultSettings() {
    context.Settings.SaveDefaultSettings();
}
function toggleHeading() {
    context.Settings.ToggleHeading();
}

// #endregion



//#region gameplay

function updateGame() {
    context.GameActions.IncrementTimers(interval);
    document.getElementById("letters").innerHTML = context.Game.letters.join(" ").toUpperCase();
    document.getElementById("word").innerHTML = context.Game.currentWord.join("").toUpperCase();
    document.getElementById("downTimer").innerHTML = context.Game.downTimerSec;
    document.getElementById("upTimer").innerHTML = context.Game.upTimerSec;
    document.getElementById("level").innerHTML = context.Game.level;
    document.getElementById("canMoveOn").innerHTML = context.Game.foundTargetWord;
    context.Renderer.RenderFindableWords();
    
    if (context.Game.IsGameOver()) {
        context.GameActions.EndGame();
        clearInterval(looper);
    }
}

function handleKeyDown(event) {
    if (event.repeat) return;
    if (DEBUG2) console.log("Key pressed:", event.key);
    let key = event.key.toLowerCase();
    if (/^[a-z]$/i.test(key)) {
        context.GameActions.AddLetter(key)
    }
    else if (event.key == "Enter") {
        context.GameActions.Submit();
    }
    else if (event.key == "Backspace" || event.key == "Delete") {
        context.GameActions.Backspace();
    }
    else if (event.key == " ") {
        context.Game.ShuffleLetters();
    }
    else if (event.key == "`") {
        if (context.Game.foundTargetWord) {
            context.GameActions.NewLevel();
        }
    }
}
document.addEventListener('keydown', handleKeyDown);

//#endregion