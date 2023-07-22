class Context {
    constructor() { 
        this.running = false;           // point-of-truth play/pause status
        this.runtime = 0;               // point-of-truth time
        this.interval = 20;             // frequency of run cycle in ms
        this.Timer = null;              // the run cycle controller
        this.Storage = null;            // local storage   
        this.Settings = null;
        this.Game = null;
        this.GameActions = null;
        this.Scoring = null;
        this.Renderer = null;
    }
}