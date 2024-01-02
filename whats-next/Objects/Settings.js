class Settings {
    constructor(context) {
        this.context = context;
        
        this.accent1 = true;
        this.onlyPlay1 = false;
        this.useSequence = false;
        this.sequence = [];
    }

    LoadSettings() {
        this.SetBpmFromElem();
        this.SetAccent1FromElem();
        this.SetOnlyPlay1FromElem();
        this.SetUseSequenceFromElem();
    }

    SetBpmFromElem() {
        this.context.bpm = Math.min(Math.max(parseInt(document.querySelector("#bpmInput").value), 40), 300);
    }

    SetAccent1FromElem() {
        this.accent1 = document.querySelector("#accent1Input").checked;
    }

    SetOnlyPlay1FromElem() {
        this.onlyPlay1 = document.querySelector("#onlyPlay1Input").checked;
    }

    SetUseSequenceFromElem() {
        this.useSequence = document.querySelector("#useSequenceInput").checked;
    }

    SetSequenceFromElem() {
        let sequence = document.querySelector(".beat-sequence-text").value;
        sequence = sequence.replace(/[^0-9]/g, " ");
        sequence = sequence.replace(/\s+/g, ",");
        this.sequence = sequence.split(",").map(x => parseInt(x));
        console.log(this.sequence);
    }

    RandomizeFreqs() {
        if (DEBUG2) console.log("randomizeFreqs");
        let freqList = document.querySelector(".beat-frequencies");
        for (let bf of freqList.children) {
            bf.children[1].value = Math.floor(Math.random() * 10);
        }
    }
    
    ZeroFreqs() {
        if (DEBUG2) console.log("zeroFreqs");
        let freqList = document.querySelector(".beat-frequencies");
        for (let bf of freqList.children) {
            bf.children[1].value = 0;
        }
    }

    EqualFreqs() {
        if (DEBUG2) console.log("equalFreqs");
        let freqList = document.querySelector(".beat-frequencies");
        let freqs = freqList.children.length;
        for (let bf of freqList.children) {
            bf.children[1].value = 10 / freqs;
        }
    }

    GetBeatFrequencies() {
        if (DEBUG2) console.log("getBeatFrequencies");
        let freqList = document.querySelector(".beat-frequencies");
        let beatFreq = [];
        for (let bf of freqList.children) {
            let beat = parseInt(bf.children[0].innerText);
            let freq = parseInt(bf.children[1].value);
            beatFreq = beatFreq.concat(new Array(freq).fill(beat));
        }
        return beatFreq;
    }
}