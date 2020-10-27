// Ben Machlin, 2020

let running = false;        // master play/pause status
let runtime = 0;            // master time
let interval = 20;          // frequency of run cycle in ms
let nextStampIndex = 0;     // next time stamp. the one we're scrolling towards
let scrollBuffer = 0;       // buffer for slow scroll speeds - for smoothness
let timestamps = [];        // list of timestamps to scroll among
let usingPlayer = false;    // if we're using a YT player to control our timer
let Timer;                  // the run cycle controller
let Player;                 // the YT player

///////// Youtube player stuff /////////
function createPlayer() {
    let tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    let timerElement = document.getElementById('timer');
    timerElement.parentNode.insertBefore(tag, timerElement);
}

function onYouTubeIframeAPIReady() {
    let id = document.getElementById('playerId').value;
    localStorage.setItem('playerId', id);
    Player = new YT.Player('player', {
        height: '100',
        width: '300',
        videoId: id,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerReady(event) {
    usingPlayer = true;
}

function onPlayerStateChange(event) {
    console.log("Player state change: " + event.data);
    switch(event.data) {
        case YT.PlayerState.PLAYING:
            play();
            break;
        case YT.PlayerState.PAUSED:
            pause();
            break;
        case YT.PlayerState.BUFFERING:
            pause();
            break;
        case YT.PlayerState.ENDED:
            break;
    
    }
}

function onPlayerError(event) {
    alert(`Error with YouTube video`);
    usingPlayer = false;
}
////////////////////////////////////

// populate fields from last use
function setup() {
    if (localStorage.getItem('tabText') != null) {
        let textArea = document.getElementById('tabText');
        textArea.value = localStorage.getItem('tabText');
        processTab();
    }
    if (localStorage.getItem('playerId') != null) {
        let playerInput = document.getElementById('playerId');
        playerInput.value = localStorage.getItem('playerId');
        createPlayer();
    }
}

// prase timestamps and display tab
function processTab() {
    let tabText = document.getElementById('tabText').value;
    // remove possible HTML shenanigans
    tabText = tabText.replace(/&/g, '&amp;');
    tabText = tabText.replace(/</g, '&lt;');
    tabText = tabText.replace(/>/g, '&gt;');
    // save locally
    localStorage.setItem('tabText', tabText);

    let success = getTimestamps(tabText);
    if (!success) {
        // alert thrown in getTimestamps()
        return;
    }

    displayTab(tabText);
}

// parse timestamps from input. options not yet implemented
function getTimestamps(tab, options) {
    timestamps = [];
    let lines = tab.split('\n');
    let timestampRegex = /#\[\d\d:\d\d( [sn]| \d\d| \d\d [sn]| [sn] \d\d)?]/g;
    for (let li = 0; li < lines.length; li++) {
        let line = lines[li];
        let matches = line.match(timestampRegex);
        if (matches != null) {
            for (let match of matches) {
                let timeString = match.substr(2,5); // "MM:SS"
                let time = parseInt(timeString.substr(0,2)) * 60 + parseInt(timeString.substr(3,2));
                if (time == 0) {
                    alert(`Cannot have timestamp with time 0 at line ${li}: ${match}`);
                    return false;
                }
                for (let stamp of timestamps) {
                    if (time == stamp.time) {
                        alert(`Cannot have multiple timestamps with the same time.\nLines ${stamp.line} and ${li}: ${timeString}`);
                        return false;
                    }
                }
                // parse options
                let type = 'scroll';
                let position = 0.5;
                if (match.length == 10) {
                    type = match.charAt(8) == 'n' ? 'snap' : 'scroll'
                } else if (match.length == 11) {
                    position = parseInt(match.substr(8,2))/100;
                } else if (match.length == 13) {
                    if (isNaN(parseInt(match.substr(8,2)))) {
                        type = match.charAt(8) == 'n' ? 'snap' : 'scroll'
                        position = parseInt(match.substr(10,2))/100;
                    }
                }
                let timestamp = {
                    time,
                    minutes: Math.floor(time/60),
                    seconds: Math.floor(time%60),
                    line: li,
                    type,
                    position
                }
                timestamps.push(timestamp);
            }
        }
    }
    // set starting timestamp to snap to top of tab
    timestamps.unshift({
        time: 0,
        minutes: 0,
        seconds: 0,
        line: 0,
        type: 'snap',
        position: 0
    });
    // set ending timestamp so that it scrolls to the end after the last stamp
    timestamps.push({
        time: Infinity,
        minutes: Infinity,
        seconds: Infinity,
        line: lines.length-1,
        type: 'scroll',
        position: 1
    });
    // sort on time
    timestamps.sort((a,b) => a.time - b.time);
    return true;
}

// turn the input tab into displayed text
function displayTab(tab) {
    let lines = tab.split('\n');
    let display = document.getElementsByClassName('tab-display')[0];
    display.innerHTML = '';
    for (let li = 0; li < lines.length; li++) {
        let lineElement = document.createElement('p');
        lineElement.innerHTML = '<pre>' + lines[li] + '</pre>';
        display.appendChild(lineElement);
    }
}

// one cycle
function run() {
    scrollTowards(nextStampIndex);
    if (usingPlayer) {
        runtime = Player.getCurrentTime();
    } else {
        runtime += interval/1000;
        runtime = parseFloat(runtime.toFixed(3))
    }

    updateTimerDisplay();

    // check to move on to next stamp 
    if (nextStampIndex < timestamps.length) {
        if (runtime > timestamps[nextStampIndex].time) {
            nextStampIndex++;
            setLineColors();
        }
    } else {
        clearInterval(Timer);
    }
}

// update the timer
function updateTimerDisplay() {
    let runmins = Math.floor(runtime/60);
    let runsecs = Math.floor(runtime%60);
    // add '0' padding
    runmins = runmins < 10 ? '0' + runmins : runmins;
    runsecs = runsecs < 10 ? '0' + runsecs : runsecs;
    document.getElementById('timer').innerHTML = `${runmins}:${runsecs}`;
}

// turn lines with timestamps red if their time has passed
function setLineColors() {
    let stamps = document.getElementsByClassName('tab-display')[0].children;
    for (let i = 1; i < timestamps.length-1; i++) {
        let style = timestamps[i].time > runtime ? 'color: black' : 'color: red'
        document.getElementsByClassName('tab-display')[0].children[timestamps[i].line].style = style;
    }
}

function playpause() {
    if (running) {
        pause();
    } else {
        play();
    }
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

function resetTimer() {
    console.log("RESET");
    pause();
    runtime = 0;
    nextStampIndex = 0;
    setLineColors();
    updateTimerDisplay();

    if (usingPlayer) {
        Player.seekTo(0, true);
    }
}

function setTimer() {
    let timeText = document.getElementById("setTime").value;
    console.log("SET to: " + timeText);
    let timeMatch = (timeText.match(/^\d\d:\d\d$/g) || []).length;
    if (timeMatch != 1) {
        alert('Invalid format. Must use: MM:SS');
        return;
    }
    runtime = parseInt(timeText.substr(0,2))*60 + parseInt(timeText.substr(3,2));
    // find new next timestamp
    for (let i = 0; i < timestamps.length; i++) {
        if (runtime < timestamps[i].time) {
            nextStampIndex = i;
            break;
        }
    }
    // snap to appropriate previous timestamp
    scrollTowards(nextStampIndex-1, true);
    setLineColors();
    updateTimerDisplay();

    if (usingPlayer) {
        Player.seekTo(runtime, true);
    }
}

// increment scroll the page towards the line at timestamps[stampIndex]
// using the distance and time until that timestamp is hit to determine the rate
function scrollTowards(stampIndex, snap=false) {
    console.log('SCROLL to ' + stampIndex);
    if (stampIndex >= 0 && stampIndex < timestamps.length) {
        let stamp = timestamps[stampIndex];
        let line = document.getElementsByClassName('tab-display')[0].children[stamp.line];
        let target = window.innerHeight*stamp.position;

        let scrollAmount = 0;
        let scrollDiff = line.getBoundingClientRect().y - target;
        let timeDiff = Math.max(stamp.time - runtime, 1);

        if (stamp.time != Infinity) {
            scrollAmount = scrollDiff / timeDiff / (1000/interval);
        } else {
            // scroll speed for the final end of page timestamp
            scrollAmount = window.innerHeight / (1000/interval) / 10;
        }

        // if scroll speed is slower than 1 line per second, buffer it so it still looks smooth
        if (scrollAmount < 1) {
            scrollBuffer += scrollAmount;
            if (scrollBuffer >= 1) {
                scrollAmount = scrollBuffer;
                scrollBuffer = 0;
            }
        }

        // snap to the timestamp if the flag is set
        // or it's close enough to its time and it's a snap type stamp
        if (snap || (stamp.time - runtime < interval/1000 && stamp.type == 'snap')) {
            window.scrollBy(0, scrollDiff);
        } else if (stamp.type != 'snap') {
            window.scrollBy(0, scrollAmount);
        } // else do nothing
    }
}

