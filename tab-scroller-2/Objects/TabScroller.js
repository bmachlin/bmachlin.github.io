class TabScroller {
    constructor(context) {
        this.context = context;
        this.Timer = null;
        this.scrollBuffer = 0; // buffer for slow scroll speeds - for smoothness
    }

    UpdateTimerDisplay() {
        let runmins = Math.floor(this.context.runtime/60);
        let runsecs = Math.floor(this.context.runtime%60);
        // add '0' padding
        runmins = runmins < 10 ? '0' + runmins : runmins;
        runsecs = runsecs < 10 ? '0' + runsecs : runsecs;
    
        let runstring = this.context.runtime == Infinity ? "Infinity" : `${runmins}:${runsecs}`;
    
        document.getElementById('timer').innerHTML = runstring;
    }
    
    ActivateMarkers() {
        for (let marker of this.context.markers) {
            if (marker.ShouldActivate(this.context.runtime)) {
                marker.Activate();
            } else {
                marker.Deactivate();
            }
        }
    }
    
    UserSetTimer() {
        let timeText = document.getElementById("setTime").value;
        console.log("user SET to: " + timeText);
        let timeMatch = (timeText.match(/^\d\d:\d\d$/g) || []).length;
        if (timeMatch != 1) {
            alert('Invalid format. Must use: MM:SS');
            return;
        }
        this.SetTimer(parseInt(timeText.substr(0,2))*60 + parseInt(timeText.substr(3,2)), true);
    }
    
    ResetTimer() {
        console.log("RESET");
        this.SetTimer(0, true);
    }
    
    SetTimer(time, snap=false) {
        time = Math.max(0,time);
        if (this.context.usingPlayer) {
            time = Math.min(time, this.context.Player.getDuration());
        }
    
        // console.log("setting time", this.context.runtime, "->", time);
        this.context.runtime = time;
    
        this.SetMarkerIndex();
    
        if (snap) {
            this.SnapToMarker(Math.max(this.context.nextMarkerIndex-1,0));
        }
        
        if (this.context.usingPlayer && ![ytUNSTARTED, ytCUED].includes(this.context.Player.getPlayerState())) {
            this.context.Player.seekTo(this.context.runtime, true);
        }
    
        this.ActivateMarkers();
        this.UpdateTimerDisplay();
    }

    SetMarkerIndex() {
        // find next timestamp
        if (this.context.runtime == 0) {
            this.context.nextMarkerIndex = 0;
            return;
        }
        for (let i = 0; i < this.context.markers.length; i++) {
            if (this.context.runtime < this.context.markers[i].time) {
                this.context.nextMarkerIndex = i;
                break;
            }
        }
    }

    PlayPause() {
        this.context.running ? this.Pause() : this.Play();
    }
    
    Play() {
        if (!submitted()) return;
        console.log("PLAY");
        if (!this.context.running) {
            this.context.running = true;
            this.Timer = setInterval(() => this.Run(), this.context.interval);
        }
    
        if (this.context.usingPlayer && this.context.Player.getPlayerState() != ytPLAYING) {
            this.context.Player.playVideo();
        }
    
        // set focus to body for proper keypress fucntionality
        // this probably isn't best practice
        if (document.activeElement != document.body)
            document.body.focus({preventScroll: true });
        
        document.getElementById("btn-playpause").innerHTML = "Pause";
    }
    
    Pause() {
        if (!submitted()) return;
        console.log("PAUSE");
        this.context.running = false;
        clearInterval(this.Timer);
    
        if (this.context.usingPlayer && this.context.Player.getPlayerState() != ytPAUSED) {
            this.context.Player.pauseVideo();
        }
    
        document.getElementById("btn-playpause").innerHTML = "Play.";
    }
    
    // one cycle
    Run() {
        // check that we should be running
        if (this.context.running && this.context.usingPlayer 
            && (this.context.Player.getPlayerState() == ytPAUSED 
                || this.context.Player.getPlayerState() == ytUNSTARTED)) {
            this.Pause();
        }
    
        let newruntime = this.context.usingPlayer ? this.context.Player.getCurrentTime() : this.context.runtime + this.context.interval/1000;
        let rtDiff = Math.abs(this.context.runtime - newruntime);
        this.context.runtime = parseFloat(newruntime.toFixed(3));
        // if a large skip in runtime, reset marker state
        if (rtDiff > this.context.interval/1000*3) {
            // console.log("big skip")
            this.SetMarkerIndex();
            this.ActivateMarkers();
            this.SnapToMarker(Math.max(this.context.nextMarkerIndex-1,0));
        }
    
        this.UpdateTimerDisplay();
        this.ScrollTowards(this.context.nextMarkerIndex);
    
        // check to move on to next stamp 
        if (this.context.nextMarkerIndex == this.context.markers.length - 1) {
            if (Math.abs(window.pageYOffset + window.innerHeight - document.documentElement.scrollHeight) < 1) {
                // if we're on the last marker and at the bottom of the page
                if (!this.context.usingPlayer || this.context.Player.getPlayerState() == ytENDED) {
                    console.log("paused because end was reached")
                    this.Pause();
                }
            }
        } else if (this.context.runtime > this.context.markers[this.context.nextMarkerIndex].time) {
            this.context.nextMarkerIndex++;
            this.ActivateMarkers();
        }
    }
    
    SnapToMarker(markerIndex) {
        let marker = this.context.markers[markerIndex];
        let line = document.getElementById('tab-text').children[marker.line];
        let target = window.innerHeight * marker.position;
    
        if (!line) return;
    
        // console.log(markerIndex, "snaping to line", marker.line, "distance =", line.getBoundingClientRect().y - target);
        window.scrollBy(0, line.getBoundingClientRect().y - target);
    }
    
    // increment scroll the page towards the line at timestamps[stampIndex]
    // using the distance and time until that timestamp is hit to determine the rate
    ScrollTowards(markerIndex, snap=false) {
        if (markerIndex < 0 || markerIndex >= this.context.markers.length) {
            console.log(markerIndex + " not valid");
            return;
        }
        
        let marker = this.context.markers[markerIndex];
        let line = document.getElementById('tab-text').children[marker.line];
        let target = window.innerHeight * marker.position;
        // console.log(`SCROLL to  ${markerIndex}, (snap=${snap}, ${marker.time - this.context.runtime <= (this.context.interval+1)/1000 && marker.scroll == 'snap'})`);
    
        let scrollAmount = 0;
        let timeDiff = Math.max(marker.time - this.context.runtime, 0);
        // getBoundingClientRect.y tells us how for the element is from the top of the page (neg = above, pos = below)
        let scrollDiff = line ? line.getBoundingClientRect().y - target : null;
    
        if (marker.time != Infinity && scrollDiff != null) {
            scrollAmount = scrollDiff / timeDiff / (1000/this.context.interval);
        } else {
            // scroll speed for the final end of page timestamp
            scrollAmount = window.innerHeight / (1000/this.context.interval) / 10;
        }
    
        // if scroll speed is slower than 1 line per second, buffer it so it still looks smooth
        if (scrollAmount < 1) {
            this.scrollBuffer += scrollAmount;
            if (this.scrollBuffer >= 1) {
                scrollAmount = Math.floor(this.scrollBuffer);
                this.scrollBuffer = this.scrollBuffer % 1;
            }
        } else {
            this.scrollBuffer = 0;
        }
    
        // snap to the timestamp if the flag is set
        // or it's close enough to its time and it's a snap type stamp
        if (snap || (marker.time - this.context.runtime <= (this.context.interval+1)/1000 && marker.scroll == 'snap')) {
            window.scrollBy(0, scrollDiff);
        } else if (marker.scroll != 'snap') {
            window.scrollBy(0, scrollAmount);
        } // else do nothing
    }
}