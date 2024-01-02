class MetronomeDisplay {
    constructor(elem) {
        this.elem = elem;
        this.measureElem = elem.querySelector(".measure");
        this.beatNowElem = elem.querySelector("#this-beat-now");
        this.beatTotalElem = elem.querySelector("#this-beat-total");
        this.beats = 4;
        this.DisplayBeats();
    }

    DisplayBeats(n) {
        this.beats = n;
        this.measureElem.replaceChildren();
        for (let i = 0; i < n; i++) {
            let beat = document.createElement("div");
            beat.classList.add("beat");
            // beat.style.width = 100/(n + 3) + "%";
            this.measureElem.appendChild(beat);
        }
        this.beatNowElem.innerText = "-";
        this.beatTotalElem.innerText = "-";
    }

    ActivateBeat(n) {
        let i = 1;
        for (let b of this.measureElem.getElementsByClassName("beat")) {
            if (n == i) b.classList.add("active");
            else b.classList.remove("active");
            i++;
        }
        if (n < 1 || n > this.beats) n = "-";
        this.beatNowElem.innerText = n;
        this.beatTotalElem.innerText = this.beats;
    }
}