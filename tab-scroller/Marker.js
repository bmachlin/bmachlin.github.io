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
        this.setLine(line);
    }

    setLine(line) {
        this.line = line;
        this.artificial = line < 1 || line >= document.getElementById('tabText').value.split("\n").length;
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
            console.log(this.line, this.time)
            document.getElementById("tab-display").children[this.line].setAttribute("style", `color: ${color}`);
        }
    }
}
