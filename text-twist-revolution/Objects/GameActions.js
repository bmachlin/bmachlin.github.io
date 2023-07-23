class GameActions {
    constructor(context) {
        this.context = context;
        this.Game = this.context.Game;
        this.Dict = this.context.Dict;
    }

    //#region game actions

    NewGame() {
        this.NewLevel();
    }

    NewLevel() {
        this.Game.level += 1;
        this.Game.foundTargetWord = false;

        let letters = this.Dict.GetWordOfLength(this.context.Settings.numLetters);
        let tries = 0;
        while (this.Game.foundWords.has(letters) && tries < 10000) {
            letters = this.Dict.GetWordOfLength(this.context.Settings.numLetters);
        }

        let subWords = this.Dict.GetAllSubWords([...letters]);
        subWords = [...subWords].filter(word => word.length >= this.context.Settings.minWordLength);
        
        this.Game.letters = [...letters];
        this.Game.findableWords = new Set(subWords);
        this.Game.ShuffleLetters();
        this.Game.unfoundWords = new Set(subWords.filter(w => !this.Game.foundWords.has(w)));
    }

    EndGame() {
        let finalWords = [...this.Game.findableWords].filter(w => w.length == this.context.Settings.numLetters);
        alert(`Game Over! Score: ${this.Game.upTimerSec}.\nFinal word(s): ${finalWords}`);
    }

    //#endregion

    //#region word actions
    
    Submit() {
        if (DEBUG) console.log("Submitting current word");
        let word = this.Game.currentWord.join("");
        if (this.Dict.IsWord(word) && !this.Game.foundWords.has(word) && this.Game.findableWords.has(word)) {
            this.Game.foundWords.add(word);
            this.Game.unfoundWords.delete(word);
            if (word.length == this.context.Settings.numLetters) {
                this.Game.foundTargetWord = true;
            }
            let score = this.context.Scoring.GetWordScore(word);
            this.Game.downTimer += score * 1000;
        }
        else {

        }
        this.Clear();
    }

    Clear() {
        if (DEBUG2) console.log("Clear current word");
        this.Game.currentWord = [];
    }

    AddLetter(letter) {
        if (DEBUG2) console.log("AddLetter", letter);
        if (!this.Game.CanAddLetter(letter)) {
            return;
        }
        this.Game.currentWord.push(letter);
    }

    Backspace() {
        if (DEBUG2) console.log("Backspace");
        if (!this.Game.currentWord.length) {
            // currentWord is empty
            return;
        }
        return this.Game.currentWord.pop();
    }

    //#endregion

    //#region time actions

    IncrementTimers(interval=1000) {
        this.Game.downTimer -= interval;
        this.Game.upTimer += interval;
    }

    //#endregion
}