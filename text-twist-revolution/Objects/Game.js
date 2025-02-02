class Game {
    constructor(min,max) {
        this.letters = [];                       // current level letters to unscramble
        this.foundWords = new Set();             // all words found by player
        this.findableWords = new Set();          // all words makeable with <letters>
        this.unfoundWords = new Set();           // findable words that haven't been found
        this.foundTargetWord = false;            // has the player found a target word (and can move to next level)
        this.downTimer = 60000;                  // timer counting down until game over (ms)
        this.upTimer = 0;                        // timer counting up for total time (aka score) (ms)
        this.level = 0;

        this.minLetters = min;
        this.maxLetters = max;
        
        this.lastSubmitted = [];
        this.currentWord = [];                   // letters waiting to be submitted
        this.remainingLetters = [];              // letters not used in current word
    }

    IsGameOver() {
        return this.downTimer <= 0;
    }

    HasFoundAllWords() {
        for (let word of this.findableWords) {
            if (!this.foundWords.has(word))
                return false;
        }
        return true;
    }

    ShuffleLetters() {
        for (let i = this.remainingLetters.length-1; i > 0; i--) {
            let j = Math.floor(Math.random()*i);
            let temp = this.remainingLetters[j];
            this.remainingLetters[j] = this.remainingLetters[i];
            this.remainingLetters[i] = temp;
        }
    }

    get downTimerSec() {
        return Math.round(this.downTimer/1000);
    }

    get upTimerSec() {
        return Math.round(this.upTimer/1000);
    }

    /////////////
    // HELPERS //
    /////////////
    CanAddLetter(letter) {
        let lettersCopy = [...this.letters];
    
        for (let w of this.currentWord) {
            let i = lettersCopy.indexOf(w);
            if (i != -1) {
                lettersCopy.splice(i,1);
            }
        }
        let answer = lettersCopy.indexOf(letter) !== -1;
        if (DEBUG2) console.log(`Can add ${letter}?`, answer)
        return answer;
    }
}