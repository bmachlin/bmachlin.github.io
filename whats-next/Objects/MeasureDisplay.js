class MeasureDisplay {
    constructor(elem, beats) {
        this.elem = elem;
        this.beats = beats;
        this.currentBeat = 0;
        this.DisplayBeats();
    }

    DisplayBeats() {
        this.elem.replaceChildren();
        for (let i = 0; i < this.beats; i++) {
            let beat = document.createElement("div");
            beat.classList.add("beat");
            // beat.style.width = 100/(this.beats + 3) + "%";
            this.elem.appendChild(beat);
        }
    }

    SetActiveBeat(n) {
        let i = 1;
        for (let b of this.elem.getElementsByClassName("beat")) {
            if (n == i) b.classList.add("active");
            else b.classList.remove("active");
            i++;
        }
    }
}