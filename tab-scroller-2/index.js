// Copyleft QNU.net, 2022

// default ytPlayer state values
let ytUNSTARTED = -1;
let ytENDED = 0;
let ytPLAYING = 1;
let ytPAUSED = 2;
let ytBUFFERING = 3;
let ytCUED = 5;

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

function setup() {
    context = new Context();
    context.Storage = new Storage();
    context.MarkerEditor = new MarkerEditor(markerEditorId, context);
    context.Tab = new Tab(tabId, context);
    context.MarkerBar = new MarkerBar(markerBarId, context);
    context.TabScroller = new TabScroller(context);
    context.Settings = new Settings(context.Storage);
    setup2();
}

function setup2() {
    context.Settings.LoadSettings();

    // populate fields from last use
    if (context.Storage.getItem(inputTabId)) {
        let textArea = document.getElementById(inputTabId);
        textArea.value = context.Storage.getItem(inputTabId);
        processTab();
    }

    if (context.Storage.getItem('playerId'))  {
        let playerInput = document.getElementById('playerId');
        playerInput.value = context.Storage.getItem('playerId');
        createPlayer();
    }
}

function submitted() {
    return document.getElementById("tab-text").childElementCount > 0;
}

// #region settings

function saveSettings() {
    let st = parseInt(document.getElementById("seekInput").value);
    let sbb = parseFloat(document.getElementById("skipBackInput").value);
    let thm = document.getElementById("themeLight").checked ? "light" : "dark";
    context.Settings.SaveSettings(st, sbb, thm);
}

function defaultSettings() {
    context.Settings.SaveDefaultSettings();
}

function setSeekTime() {
    let seekInput = parseInt(document.getElementById("seekInput").value);
    context.Settings.SetSeekTime(seekInput);
}

function setTheme(themeName) {
    context.Settings.SetTheme(themeName);
}

function toggleHeading() {
    context.Settings.ToggleHeading();
}

function setHeadingVisible(visible) {
    context.Settings.SetHeadingVisible(visible);
}

// #endregion

// #region Youtube player

function createPlayer() {
    // only create player if it isn't already created
    if (!context.Player) {
        let tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        tag.id = "player-script";
        let timerElement = document.getElementById('timer');
        timerElement.parentNode.insertBefore(tag, timerElement);
    } else {
        loadPlayer();
    }
}

function loadPlayer() {
    if (!context.Player) {
        createPlayer();
        return;
    }
    // show iframe if hidden
    let iframe = document.getElementById("player");
    if (iframe) iframe.hidden = false;

    // set player id and store value
    let id = document.getElementById('playerId').value;
    context.Storage.setItem('playerId', id);
    context.Player.cueVideoById(id);

    context.usingPlayer = true;
}

function unloadPlayer() {
    context.usingPlayer = false;
    let iframe = document.getElementById("player");
    if (iframe)
        iframe.hidden = true;
    if (context.Player) {
        context.Player.stopVideo();
    }

    document.getElementById("playerId").value = "";
    context.Storage.removeItem('playerId');
}

function onYouTubeIframeAPIReady() {
    context.Player = new YT.Player('player', {
        height: '100',
        width: '300',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerReady(event) {
    ytPLAYING = YT.PlayerState.PLAYING;
    ytPAUSED = YT.PlayerState.PAUSED;
    ytBUFFERING = YT.PlayerState.BUFFERING;
    ytENDED = YT.PlayerState.ENDED;
    ytUNSTARTED = YT.PlayerState.UNSTARTED;
    ytCUED = YT.PlayerState.CUED;
    context.usingPlayer = true;
    loadPlayer();
}

function onPlayerStateChange(event) {
    switch(event.data) {
        case ytPLAYING:
            // console.log("Player state change: PLAYING", event.data);
            play();
            break;
        case ytPAUSED:
            // console.log("Player state change: PAUSED", event.data);
            pause();
            break;
        case ytBUFFERING:
            // console.log("Player state change: BUFFERING", event.data);
            // pause();
            break;
        case ytENDED:
            // console.log("Player state change: ENDED", event.data);
            break;
        case ytUNSTARTED:
            // console.log("Player state change: UNSTARTED", event.data);
            break;
        case ytCUED:
            // console.log("Player state change: CUED", event.data);
            break;
        default:
            // console.log("Player state change: " + event.data);
            break;
    }
}

function onPlayerError(event) {
    alert(`Error with YouTube video: ${event}`);
    context.usingPlayer = false;
}

// #endregion

// #region tab processing

function clearData() {
    context.Storage.removeItem(inputTabId);
    context.Storage.removeItem('playerId');
    location.reload();
}

function loadExample1() {
    console.log("load 1")
    context.Storage.setItem(inputTabId, BLACKBIRD_TAB);
    context.Storage.setItem('playerId', BLACKBIRD_VIDEO);
    setup2();
}

function loadExample2() {
    context.Storage.setItem(inputTabId, DOLLAR_TAB);
    context.Storage.setItem('playerId', DOLLAR_VIDEO);
    setup2();
}

// parse markers and display tab
function processTab() {
    let tabText = document.getElementById(inputTabId).value;
    context.Storage.setItem(inputTabId, tabText);
    
    context.markers = TabParser.ExtractMarkersFromTab(tabText);
    context.SortMarkers();
    
    context.Tab.SetText(tabText);
    context.Tab.Display();
    context.MarkerBar.Display();
    
    if (context.nextMarkerIndex != 0 || context.runtime != 0)
        resetTimer();

    document.body.focus();
}

// #endregion

// #region control flow

function playpause() {
    context.TabScroller.PlayPause();
}

function play() {
    context.TabScroller.Play();
}

function pause() {
    context.TabScroller.Pause();
}

function resetTimer() {
    context.TabScroller.ResetTimer();
}

function userSetTimer() {
    context.TabScroller.UserSetTimer();
}

// #endregion

function saveMarkerEditor() {
    context.MarkerEditor.Save();
}

function closeMarkerEditor() {
    context.MarkerEditor.Close();
}

function removeMarkerEditor() {
    context.MarkerEditor.Remove();
}

// #region keyboard controls


/*
Key controls (configurable):
    -left/right go back/forward seekTime seconds
    -up/down go to previous/next marker
    -space to pause/play
    -1234567890 to go to Nth marker
*/
document.addEventListener("keydown", (event) => {
    // event.key is "c", " ", "Meta"
    // event.code is "KeyC", "Space", "MetaRight"
    // console.log(`Keydown key=${event.key} code=${event.code}`);

    if (document.activeElement != document.body) {
        // don't intercept keys unless we're focused on the body
        return;
    }

    switch (event.key) {
        // toggle control help visiblity
        case ".":
            document.getElementById("controlHelp").hidden = 
                !document.getElementById("controlHelp").hidden;
            break;
        // restart
        case "R":
            context.TabScroller.ResetTimer();
            break;
        // skip back seekTime
        case "ArrowLeft":
            event.preventDefault();
            context.TabScroller.SetTimer(context.runtime-context.Settings.seekTime);
            break;
        // skip ahead seekTime
        case "ArrowRight":
            event.preventDefault();
            context.TabScroller.SetTimer(context.runtime+context.Settings.seekTime);
            break;
        // skip to previous marker
        case "ArrowUp":
            event.preventDefault();
            let prevMarkerIndex = Math.max(0, context.nextMarkerIndex-1);
            // skip another if we're just (< skipBackBuffer) past a marker
            if (context.runtime - context.markers[prevMarkerIndex].time < context.Settings.skipBackBuffer) {
                prevMarkerIndex = Math.max(0, context.nextMarkerIndex-2);
            }
            context.TabScroller.SetTimer(context.markers[prevMarkerIndex].time, true);
            break;
        // skip to next marker
        case "ArrowDown":
            event.preventDefault();
            context.TabScroller.SetTimer(context.markers[context.nextMarkerIndex].time, true);
            break;
        // toggle play/pause
        case " ":
            event.preventDefault();
            context.TabScroller.PlayPause();
            break;
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
            let num = parseInt(event.key);
            if (context.markers.length >= num + 1) {
                context.TabScroller.SetTimer(context.markers[num].time, true)
            }
            break;
    }
}, false);

// #endregion
