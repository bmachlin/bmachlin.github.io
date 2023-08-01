class Scoring {
    constructor(minWordLength, maxWordLength) {
        this.minlen = minWordLength;
        this.maxlen = maxWordLength;
        this.system = 0;
    }

    GetWordScore(word) {
        switch(this.system) {
            case 0:
                return this.System0(word);
            default:
                return this.System0(word);
        }
    }

    GetFoundAllBonus() {
        switch(this.system) {
            case 0:
                return 5;
            default:
                return 5;
        }
    }

    System0(word) {
        let length = word.length;
        return 3 + length - this.minlen;
    }
}