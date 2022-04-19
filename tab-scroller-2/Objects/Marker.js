class Marker {
    // time = seconds into song to activate marker
    // position = vertical position marker should be when activated
    // line = line number
    // scroll = type of scroll to get to marker
    // artificial = is this marker hidden/created for control purposes e.g. start/end
    constructor(time, position, scrollStyle, line=-1, artificial=false) {
        this.time = Math.round(time);
        this.minutes = Math.floor(time/60);
        this.seconds = Math.floor(time%60);
        this.position = position;
        this.scroll = scrollStyle;
        this.line = line;
        this.artificial = artificial;
        this.inactiveColor = "black";
        this.activeColor = "red";
        this.activated = false;
        this.element = null;
    }

    SetTime(time) {
        this.time = Math.round(time);
        this.minutes = Math.floor(time/60);
        this.seconds = Math.floor(time%60);
    }

    TimeString() {
        return `${this.minutes.toString().padStart(2, '0')}:${this.seconds.toString().padStart(2, '0')}`;
    }

    MarkerString() {
        return `#[${this.minutes.toString().padStart(2, '0')}:${this.seconds.toString().padStart(2, '0')} ${Math.round(this.position*100)} ${this.scroll == "scroll" ? 's' : 'n'}]`;
    }

    ShouldActivate(time) {
        return time >= this.time;
    }

    Activate() {
        // console.log("activate marker " + this.time);
        if (!this.activated) {
            this.SetColor(this.activeColor);
            this.activated = true;
        }
    }

    Deactivate() {
        // console.log("deactivate marker " + this.time);
        if (this.activated) {
            this.SetColor(this.inactiveColor);
            this.activated = false;
        }
    }

    SetColor(color) {
        if (!this.artificial) {
            this.element?.setAttribute("style", `color: ${color}`);
        }
    }

    GetElement(remake=false) {
        if (this.element != null && !remake) {
            return this.element;
        }
        
        this.element = document.createElement("div");
        this.element.setAttribute("class", "marker");
        this.element.innerHTML = "X";
        return this.element;
    }
}
