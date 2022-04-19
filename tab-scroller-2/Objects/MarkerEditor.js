class MarkerEditor {
    // id the html element id to use for the editor
    // markerBar = the html element
    constructor(id, context) {
        this.id = id;
        this.context = context;
        this.element = document.getElementById(this.id);
        this.line = 0;
    }

    Open(line) {
        // console.log("open at line", line);
        if (line < 0 || line > this.context.Tab.lines.length - 1) { return; }
        this.line = line;

        this.context.MarkerBar.elements[line].style.backgroundColor = "blue";
        let marker = this.context.GetMarkerByLine(line);
        if (marker != null) {
            this.AddMarkerInfo(marker);
        } else {
            this.ClearInfo();
        }
        
        this.element.setAttribute("style",
            `top: ${(line+1)*1.1}em;
            left: 15px;`
        );
        this.element.hidden = false;
    }

    Close() {
        this.context.MarkerBar.elements[this.line].style.backgroundColor = null;
        this.element.hidden = true;
    }

    Click(line) {
        // console.log("click", line)
        if (this.line != line) {
            this.Close();
            this.Open(line);
        } else if (this.element.hidden) {
            this.Open(line);
        } else {
            this.Close();
        }
    }

    AddMarkerInfo(marker) {
        // console.log("add info for", marker);
        document.getElementById("editorMinutesInput").value = marker.minutes;
        document.getElementById("editorSecondsInput").value = marker.seconds;
        document.getElementById("positionInput").value = marker.position;
        document.getElementById("scrollSmooth").checked = marker.scroll === "scroll";
        document.getElementById("scrollSnap").checked = marker.scroll === "snap";
    }

    ClearInfo() {
        // console.log("clear editor info");
        document.getElementById("editorMinutesInput").value = null;
        document.getElementById("editorSecondsInput").value = null;
        document.getElementById("positionInput").value = 0.50;
        document.getElementById("scrollSmooth").checked = true;
    }

    Remove() {
        // console.log("remove", this.line)
        let marker = this.context.GetMarkerByLine(this.line);
        if (marker != null) {
            this.context.markers = this.context.markers.filter(m => m.line != this.line);
        }

        let lineText = this.context.Tab.lines[this.line];
        lineText = lineText.replace(this.context.markerRegex, "");
        if (lineText[lineText.length-1] == " ") lineText = lineText.slice(0,-1); // remove trailing space
        
        this.context.Tab.lines[this.line] = lineText;
        this.context.Tab.SetLines();
        this.context.Display();

        this.Close();
    }

    Save() {
        let minutes = parseInt(document.getElementById("editorMinutesInput").value);
        if (isNaN(minutes)) { minutes = 0; }
        let seconds = parseInt(document.getElementById("editorSecondsInput").value);
        if (isNaN(seconds)) { seconds = 0; }
        let position = parseFloat(document.getElementById("positionInput").value);
        if (isNaN(position)) { position = 0.5; }
        let scrollSmooth = document.getElementById("scrollSmooth").checked;
        let scrollSnap = document.getElementById("scrollSnap").checked;
        let time = minutes * 60 + seconds;
        console.log("save editor", minutes, seconds, position, scrollSmooth, scrollSnap);

        // validate info
        if (minutes > 99 || minutes < 0) { console.log("minutes bad", minutes); return; }
        if (seconds > 59 || seconds < 0) { console.log("seconds bad", seconds); return; }
        if (minutes == 0 && seconds == 0) { console.log("time 0 bad"); return; }
        if (position > 1 || position < 0) { console.log("position bad", position); return; }
        if ((!scrollSmooth && !scrollSnap) || (scrollSmooth && scrollSnap)) { console.log("scroll bad", scrollSmooth, scrollSnap); return; }
        let match = this.context.GetMarkerByTime(time);
        if (match != null && match.line != this.line) { console.log("timeline bad", time, this.line, match); return; }

        // update objects
        let marker = this.context.GetMarkerByLine(this.line);
        let newmarker = false;
        if (marker != null) {
            // update marker
            marker.SetTime(time);
            marker.position = position;
            marker.scroll = scrollSmooth ? "scroll" : "snap";
            this.context.SortMarkers();
        } else {
            // add new marker
            newmarker = true;
            marker = new Marker(time, position, scrollSmooth ? "scroll" : "snap", this.line);
            this.context.markers.push(marker);
            this.context.SortMarkers();
        }

        let lineText;
        // update tab text
        if (!newmarker) {
            // replace marker text with updated info
            lineText = this.context.Tab.lines[this.line].replace(this.context.markerRegex, marker.MarkerString());
        } else {
            // append new marker text to end of line
            // future idea: add option to add marker on a new line
            lineText = this.context.Tab.lines[this.line] + " " + marker.MarkerString();
        }

        this.context.Tab.lines[this.line] = lineText;
        this.context.Tab.SetLines();
        this.context.Display();

        this.Close();
    }
}