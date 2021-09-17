// Ben Machlin, 2021

/*
Key controls: 
    -left/right go back/forward a few seconds (with configurable offet)
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

function setup() {
    loadSettings();

    // populate fields from last use
    if (localStorage.getItem('tabText') != null) {
        let textArea = document.getElementById('tabText');
        textArea.value = localStorage.getItem('tabText');
        // processTab();
    }
    if (localStorage.getItem('playerId') != null) {
        let playerInput = document.getElementById('playerId');
        playerInput.value = localStorage.getItem('playerId');
        createPlayer();
    }

}

// #region settings

function loadSettings() {
    console.log("load settings");
    seekTime = parseInt(localStorage.getItem('seekTime'));
    if (!seekTime) {
        seekTime = defaultSeekTime;
    }
    document.getElementById("seekInput").value = seekTime;

    skipBackBuffer = parseFloat(localStorage.getItem('skipBackBuffer'));
    if (!skipBackBuffer) {
        skipBackBuffer = defaultSkipBackBuffer;
    }
    document.getElementById("skipBackInput").value = skipBackBuffer;
}

function saveSettings(st=null, sbb=null) {
    localStorage.setItem('seekTime', st ?? document.getElementById("seekInput").value);
    localStorage.setItem('skipBackBuffer', sbb ?? document.getElementById("skipBackInput").value);
    loadSettings();
    console.log("saved settings", (st ?? seekTime), (sbb ?? skipBackBuffer));
}

function defaultSettings() {
    saveSettings(defaultSeekTime, defaultSkipBackBuffer);
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
    localStorage.setItem('playerId', id);
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
    usingPlayer = true;
    loadPlayer();
}

function onPlayerStateChange(event) {
    switch(event.data) {
        case YT.PlayerState.PLAYING:
            // console.log("Player state change: PLAYING", event.data);
            play();
            break;
        case YT.PlayerState.PAUSED:
            // console.log("Player state change: PAUSED", event.data);
            pause();
            break;
        case YT.PlayerState.BUFFERING:
            // console.log("Player state change: BUFFERING", event.data);
            // pause();
            break;
        case YT.PlayerState.ENDED:
            // console.log("Player state change: ENDED", event.data);
            break;
        case YT.PlayerState.UNSTARTED:
            // console.log("Player state change: UNSTARTED", event.data);
            break;
        case YT.PlayerState.CUED:
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
    localStorage.removeItem('tabText');
    localStorage.removeItem('playerId');
    location.reload();
}

function loadExample1() {
    localStorage.setItem('tabText', BLACKBIRD_TAB);
    localStorage.setItem('playerId', BLACKBIRD_VIDEO);
    location.reload();
}

function loadExample2() {
    localStorage.setItem('tabText', DOLLAR_TAB);
    localStorage.setItem('playerId', DOLLAR_VIDEO);
    location.reload();
}

// parse markers and display tab
function processTab() {
    let tabText = document.getElementById('tabText').value;
    localStorage.setItem('tabText', tabText);
    extractMarkersFromTab(tabText);
    displayTab(tabText);
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
    markers.push(new Marker(Player ? Player.getDuration() : Infinity, 1, 'scroll', lines.length));
    
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
        scrollType = markerString.charAt(8) == 'n' ? 'snap' : 'scroll'
    } else if (markerString.length == 11) {
        position = parseInt(markerString.substr(8,2))/100;
    } else if (markerString.length == 13) {
        if (isNaN(parseInt(markerString.substr(8,2)))) {
            // scroll type was listed first
            scrollType = markerString.charAt(8) == 'n' ? 'snap' : 'scroll'
            position = parseInt(markerString.substr(10,2))/100;
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
    console.log("PLAY");
    if (!running) {
        running = true;
        Timer = setInterval(run, interval);
    }

    if (usingPlayer && Player.getPlayerState() != YT.PlayerState.PLAYING) {
        Player.playVideo();
    }
}

function pause() {
    console.log("PAUSE");
    running = false;
    clearInterval(Timer);

    if (usingPlayer && Player.getPlayerState() != YT.PlayerState.PAUSED) {
        Player.pauseVideo();
    }
}

// one cycle
function run() {
    if (running && usingPlayer 
        && (Player.getPlayerState() == YT.PlayerState.PAUSED 
            || Player.getPlayerState() == YT.PlayerState.UNSTARTED)) {
        pause();
    }

    scrollTowards(nextMarkerIndex);

    if (usingPlayer) {
        newruntime = Player.getCurrentTime();
    } else {
        newruntime = runtime + interval/1000;
    }
    if (Math.abs(runtime - newruntime) > interval/1000*2) {
        setMarkerIndex();
        activateMarkers(newruntime);
    }
    runtime = parseFloat(newruntime.toFixed(3));

    updateTimerDisplay();

    // check to move on to next stamp 
    if (nextMarkerIndex == markers.length - 1) {
        if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 2) {
            // if we're on the last marker and at the bottom of the page
            if (!usingPlayer || Player.getPlayerState() == YT.PlayerState.ENDED) {
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
    document.getElementById('timer').innerHTML = `${runmins}:${runsecs}`;
}

function activateMarkers(t=-1) {
    // act=[];
    // dact=[];
    for (let marker of markers) {
        if (marker.shouldActivate(t < 0 ? runtime : t)) {
            // act.push(marker.line);
            marker.activate();
        } else {
            // dact.push(marker.line);
            marker.deactivate();
        }
    }
    // console.log("Activate", act)
    // console.log("Decativate", dact);
}

function resetTimer() {
    console.log("RESET");
    setTimer(0, true);
}

function userSetTimer() {
    let timeText = document.getElementById("setTime").value;
    console.log("SET to: " + timeText);
    let timeMatch = (timeText.match(/^\d\d:\d\d$/g) || []).length;
    if (timeMatch != 1) {
        alert('Invalid format. Must use: MM:SS');
        return;
    }
    setTimer(parseInt(timeText.substr(0,2))*60 + parseInt(timeText.substr(3,2)));
}

function setTimer(time, snap=false) {
    time = Math.max(0,time);
    if (usingPlayer) {
        time = Math.min(time, Player.getDuration());
    }

    console.log("setting time", runtime, "->", time);
    runtime = time;

    setMarkerIndex();

    if (snap)
        snapToMarker(markers[nextMarkerIndex-1]);
    
    if (usingPlayer) {
        Player.seekTo(runtime, true);
    }

    // snap to appropriate previous timestamp
    scrollTowards(nextMarkerIndex-1, true);
    activateMarkers();
    updateTimerDisplay();

}

function setMarkerIndex() {
    // find new next timestamp
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
    // console.log('SCROLL to ' + markerIndex);
    if (markerIndex < 0 || markerIndex >= markers.length) {
        console.log(markerIndex + " not valid");
        return;
    }

    let marker = markers[markerIndex];
    let line = document.getElementById('tab-display').children[marker.line];
    let target = window.innerHeight * marker.position;

    let scrollAmount = 0;
    let timeDiff = Math.max(marker.time - runtime, 1);
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
    if (snap || (marker.time - runtime < interval/1000 && marker.scrollType == 'snap')) {
        window.scrollBy(0, scrollDiff);
    } else if (marker.scrollType != 'snap') {
        window.scrollBy(0, scrollAmount);
    } // else do nothing
}

// #endregion

// #region keyboard controls

function setSeekTime() {
    let seekInput = parseInt(document.getElementById("seekInput").value);
    if (!isNaN(seekInput)) {
        console.log("Set seekTime to", seekInput);
        seekTime = seekInput;
    }
}

document.addEventListener("keydown", (event) => {
    // var keyName = event.key; // "c", " ", "Meta"
    // var keyCode = event.code; // "KeyC", "Space", "MetaRight"
    console.log(`Keyup key=${event.key} code=${event.code}`);

    if (document.activeElement != document.body) {
        // don't intercept keys unless we're focused on the body
        return;
    }

    switch (event.code) {
        case "Period":
            console.log("toggled control help hidden")
            document.getElementById("controlHelp").hidden = 
                !document.getElementById("controlHelp").hidden;
            break;
        case "KeyR":
            resetTimer();
            break;
        case "ArrowLeft":
            event.preventDefault();
            setTimer(runtime-seekTime);
            break;
        case "ArrowRight":
            event.preventDefault();
            setTimer(runtime+seekTime);
            break;
        case "ArrowUp":
            event.preventDefault();
            prevMarkerIndex = Math.max(0, nextMarkerIndex-1);
            if (runtime - markers[prevMarkerIndex].time < skipBackBuffer) {
                // skip another if we're just past a marker
                prevMarkerIndex = Math.max(0, nextMarkerIndex-2);
            }
            setTimer(markers[prevMarkerIndex].time, true);
            break;
        case "ArrowDown":
            event.preventDefault();
            console.log("-------",markers[nextMarkerIndex].time);
            setTimer(markers[nextMarkerIndex].time, true);
            break;
        case "Space":
            event.preventDefault();
            prevMarkerIndex = Math.max(0, nextMarkerIndex-1);
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

class Marker {
    // time = seconds into song to activate marker
    // position = vertical position marker should be when activated
    // line = line number
    // scroll = type of scroll to get to marker
    // artificial = is this marker hidden/created for control purposes e.g. start/end
    constructor(time, position, scroll, line=-1) {
        this.time = Math.round(time);
        this.minutes = Math.floor(time/60);
        this.seconds = Math.floor(time%60);
        this.position = position;
        this.scroll = scroll;
        this.inactiveColor = "black";
        this.activeColor = "red";
        this.activated = false;
        this.line = line;
        if (line != -1)
            this.setLine(line);
    }

    setLine(line) {
        this.line = line;
        this.artificial = line < 1 || line > document.getElementById('tabText').value.split("\n").length;
    }

    shouldActivate(t) {
        return t >= this.time;
    }

    activate() {
        if (!this.activated) {
            this.setColor(this.activeColor);
            this.activated = true;
        }
    }

    deactivate() {
        if (this.activated) {
            this.setColor(this.inactiveColor);
            this.activated = false;
        }
    }

    setColor(color) {
        if (!this.artificial) {
            document.getElementById("tab-display").children[this.line].setAttribute("style", `color: ${color}`);
        }
    }
}
