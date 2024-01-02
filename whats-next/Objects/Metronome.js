class Metronome {
    constructor(context) {
        this.context = context;
    }

    Play() {
        if (DEBUG2) console.log("play");
        this.context.Settings.SetSequenceFromElem();
        this.PlayNextBeat();
    }

    PlayNextBeat() {
        if (DEBUG2) console.log("playNextBeat");
        if (!this.context.playing) return;
        this.context.Settings.LoadSettings();
        this.ActivateBeat(this.context.beat);

        setTimeout(() => this.PlayNextBeat(), 60000 / this.context.bpm);
    }

    Pause() {

    }

    ActivateBeat(n) {
        if (DEBUG2) console.log("activateBeat", n);

        let lag = this.context.Settings.lag;
        console.log(lag);

        setTimeout(() => {
            console.log("lag", n);
            this.context.MetronomeDisplay.DisplayBeats(this.context.beats);
            this.context.MetronomeDisplay.ActivateBeat(n);
            if (n == 1) this.SetNextMeasure();
            this.context.beat++;
            if (this.context.beat > this.context.beats) {
                this.context.beat = 1;
                this.context.beats = this.context.nextBeats;
            }
        }, lag < 0 ? -lag : 0);

        if (this.context.Settings.onlyPlay1 && n != 1) return;
        this.PlayTick(n == 1 && this.context.Settings.accent1);
    }

    PlayTick(accent) {
        if (DEBUG2) console.log("playTick", accent);
        let tick = new Audio();
        tick.src = (accent ? "Audio/beat-1.wav" : "Audio/beat-2.wav");
        let lag = this.context.Settings.lag;
        setTimeout(() => tick.play(), lag > 0 ? lag : 0);
    }

    SetNextMeasure() {
        if (DEBUG2) console.log("setNextMeasure");
        let next = 0;
        if (this.context.Settings.useSequence) {
            next = this.context.Settings.sequence.shift();
            this.context.Settings.sequence.push(next);
        }
        else {
            let freqs = this.context.Settings.GetBeatFrequencies();
            if (!freqs.length) freqs = [4];
            next = freqs[Math.floor(Math.random() * freqs.length)];
        }

        this.context.nextBeats = next;
        document.querySelector(".next-beats").innerText = next;
    }
}