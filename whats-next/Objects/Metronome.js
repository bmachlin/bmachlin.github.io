class Metronome {
    constructor(context) {
        this.context = context;
    }

    Play() {
        if (DEBUG2) console.log("play");
        this.PlayNextBeat();
    }

    PlayNextBeat() {
        if (DEBUG2) console.log("playNextBeat");
        if (!this.context.playing) return;
        this.context.Settings.LoadSettings();
        this.ActivateBeat(this.context.beat);
        this.context.beat++;
        if (this.context.beat > this.context.beats) {
            this.context.beat = 1;
            this.context.beats = this.context.nextBeats;
        }
        setTimeout(() => this.PlayNextBeat(), 60000 / this.context.bpm);
    }

    Pause() {

    }

    ActivateBeat(n) {
        if (DEBUG2) console.log("activateBeat", n);
        this.context.beat = n;
        this.context.MetronomeDisplay.DisplayBeats(this.context.beats);
        this.context.MetronomeDisplay.ActivateBeat(n);
        if (n == 1) {
            this.SetNextMeasure();
            this.PlayTick(n == 1 && this.context.Settings.accent1);
        }
        else {
            if (this.context.Settings.onlyPlay1) return;
            this.PlayTick(false);
        }
    }

    PlayTick(accent) {
        if (DEBUG2) console.log("playTick", accent);
        let tick = new Audio();
        tick.src = (accent ? "Audio/beat-1.wav" : "Audio/beat-2.wav");
        setTimeout(() => tick.play(), this.context.Settings.lag);
    }
    
    SetNextMeasure() {
        if (DEBUG2) console.log("setNextMeasure");
        let freqs = this.context.Settings.GetBeatFrequencies();
        if (!freqs.length) freqs = [4];
        let beats = freqs[Math.floor(Math.random() * freqs.length)];
        
        this.context.nextBeats = beats;
        document.querySelector(".next-beats").innerText = beats;
    }
}