let runtime = 0;
let running = false;
let interval = 20;
let timestamps = [];
let nextStampIndex = 0;
let scrollBuffer = 0;
let Timer;
let Player;
let usingPlayer = false;

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

function onPlayerError(event) {
    alert(`Error loading YouTube video`);
    usingPlayer = false;
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

function processTab() {
    let tabText = document.getElementById('tabText').value;
    tabText = tabText.replace(/&/g, '&amp;');
    tabText = tabText.replace(/</g, '&lt;');
    tabText = tabText.replace(/>/g, '&gt;');
    localStorage.setItem('tabText', tabText);

    let success = getTimestamps(tabText);
    if (!success) {
        return;
    }
    if(timestamps.length > 1)
        nextStamp = timestamps[1];
    displayTab(tabText);
}

function getTimestamps(tab, options) {
    timestamps = [];
    let lines = tab.split('\n');
    let timestampRegex = /#\[\d\d:\d\d( [sn]| \d\d| \d\d [sn]| [sn] \d\d)?]/g;
    for (let li = 0; li < lines.length; li++) {
        let line = lines[li];
        let matches = line.match(timestampRegex);
        if (matches != null) {
            for (let match of matches) {
                let timeString = match.substr(2,5);
                let time = parseInt(timeString.substr(0,2)) * 60 + parseInt(timeString.substr(3,2));
                if (time == 0) time = 1;
                for (let stamp of timestamps) {
                    if (time == stamp.time) {
                        alert(`Cannot have multiple timestamps with the same time.\nLines ${stamp.line} and ${li}: ${timeString}`);
                        return false;
                    }
                }
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
    timestamps.unshift({
        time: 0,
        minutes: 0,
        seconds: 0,
        line: 0,
        type: 'snap',
        position: 0
    });
    timestamps.push({
        time: Infinity,
        minutes: Infinity,
        seconds: Infinity,
        line: lines.length-1,
        type: 'scroll',
        position: 1
    });
    timestamps.sort((a,b) => {
        if (a.time == b.time)
            return a.line - b.line;
        return a.time - b.time;
    });
    return true;
}

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

function run() {
    scrollTowards(nextStampIndex);
    if (usingPlayer) {
        runtime = Player.getCurrentTime();
    } else {
        runtime += interval/1000;
        runtime = parseFloat(runtime.toFixed(3))
    }
    renderTimer();
    if (nextStampIndex < timestamps.length) {
        if (runtime > timestamps[nextStampIndex].time) {
            nextStampIndex++;
            setLineColors();
        }
    } else {
        clearInterval(Timer);
    }
}

function renderTimer() {
    let runmins = Math.floor(runtime/60);
    let runsecs = Math.floor(runtime%60);
    runmins = runmins < 10 ? '0' + runmins : runmins;
    runsecs = runsecs < 10 ? '0' + runsecs : runsecs;
    document.getElementById('timer').innerHTML = `${runmins}:${runsecs}`;
}

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
    renderTimer();

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
    for (let i = 0; i < timestamps.length; i++) {
        if (runtime < timestamps[i].time) {
            nextStampIndex = i;
            break;
        }
    }
    scrollTowards(nextStampIndex-1, true);
    setLineColors();
    renderTimer();

    if (usingPlayer) {
        Player.seekTo(runtime, true);
    }
}

function scrollTowards(stampIndex, snap=false) {
    console.log('scroll towards ' + stampIndex);
    if (stampIndex >= 0 && stampIndex < timestamps.length) {
        let stamp = timestamps[stampIndex];
        // console.log(stamp.time, stamp.line, runtime);

        let line = document.getElementsByClassName('tab-display')[0].children[stamp.line];
        let target = window.innerHeight*stamp.position;

        let timeDiff, scrollAmount;
        let scrollDiff = line.getBoundingClientRect().y - target;
        timeDiff = Math.max(stamp.time - runtime, 1);
        if (stamp.time != Infinity) {
            scrollAmount = scrollDiff / timeDiff / (1000/interval);
        } else {
            scrollAmount = window.innerHeight / (1000/interval) / 10;
        }
        if (scrollAmount < 1) {
            scrollBuffer += scrollAmount;
            if (scrollBuffer >= 1) {
                scrollAmount = scrollBuffer;
                scrollBuffer = 0;
            }
        }
        
        // console.log(scrollAmount, scrollDiff, timeDiff);

        if (snap || (stamp.time - runtime < interval/1000 && stamp.type == 'snap')) {
            // console.log('3', nextStampIndex);
            window.scrollBy(0, scrollDiff);
        } else if (stamp.type == 'snap') {
            // console.log('2', nextStampIndex);
        } else {
            // console.log('1', nextStampIndex);
            window.scrollBy(0, scrollAmount);
        }
    }
}

