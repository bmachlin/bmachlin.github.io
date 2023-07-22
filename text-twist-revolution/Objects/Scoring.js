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

    System0(word) {
        let length = word.length;
        return 2 + length - this.minlen;
    }
}