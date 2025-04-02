class Scoring {
    EASY = 0;
    MEDIUM = 1;
    HARD = 2;

    constructor(minWordLength, maxWordLength, system) {
        this.minlen = minWordLength;
        this.maxlen = maxWordLength;
        switch (system.toLowerCase()) {
            case "easy":
                this.system = this.EASY;
                break;
            case "medium":
                this.system = this.MEDIUM;
                break;
            case "hard":
                this.system = this.HARD;
                break;
        }
    }

    GetWordScore(word) {
        switch (this.system) {
            case this.EASY:
                return this.Easy(word);
            case this.MEDIUM:
                return this.Medium(word);
            case this.HARD:
                return this.Hard(word);
            default:
                return this.Easy(word);
        }
    }

    GetFoundAllBonus() {
        switch (this.system) {
            case EASY:
                return 5;
            case this.MEDIUM:
                return 3;
            case this.HARD:
                return 1;
            default:
                return 5;
        }
    }

    Easy(word) {
        console.log("esay")
        let length = word.length;
        return 3 + length - this.minlen;
    }

    Medium(word) {
        console.log("m")

        let length = word.length;
        return 2 + length - this.minlen;
    }

    Hard(word) {
        console.log("h")

        let length = word.length;
        return 1 + length - this.minlen;
    }
}