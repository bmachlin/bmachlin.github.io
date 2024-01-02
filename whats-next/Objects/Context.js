class Context {
    constructor() {
        this.Metronome = new Metronome(this);
        this.MetronomeDisplay = new MetronomeDisplay(document.querySelector("#metronome"), 4);
        // this.displayControl = new DisplayControl();
        this.Settings = new Settings(this);

        this.playing = false;
        this.beat = 1;
        this.beats = 4;
        this.nextBeats;
        this.bpm;
    }
}