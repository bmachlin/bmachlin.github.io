class GameActions {
    constructor(context) {
        this.context = context;
        this.Game = this.context.Game;
        this.Dict = this.context.Dict;
    }

    //#region game actions

    NewGame() {
        // remove focus from new game button so that hitting enter doesn't start a new game again
        if (document.activeElement && document.activeElement.id == "newGameButton") {
            document.body.focus();
        }

        this.context.Game = new Game(this.context.Settings.minWordLength.value, this.context.Settings.maxWordLength.value);
        this.Game = this.context.Game;
        this.NewLevel();
    }

    NewLevel() {
        this.Game.level += 1;
        this.Game.foundTargetWord = false;

        let word = this.Dict.GetWordOfLength(this.Game.maxLetters);
        let tries = 0;
        while (this.Game.foundWords.has(word) && tries < 10000) {
            word = this.Dict.GetWordOfLength(this.context.Settings.numLetters);
        }

        let subWords = this.Dict.GetAllSubWords([...word]);
        subWords = [...subWords].filter(word => word.length >= this.Game.minLetters);
        
        this.Game.letters = [...word];
        this.Game.findableWords = new Set(subWords);
        this.Game.remainingLetters = [...this.Game.letters];
        this.Game.ShuffleLetters();
        this.Game.unfoundWords = new Set(subWords.filter(w => !this.Game.foundWords.has(w)));
        this.context.Renderer.RenderLetters(true);
        this.context.Renderer.RenderWord(true);
        this.context.Renderer.RenderFindableWords();
    }

    EndGame() {
        let finalWords = [...this.Game.findableWords].filter(w => w.length == this.Game.maxLetters);
        alert(`Game Over! Score: ${this.Game.upTimerSec}.\nFinal word(s): ${finalWords}`);
    }

    //#endregion

    //#region word actions

    Shuffle() {
        this.Game.ShuffleLetters();
        this.context.Renderer.RenderLetters();
    }
    
    Submit() {
        let word = this.Game.currentWord.join("");
        if (DEBUG2) console.log("Submitting current word", word);
        if (this.Dict.IsWord(word) && !this.Game.foundWords.has(word) && this.Game.findableWords.has(word)) {
            this.Game.foundWords.add(word);
            this.Game.unfoundWords.delete(word);
            if (word.length == this.Game.maxLetters) {
                this.Game.foundTargetWord = true;
            }
            let score = this.context.Scoring.GetWordScore(word);
            this.Game.downTimer += score * 1000;
            if (this.Game.HasFoundAllWords()) {
                this.Game.downTimer += this.context.Scoring.GetFoundAllBonus() * 1000;
            }
            this.context.Renderer.RenderFindableWords();
        }
        else {

        }
        this.Clear();
    }

    Clear() {
        if (DEBUG2) console.log("Clear current word");
        this.Game.remainingLetters.push(...this.Game.currentWord);
        this.Game.currentWord = [];
        this.context.Renderer.RenderLetters();
        this.context.Renderer.RenderWord();
    }

    AddLetter(letter) {
        if (DEBUG2) console.log("AddLetter", letter);
        if (!this.Game.CanAddLetter(letter)) {
            return;
        }
        this.Game.remainingLetters.splice(this.Game.remainingLetters.indexOf(letter),1);
        this.Game.currentWord.push(letter);
        this.context.Renderer.RenderLetters();
        this.context.Renderer.RenderWord();
    }

    Backspace() {
        if (DEBUG2) console.log("Backspace");
        if (!this.Game.currentWord.length) {
            // currentWord is empty
            return;
        }
        let removed = this.Game.currentWord.pop();
        this.Game.remainingLetters.push(removed);
        this.context.Renderer.RenderLetters();
        this.context.Renderer.RenderWord();
    }

    //#endregion

    //#region time actions

    IncrementTimers(interval=1000) {
        this.Game.downTimer -= interval;
        this.Game.upTimer += interval;
    }

    //#endregion
}