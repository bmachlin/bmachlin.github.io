// Copyleft benmachlin.com, 2023
let DEBUG = true;
let DEBUG2 = false;

// globals
let context;                    // main reference object
let looper;                     // Interval object
let interval = 100;             // interval in ms to run the game loop

function setup() {
    context = new Context();
    context.Storage = new Storage();
    context.Settings = new Settings(context.Storage);
    context.Settings.LoadSettings();
    context.Game = new Game(context.Settings.minWordLength.value, context.Settings.maxWordLength.value);
    context.Scoring = new Scoring(context.Settings.minWordLength.value, context.Settings.maxWordLength.value, context.Settings.difficulty.value);
    context.Dict = new Dictionary();
    context.GameActions = new GameActions(context);
    context.Renderer = new Renderer(context);
    context.Dict.LoadWords();
    context.Renderer.RenderHighScore();
}

//#region settings

function saveSettings() {
    context.Settings.maxWordLength.ParseFromElementValue();
    context.Settings.minWordLength.ParseFromElementValue();
    context.Settings.difficulty.ParseFromElementValue();
    context.Settings.SaveSettings();
}
function defaultSettings() {
    context.Settings.SaveDefaultSettings();
}
function toggleSettings() {
    if (!context.Game.IsGameOver()) return;
    context.Settings.ToggleSettings();
}

// #endregion

//#region render

function initialRender() {
    context.Renderer.RenderLetters(true);
    context.Renderer.RenderWord(true);
    context.Renderer.RenderFindableWords();
    context.Renderer.RenderHighScore();
    context.Settings.CloseSettings();
}

//#endregion


//#region gameplay
function newGame() {
    clearInterval(looper);
    context.GameActions.NewGame();
    looper = setInterval(updateGame, interval);
    initialRender();
}

function endGame() {
    if (context.Settings.highScore.value < context.Game.upTimerSec) {
        context.Settings.highScore.value = context.Game.upTimerSec;
        context.Settings.SaveSettingObj(context.Settings.highScore);
        context.Renderer.RenderHighScore();
    }
    context.Renderer.RenderFindableWords(true);
    context.GameActions.EndGame();
    clearInterval(looper);
}

function updateGame() {
    // if (document.activeElement != document.body) {
    //     document.body.focus();
    // }
    context.GameActions.IncrementTimers(interval);
    document.getElementById("root-letters").innerHTML = context.Game.letters.join(" ").toUpperCase();
    document.getElementById("downTimer").innerHTML = context.Game.downTimerSec;
    document.getElementById("upTimer").innerHTML = context.Game.upTimerSec;
    document.getElementById("level").innerHTML = context.Game.level; 
    document.getElementById("canMoveOn").innerHTML = context.Game.foundTargetWord;
    document.getElementById("foundAllWords").innerHTML = context.Game.HasFoundAllWords();
    
    if (context.Game.IsGameOver()) {
        endGame();
    }
}

function handleKeyDown(event) {
    if (event.repeat) return;
    if (DEBUG2) console.log("Key pressed:", event.key);

    if (context.Game.IsGameOver()) return;

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
        if (event.target == document.body) {
            event.preventDefault();
        }
        context.GameActions.Shuffle();
    }
    else if (event.key == "`") {
        if (context.Game.foundTargetWord) {
            context.GameActions.NewLevel();
        }
    }
}
document.addEventListener('keydown', handleKeyDown);

//#endregion