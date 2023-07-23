// Ben Machlin, 2021

/*
Key controls: 
    -left/right go back/forward X seconds - configurable
    -up/down to go between markers
    -space to pause/resume
    -1234567890 to go to nth marker
Markers:
    -Time: when the marker is activated
    -Position: vertical position it should be in the screen
    -Scroll: method of scroll TO the marker leading up to Time
    -Artificial: whether the marker represents a line in the tab or was artificially created
Cool stuff:
    -interactive tab area
        -click to create marker w/options   
*/

// defaults
let defaultSeekTime = 5;
let defaultSkipBackBuffer = 1.0;

// default ytPlayer state values
let ytUNSTARTED = -1;
let ytENDED = 0;
let ytPLAYING = 1;
let ytPAUSED = 2;
let ytBUFFERING = 3;
let ytCUED = 5;

// globals
let running = false;        // master play/pause status
let runtime = 0;            // master time
let interval = 20;          // frequency of run cycle in ms
let nextMarkerIndex = 0;    // next marker. the one we're scrolling towards
let scrollBuffer = 0;       // buffer for slow scroll speeds - for smoothness
let markers = [];           // list of markers to scroll among
let usingPlayer = false;    // if we're using a YT player to control our timer
let Timer;                  // the run cycle controller
let Player;                 // the YT player object
let seekTime = 5;           // time to seek forward or back when pressing seek keys
let skipBackBuffer = 1;     // buffer time to after a marker's time has passed 
                            //      to skip to the marker behind it when skipping back
let storage;

function setup() {
    storage = new Storage();
    
    loadSettings();

    // populate fields from last use
    if (storage.getItem('tabText')) {
        let textArea = document.getElementById('tabText');
        textArea.value = storage.getItem('tabText');
        processTab();
    }
    if (storage.getItem('playerId'))  {
        let playerInput = document.getElementById('playerId');
        playerInput.value = storage.getItem('playerId');
        createPlayer();
    }

}

function submitted() {
    return document.getElementById("tab-display").childElementCount > 0;
}

// #region settings

function loadSettings() {
    seekTime = parseInt(storage.getItem('seekTime'));
    if (!seekTime) {
        seekTime = defaultSeekTime;
    }
    document.getElementById("seekInput").value = seekTime;

    skipBackBuffer = parseFloat(storage.getItem('skipBackBuffer'));
    if (!skipBackBuffer) {
        skipBackBuffer = defaultSkipBackBuffer;
    }
    document.getElementById("skipBackInput").value = skipBackBuffer;
}

function saveSettings(st=null, sbb=null) {
    storage.setItem('seekTime', st ?? document.getElementById("seekInput").value);
    storage.setItem('skipBackBuffer', sbb ?? document.getElementById("skipBackInput").value);
    console.log("saved settings", (st ?? seekTime), (sbb ?? skipBackBuffer));
    loadSettings();
}

function defaultSettings() {
    saveSettings(defaultSeekTime, defaultSkipBackBuffer);
}

function setSeekTime() {
    let seekInput = parseInt(document.getElementById("seekInput").value);
    if (!isNaN(seekInput)) {
        console.log("Set seekTime to", seekInput);
        seekTime = seekInput;
    }
}

// #endregion

// #region Youtube player

function createPlayer() {
    // only create player if it isn't already created
    if (!Player) {
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
    if (!Player) {
        createPlayer();
        return;
    }
    // show iframe if hidden
    let iframe = document.getElementById("player");
    if (iframe) iframe.hidden = false;

    // set player id and store value
    let id = document.getElementById('playerId').value;
    storage.setItem('playerId', id);
    Player.cueVideoById(id);

    usingPlayer = true;
}

function unloadPlayer() {
    usingPlayer = false;
    let iframe = document.getElementById("player");
    if (iframe)
        iframe.hidden = true;
    if (Player) {
        Player.stopVideo();
    }
}

function onYouTubeIframeAPIReady() {
    Player = new YT.Player('player', {
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
    usingPlayer = true;
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
    usingPlayer = false;
}

// #endregion

// #region tab processing

function clearData() {
    storage.removeItem('tabText');
    storage.removeItem('playerId');
    location.reload();
}

function loadExample1() {
    storage.setItem('tabText', BLACKBIRD_TAB);
    storage.setItem('playerId', BLACKBIRD_VIDEO);
    setup();
}

function loadExample2() {
    storage.setItem('tabText', DOLLAR_TAB);
    storage.setItem('playerId', DOLLAR_VIDEO);
    setup();
}

// parse markers and display tab
function processTab() {
    let tabText = document.getElementById('tabText').value;
    storage.setItem('tabText', tabText);
    extractMarkersFromTab(tabText);
    displayTab(tabText);
    if (nextMarkerIndex != 0 || runtime != 0)
        resetTimer();
    document.body.focus();
}

function extractMarkersFromTab(tab, options) {
    markers = [];

    let lines = tab.split('\n');
    for (let li = 0; li < lines.length; li++) {
        markers.push(...extractMarkers(lines[li], li, options));
    }

    // set starting timestamp to snap to top of tab
    markers.unshift(new Marker(0, 0, 'snap', 0));
    // set ending timestamp so that it scrolls to the end after the last stamp
    markers.push(new Marker(Infinity, 1, 'scroll', lines.length));
    
    markers.sort((a,b) => a.time - b.time);
}

function extractMarkers(line, li, options) {
    let markerRegex = /#\[\d\d:\d\d( [sn]| \d\d| \d\d [sn]| [sn] \d\d)?]/g;
    let matches = line.match(markerRegex);
    if (matches == null || matches.length == 0) {
        return []
    }
    marks = []
    for (let match of matches) {
        let marker = markerStringToObject(match);
        if (marker == null)
            continue;
        if (marker.time == 0) {
            alert(`Time 0 is reserved - fix line ${li}: ${match}`);
            return false;
        }
        for (let m of markers) {
            if (marker.time == m.time) {
                alert(`Cannot have multiple markers with the same time.\nLines ${m.line} and ${li}: ${timeString}`);
                return false;
            }
        }
        marker.setLine(li);
        marks.push(marker); 
    }
    return marks;
}

function markerStringToObject(markerString, options) {
    let timeString = markerString.substr(2,5); // "MM:SS"
    let time = parseInt(timeString.substr(0,2)) * 60 + parseInt(timeString.substr(3,2));
    let scrollType = 'scroll'; // default scroll type
    let position = 0.5; // default position
    if (markerString.length == 10) {
        scrollType = markerString.charAt(8).toLowerCase() == 'n' ? 'snap' : 'scroll'
    } else if (markerString.length == 11) {
        position = parseInt(markerString.substr(8,2))/100;
    } else if (markerString.length == 13) {
        if (isNaN(parseInt(markerString.substr(8,2)))) {
            // scroll type was listed first
            scrollType = markerString.charAt(8).toLowerCase() == 'n' ? 'snap' : 'scroll'
            position = parseInt(markerString.substr(10,2))/100;
        } else {
            scrollType = markerString.charAt(11).toLowerCase() == 'n' ? 'snap' : 'scroll'
            position = parseInt(markerString.substr(8,2))/100;
        }
    }

    return new Marker(time,position,scrollType)
}

// turn the input tab into displayed text
function displayTab(tab) {
    let lines = tab.split('\n');
    let display = document.getElementById('tab-display');
    display.innerHTML = '';
    for (let li = 0; li < lines.length; li++) {
        if (lines[li] == "") {
            display.appendChild(document.createElement('br'));
        } else {
            let lineElement = document.createElement('p');
            lineElement.innerHTML = '<pre>' + lines[li] + '</pre>';
            display.appendChild(lineElement);
        }
    }
    let bottomSpace = document.createElement("div");
    bottomSpace.id = "bottomSpace";
    bottomSpace.setAttribute("style", `height: 140px`);
    bottomSpace.innerHTML = " ";
    display.after(bottomSpace);
}

// #endregion

// #region control flow

function playpause() {
    running ? pause() : play();
}

function play() {
    if (!submitted()) return;
    console.log("PLAY");
    if (!running) {
        running = true;
        Timer = setInterval(run, interval);
    }

    if (usingPlayer && Player.getPlayerState() != ytPLAYING) {
        Player.playVideo();
    }

    // set focus to body for proper keypress fucntionality
    // this probably isn't best pracitce
    if (document.activeElement != document.body)
        document.body.focus();
}

function pause() {
    if (!submitted()) return;
    console.log("PAUSE");
    running = false;
    clearInterval(Timer);

    if (usingPlayer && Player.getPlayerState() != ytPAUSED) {
        Player.pauseVideo();
    }
}

// one cycle
function run() {
    // check that we should be running
    if (running && usingPlayer 
        && (Player.getPlayerState() == ytPAUSED 
            || Player.getPlayerState() == ytUNSTARTED)) {
        pause();
    }

    let newruntime = usingPlayer ? Player.getCurrentTime() : runtime + interval/1000;
    let rtDiff = Math.abs(runtime - newruntime);
    runtime = parseFloat(newruntime.toFixed(3));
    // if a large skip in runtime, reset marker state
    if (rtDiff > interval/1000*2) {
        setMarkerIndex();
        activateMarkers();
    }

    updateTimerDisplay();
    scrollTowards(nextMarkerIndex);

    // check to move on to next stamp 
    if (nextMarkerIndex == markers.length - 1) {
        if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 2) {
            // if we're on the last marker and at the bottom of the page
            if (!usingPlayer || Player.getPlayerState() == ytENDED) {
                console.log("paused because end was reached")
                pause();
            }
        }
    } else if (runtime > markers[nextMarkerIndex].time) {
        nextMarkerIndex++;
        activateMarkers();
    }
}

function updateTimerDisplay() {
    let runmins = Math.floor(runtime/60);
    let runsecs = Math.floor(runtime%60);
    // add '0' padding
    runmins = runmins < 10 ? '0' + runmins : runmins;
    runsecs = runsecs < 10 ? '0' + runsecs : runsecs;

    let runstring = runtime == Infinity ? "Infinity" : `${runmins}:${runsecs}`;

    document.getElementById('timer').innerHTML = runstring;
}

function activateMarkers() {
    for (let marker of markers) {
        if (marker.shouldActivate(runtime)) {
            marker.activate();
        } else {
            marker.deactivate();
        }
    }
}

function userSetTimer() {
    let timeText = document.getElementById("setTime").value;
    console.log("user SET to: " + timeText);
    let timeMatch = (timeText.match(/^\d\d:\d\d$/g) || []).length;
    if (timeMatch != 1) {
        alert('Invalid format. Must use: MM:SS');
        return;
    }
    setTimer(parseInt(timeText.substr(0,2))*60 + parseInt(timeText.substr(3,2)));
}

function resetTimer() {
    console.log("RESET");
    setTimer(0, true);
}

function setTimer(time, snap=false) {
    time = Math.max(0,time);
    if (usingPlayer) {
        time = Math.min(time, Player.getDuration());
    }

    console.log("setting time", runtime, "->", time);
    runtime = time;

    setMarkerIndex();

    if (snap) {
        scrollTowards(nextMarkerIndex-1, true);
    }
    
    if (usingPlayer && ![ytUNSTARTED, ytCUED].includes(Player.getPlayerState())) {
        Player.seekTo(runtime, true);
    }

    activateMarkers();
    updateTimerDisplay();
}

function setMarkerIndex() {
    // find next timestamp
    if (runtime == 0)
        return 0;
    for (let i = 0; i < markers.length; i++) {
        if (runtime < markers[i].time) {
            nextMarkerIndex = i;
            break;
        }
    }
}

function snapToMarker(marker) {
    let line = document.getElementById('tab-display').children[marker.line];
    let target = window.innerHeight * marker.position;

    if (!line) return;

    console.log("snaping to line", marker.line, "distance =", line.getBoundingClientRect().y - target);
    window.scrollBy(0, line.getBoundingClientRect().y - target);
}

// increment scroll the page towards the line at timestamps[stampIndex]
// using the distance and time until that timestamp is hit to determine the rate
function scrollTowards(markerIndex, snap=false) {
    console.log('SCROLL to ' + markerIndex);
    if (markerIndex < 0 || markerIndex >= markers.length) {
        console.log(markerIndex + " not valid");
        return;
    }

    let marker = markers[markerIndex];
    let line = document.getElementById('tab-display').children[marker.line];
    let target = window.innerHeight * marker.position;

    let scrollAmount = 0;
    let timeDiff = Math.max(marker.time - runtime, 0);
    let scrollDiff = line ? line.getBoundingClientRect().y - target : null;

    if (marker.time != Infinity && scrollDiff != null) {
        scrollAmount = scrollDiff / timeDiff / (1000/interval);
    } else {
        // scroll speed for the final end of page timestamp
        scrollAmount = window.innerHeight / (1000/interval) / 10;
    }

    // if scroll speed is slower than 1 line per second, buffer it so it still looks smooth
    if (scrollAmount < 1) {
        scrollBuffer += scrollAmount;
        if (scrollBuffer >= 1) {
            scrollAmount = Math.floor(scrollBuffer);
            scrollBuffer = scrollBuffer % 1;
        }
    } else {
        scrollBuffer = 0;
    }

    // snap to the timestamp if the flag is set
    // or it's close enough to its time and it's a snap type stamp
    if (snap || (marker.time - runtime <= (interval+1)/1000 && marker.scroll == 'snap')) {
        window.scrollBy(0, scrollDiff);
    } else if (marker.scroll != 'snap') {
        window.scrollBy(0, scrollAmount);
    } // else do nothing
}

// #endregion

// #region keyboard controls

document.addEventListener("keydown", (event) => {
    // event.key is "c", " ", "Meta"
    // event.code is "KeyC", "Space", "MetaRight"
    // console.log(`Keydown key=${event.key} code=${event.code}`);

    if (document.activeElement != document.body) {
        // don't intercept keys unless we're focused on the body
        return;
    }

    switch (event.code) {
        // toggle control help visiblity
        case "Period":
            document.getElementById("controlHelp").hidden = 
                !document.getElementById("controlHelp").hidden;
            break;
        // restart
        case "KeyR":
            resetTimer();
            break;
        // skip back seekTime
        case "ArrowLeft":
            event.preventDefault();
            setTimer(runtime-seekTime);
            break;
        // skip ahead seekTime
        case "ArrowRight":
            event.preventDefault();
            setTimer(runtime+seekTime);
            break;
        // skip to previous marker
        case "ArrowUp":
            event.preventDefault();
            prevMarkerIndex = Math.max(0, nextMarkerIndex-1);
            // skip another if we're just (< skipBackBuffer) past a marker
            if (runtime - markers[prevMarkerIndex].time < skipBackBuffer) {
                prevMarkerIndex = Math.max(0, nextMarkerIndex-2);
            }
            setTimer(markers[prevMarkerIndex].time, true);
            break;
        // skip to next marker
        case "ArrowDown":
            event.preventDefault();
            console.log("-------",markers[nextMarkerIndex].time);
            setTimer(markers[nextMarkerIndex].time, true);
            break;
        // toggle play/pause
        case "Space":
            event.preventDefault();
            playpause();
            break;
        case "Digit0":
        case "Digit1":
        case "Digit2":
        case "Digit3":
        case "Digit4":
        case "Digit5":
        case "Digit6":
        case "Digit7":
        case "Digit8":
        case "Digit9":
            let num = parseInt(event.key);
            if (markers.length >= num + 1) {
                setTimer(markers[num].time, true)
            }
            break;
    }
}, false);

// #endregion
