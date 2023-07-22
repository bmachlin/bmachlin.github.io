class Context {
    constructor() { 
        this.markerRegex = /#\[\d\d:\d\d( [sn]| \d\d| \d\d [sn]| [sn] \d\d)?]/g;
        this.running = false;           // point-of-truth play/pause status
        this.runtime = 0;               // point-of-truth time
        this.interval = 20;             // frequency of run cycle in ms
        this.nextMarkerIndex = 0;       // index of next marker. the one we're scrolling towards
        this.markers = [];              // list of markers to scroll among
        this.usingPlayer = false;       // if we're using a YT player to control our timer

        this.Timer = null;              // the run cycle controller
        this.Player = null;             // the YT player object
        this.Storage = null;            // local storage   
        this.TabScroller = null;        // controls the scrolling
        this.Settings = null;
        this.MarkerEditor = null;
        this.MarkerBar = null;
        this.Tab = null;
    }

    SortMarkers() {
        // sort markers by time, low to high
        this.markers.sort((a,b) => a.time - b.time);
    }

    GetMarkerByLine(line) {
        for(let m of this.markers) {
            if (m.line == line)
            return m;
        }
        return null;
    }

    GetMarkerByTime(time) {
        for(let m of this.markers) {
            if (m.time == time)
            return m;
        }
        return null;
    }

    Display() {
        
        this.Tab.Display();
        this.MarkerBar.Display();
    }
}